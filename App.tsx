import React, { useState, useCallback, useEffect, useRef } from 'react';
import { AutocompleteRequest, AutocompleteSuggestion, MarkerData, PlaceDetails, LocationBias, LocationRestriction, LatLng } from './types';
import { fetchAutocomplete, fetchPlaceDetails, buildCurlRequest } from './services/placesService';
import { pointInRect, pointInCircle } from './utils/geoUtils';
import MapComponent from './components/MapComponent';
import RequestForm from './components/RequestForm';
import Legend from './components/Legend';
import ResultsPanel from './components/ResultsPanel';

const initialRequest: AutocompleteRequest = {
    input: 'San Francisco',
    languageCode: '',
    includedPrimaryTypes: [],
    includePureServiceAreaBusinesses: null,
    includeQueryPredictions: null,
    includedRegionCodes: [],
    inputOffset: undefined,
    regionCode: '',
    origin: null,
    locationBias: null,
    locationRestriction: null,
};

const App: React.FC = () => {
    const [apiKey, setApiKey] = useState<string>(() => localStorage.getItem('placesApiKey') || '');
    const [mapApiKey, setMapApiKey] = useState<string>(() => {
        const storedApiKey = localStorage.getItem('placesApiKey') || '';
        // A basic validation check for Google API key length.
        // Standard keys are 39 characters.
        if (storedApiKey.length >= 39) {
            return storedApiKey;
        }
        return '';
    });
    const [fieldMask, setFieldMask] = useState<string>('displayName,formattedAddress,location,types,id');
    const [request, setRequest] = useState<AutocompleteRequest>(initialRequest);
    const [responseObject, setResponseObject] = useState<any | null>(null);
    const [curlCommand, setCurlCommand] = useState<string>('');
    const [warning, setWarning] = useState<string>('');
    const [markers, setMarkers] = useState<MarkerData[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [selectedPlaceId, setSelectedPlaceId] = useState<string | null>(null);
    const [drawingFor, setDrawingFor] = useState<'bias' | 'restriction' | null>(null);
    const [submittedRequest, setSubmittedRequest] = useState<AutocompleteRequest | null>(null);
    const [hasBeenCleared, setHasBeenCleared] = useState<boolean>(false);
    const [isPlacingOrigin, setIsPlacingOrigin] = useState<boolean>(false);
    const prevInputRef = useRef<string>(initialRequest.input);

    const [isLeftPanelCollapsed, setIsLeftPanelCollapsed] = useState(false);
    const [isRightPanelCollapsed, setIsRightPanelCollapsed] = useState(false);

    const leftPanelRef = useRef<HTMLDivElement>(null);
    const rightPanelRef = useRef<HTMLDivElement>(null);
    const [mapPadding, setMapPadding] = useState({ top: 40, right: 40, bottom: 40, left: 40 });

    const calculateMapPadding = useCallback(() => {
        const PADDING_BASE = 40; // Base viewport padding
        const PADDING_OFFSET = 16; // p-4 on the container
        const COLLAPSED_BUTTON_WIDTH = 32;

        let left = PADDING_BASE;
        if (leftPanelRef.current) {
            left = isLeftPanelCollapsed
                ? PADDING_OFFSET + COLLAPSED_BUTTON_WIDTH + PADDING_BASE
                : leftPanelRef.current.offsetWidth + PADDING_OFFSET + PADDING_BASE;
        }

        let right = PADDING_BASE;
        // Check for responseObject to see if the panel exists
        if (responseObject) {
            if (rightPanelRef.current) {
                 right = isRightPanelCollapsed
                    ? PADDING_OFFSET + COLLAPSED_BUTTON_WIDTH + PADDING_BASE
                    : rightPanelRef.current.offsetWidth + PADDING_OFFSET + PADDING_BASE;
            }
        }
        
        setMapPadding({
            top: PADDING_BASE,
            bottom: PADDING_BASE,
            left,
            right,
        });
    }, [isLeftPanelCollapsed, isRightPanelCollapsed, responseObject]);

    useEffect(() => {
        // Debounce resize handler
        let timeoutId: ReturnType<typeof setTimeout>;
        const handleResize = () => {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(calculateMapPadding, 100);
        };

        // Calculate on mount and when dependencies change
        calculateMapPadding();

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);

    }, [calculateMapPadding]);

    useEffect(() => {
        localStorage.setItem('placesApiKey', apiKey);
    }, [apiKey]);

    useEffect(() => {
        const handler = setTimeout(() => {
            // A basic validation check for Google API key length.
            // Standard keys are 39 characters. This prevents API calls
            // with incomplete keys during typing.
            if (apiKey.length >= 39) {
                // Avoid reloading the script if the valid key hasn't changed.
                setMapApiKey(prev => (prev === apiKey ? prev : apiKey));
            } else {
                // If key becomes invalid or is cleared, reset the map.
                setMapApiKey('');
            }
        }, 500); // Debounce time in milliseconds.

        return () => {
            clearTimeout(handler);
        };
    }, [apiKey]);


    useEffect(() => {
        if (request.locationBias && request.locationRestriction) {
            setWarning('Both locationBias and locationRestriction were provided — dropping locationBias and keeping locationRestriction (APIs expect at most one).');
        } else {
            setWarning('');
        }
        // When location settings change, clear any active selection.
        setSelectedPlaceId(null);
    }, [request.locationBias, request.locationRestriction]);

    useEffect(() => {
        // When user changes input away from default, clear any default location shapes
        if (request.input !== 'San Francisco' && prevInputRef.current === 'San Francisco') {
            if (request.locationBias || request.locationRestriction) {
                setRequest(prev => ({
                    ...prev,
                    locationBias: null,
                    locationRestriction: null,
                }));
            }
        }
        prevInputRef.current = request.input;
    }, [request.input, request.locationBias, request.locationRestriction]);
    
    useEffect(() => {
        // When a new response is received, ensure the results panel is visible.
        if (responseObject?.suggestions) {
            setIsRightPanelCollapsed(false);
        }
    }, [responseObject]);

    useEffect(() => {
        // When a place is selected from the map or list, ensure the results panel is visible.
        if (selectedPlaceId) {
            setIsRightPanelCollapsed(false);
        }
    }, [selectedPlaceId]);

    const handleShapeUpdateFromMap = useCallback((
        locType: 'bias' | 'restriction',
        shape: 'circle' | 'rectangle' | null,
        data: any
    ) => {
        const locationKey = locType === 'bias' ? 'locationBias' : 'locationRestriction';

        if (shape === null) {
            setRequest(prev => ({ ...prev, [locationKey]: null }));
            return;
        }

        if (shape === 'rectangle') {
            const [sw, ne] = data; // [[lng, lat], [lng, lat]]
            const newRect = {
                low: { latitude: sw[1], longitude: sw[0] },
                high: { latitude: ne[1], longitude: ne[0] },
            };
            setRequest(prev => ({ ...prev, [locationKey]: { rectangle: newRect } }));
        } else if (shape === 'circle') {
            const { center, radius } = data; // { center: [lng, lat], radius: meters }
            const newCircle = {
                center: { latitude: center[1], longitude: center[0] },
                radius,
            };
            setRequest(prev => ({ ...prev, [locationKey]: { circle: newCircle } }));
        }
    }, [setRequest]);

    const handleOriginUpdate = useCallback((newOrigin: LatLng | null) => {
        setRequest(prev => ({ ...prev, origin: newOrigin }));
    }, []);

    const handleSubmit = useCallback(async () => {
        if (!apiKey) {
            alert('Please set your API key.');
            return;
        }
        if (!request.input) {
            alert('Input is required.');
            return;
        }
        if (!fieldMask) {
            alert('FieldMask is required for Place Details.');
            return;
        }

        const checkIsEmptyShape = (loc: LocationBias | LocationRestriction | null): boolean => {
            if (!loc) return false;
            if (loc.circle) {
                const { center, radius } = loc.circle;
                return center.latitude === 0 && center.longitude === 0 && radius === 0;
            }
            if (loc.rectangle) {
                const { low, high } = loc.rectangle;
                return low.latitude === 0 && low.longitude === 0 && high.latitude === 0 && high.longitude === 0;
            }
            return false;
        };

        if (checkIsEmptyShape(request.locationBias)) {
            alert('Location Bias is enabled but its values are not set. Please enter coordinates or draw on the map.');
            return;
        }
        if (checkIsEmptyShape(request.locationRestriction)) {
            alert('Location Restriction is enabled but its values are not set. Please enter coordinates or draw on the map.');
            return;
        }

        setLoading(true);
        setMarkers([]);
        setSelectedPlaceId(null);
        setResponseObject({ message: '(waiting...)'});
        setHasBeenCleared(false);
        setIsPlacingOrigin(false);
        setCurlCommand('');

        let effectiveRequest = { ...request };
        if (request.locationBias && request.locationRestriction) {
            effectiveRequest.locationBias = null;
        }
        
        setSubmittedRequest(effectiveRequest);

        try {
            const data = await fetchAutocomplete(effectiveRequest, apiKey);
            setResponseObject(data);
            setCurlCommand(buildCurlRequest(effectiveRequest, apiKey));

            if (data.suggestions && data.suggestions.length > 0) {
                const markerPromises = data.suggestions.map(async (suggestion: AutocompleteSuggestion, index: number): Promise<MarkerData | null> => {
                    const placePrediction = suggestion.placePrediction;
                    if (!placePrediction || !placePrediction.placeId) return null;

                    try {
                        const details: PlaceDetails = await fetchPlaceDetails(placePrediction.placeId, fieldMask, apiKey);
                        const lat = details.location?.latitude;
                        const lng = details.location?.longitude;

                        if (lat !== undefined && lng !== undefined) {
                            let state: MarkerData['state'] = 'outside';
                            if (effectiveRequest.locationRestriction) {
                                if (effectiveRequest.locationRestriction.rectangle && pointInRect(lat, lng, effectiveRequest.locationRestriction.rectangle)) state = 'insideRestr';
                                else if (effectiveRequest.locationRestriction.circle && pointInCircle(lat, lng, effectiveRequest.locationRestriction.circle)) state = 'insideRestr';
                            } else if (effectiveRequest.locationBias) {
                                if (effectiveRequest.locationBias.rectangle && pointInRect(lat, lng, effectiveRequest.locationBias.rectangle)) state = 'insideBias';
                                else if (effectiveRequest.locationBias.circle && pointInCircle(lat, lng, effectiveRequest.locationBias.circle)) state = 'insideBias';
                            }

                            return {
                                position: { lat, lng },
                                title: details.displayName?.text || placePrediction.text.text,
                                label: String(index + 1),
                                state,
                                details,
                                placePrediction,
                            };
                        }
                        return null;
                    } catch (detailsError) {
                        console.error(`Error fetching details for ${placePrediction.placeId}:`, detailsError);
                        return null;
                    }
                });

                const resolvedMarkers = await Promise.all(markerPromises);
                const newMarkers = resolvedMarkers.filter((marker): marker is MarkerData => marker !== null);
                setMarkers(newMarkers);
            }

        } catch (error: any) {
            setResponseObject({ error: error.message || String(error) });
            console.error(error);
        } finally {
            setLoading(false);
        }
    }, [request, apiKey, fieldMask]);
    
    const handleClear = useCallback(() => {
        setMarkers([]);
        setSelectedPlaceId(null);
        setResponseObject(null);
        setCurlCommand('');
        setWarning('');
        setHasBeenCleared(true);
        setSubmittedRequest(null);
        setIsPlacingOrigin(false);
        setRequest(prev => ({
            ...prev,
            origin: null,
            locationBias: null,
            locationRestriction: null,
        }));
    }, [setRequest]);

    return (
        <div className="w-screen h-screen relative overflow-x-hidden">
            <div className="absolute inset-0 z-0">
                 <MapComponent 
                    apiKey={mapApiKey} 
                    markers={markers} 
                    origin={request.origin}
                    bias={request.locationBias}
                    restriction={request.locationRestriction}
                    selectedPlaceId={selectedPlaceId}
                    onSelectPlace={setSelectedPlaceId}
                    drawingFor={drawingFor}
                    setDrawingFor={setDrawingFor}
                    onShapeUpdate={handleShapeUpdateFromMap}
                    request={request}
                    isPlacingOrigin={isPlacingOrigin}
                    setIsPlacingOrigin={setIsPlacingOrigin}
                    onOriginUpdate={handleOriginUpdate}
                    padding={mapPadding}
                 />
            </div>
            
            {/* Safe area for floating panels to prevent shadow clipping */}
            <div className="absolute inset-0 p-4 pointer-events-none">
                {/* Left Panel */}
                <div ref={leftPanelRef} className={`absolute top-0 left-0 z-10 w-full max-w-md h-full transition-transform duration-300 ease-in-out pointer-events-auto ${isLeftPanelCollapsed ? '-translate-x-full' : 'translate-x-0'}`}>
                    <div className="relative w-full h-full bg-white rounded-xl shadow-2xl flex flex-col">
                        <header className="p-4 border-b border-gray-200">
                            <h1 className="text-xl font-semibold">Place Autocomplete (New)</h1>
                            <p className="text-sm text-gray-500">Visualizer for the Places API</p>
                        </header>
                        
                        <div className="flex-grow overflow-y-auto">
                            <div className="p-4">
                                <h3 className="text-lg font-semibold mb-3 px-1">Request Parameters</h3>
                                <RequestForm
                                    apiKey={apiKey}
                                    setApiKey={setApiKey}
                                    request={request}
                                    setRequest={setRequest}
                                    fieldMask={fieldMask}
                                    setFieldMask={setFieldMask}
                                    drawingFor={drawingFor}
                                    setDrawingFor={setDrawingFor}
                                    responseObject={responseObject}
                                    submittedRequest={submittedRequest}
                                    hasBeenCleared={hasBeenCleared}
                                    isPlacingOrigin={isPlacingOrigin}
                                    setIsPlacingOrigin={setIsPlacingOrigin}
                                />
                            </div>
                            <div className="p-4 pt-0">
                                {warning && <p className="bg-yellow-100 text-yellow-800 p-3 rounded-lg text-sm mb-4">{warning}</p>}
                                <Legend />
                            </div>
                        </div>

                        <div className="p-4 border-t border-gray-200 flex-shrink-0 flex gap-2">
                            <button onClick={handleSubmit} disabled={loading} className="w-full bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-blue-700 disabled:bg-blue-300 transition">
                                {loading ? 'Sending...' : 'Send Request'}
                            </button>
                            <button onClick={handleClear} className="w-full bg-gray-500 text-white font-semibold py-2 px-4 rounded-lg hover:bg-gray-600 transition">Clear</button>
                        </div>
                    </div>

                    <button
                        onClick={() => setIsLeftPanelCollapsed(!isLeftPanelCollapsed)}
                        className="absolute top-1/2 right-0 -translate-y-1/2 translate-x-full bg-white w-8 h-16 rounded-r-lg shadow-md hover:bg-gray-100 flex items-center justify-center text-gray-600"
                        aria-label={isLeftPanelCollapsed ? 'Show request parameters' : 'Hide request parameters'}
                    >
                        <span className="material-icons">{isLeftPanelCollapsed ? 'chevron_right' : 'chevron_left'}</span>
                    </button>
                </div>

                {/* Right Panel */}
                {responseObject && (
                    <div ref={rightPanelRef} className={`absolute top-0 right-0 z-10 w-full max-w-lg h-full transition-transform duration-300 ease-in-out pointer-events-auto ${isRightPanelCollapsed ? 'translate-x-full' : 'translate-x-0'}`}>
                        <div className="relative w-full h-full bg-white rounded-xl shadow-2xl flex flex-col">
                            <div className="flex-grow overflow-y-auto">
                                <ResultsPanel 
                                    responseObject={responseObject} 
                                    curlCommand={curlCommand} 
                                    markers={markers}
                                    selectedPlaceId={selectedPlaceId}
                                    onSelectPlace={setSelectedPlaceId}
                                />
                            </div>
                        </div>
                        <button
                            onClick={() => setIsRightPanelCollapsed(!isRightPanelCollapsed)}
                            className="absolute top-1/2 left-0 -translate-y-1/2 -translate-x-full bg-white w-8 h-16 rounded-l-lg shadow-md hover:bg-gray-100 flex items-center justify-center text-gray-600"
                            aria-label={isRightPanelCollapsed ? 'Show results' : 'Hide results'}
                        >
                            <span className="material-icons">{isRightPanelCollapsed ? 'chevron_left' : 'chevron_right'}</span>
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default App;