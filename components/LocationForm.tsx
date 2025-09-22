import React, { useState, useEffect, useRef } from 'react';
import { AutocompleteRequest, Circle, Rectangle } from '../types';
import { useFocusRing } from './FocusRing';

interface LocationFormProps {
    request: AutocompleteRequest;
    setRequest: (request: AutocompleteRequest) => void;
    drawingFor: 'bias' | 'restriction' | null;
    setDrawingFor: (forType: 'bias' | 'restriction' | null) => void;
    responseObject: any | null;
    submittedRequest: AutocompleteRequest | null;
    hasBeenCleared: boolean;
}

const Input: React.FC<React.InputHTMLAttributes<HTMLInputElement>> = (props) => {
    const focusProps = useFocusRing();
    return <input {...props} {...focusProps} className="w-full box-border px-3 py-2 rounded-lg border border-gray-300 bg-white text-sm focus:outline-none transition read-only:bg-gray-100" />;
};

const Select: React.FC<React.SelectHTMLAttributes<HTMLSelectElement>> = (props) => {
    const focusProps = useFocusRing();
    return (
        <div className="relative">
            <select {...props} {...focusProps} className="w-full box-border pl-3 pr-8 py-2 rounded-lg border border-gray-300 bg-white text-sm focus:outline-none transition appearance-none" />
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500">
                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="http://www.w3.org/2000/svg"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
            </div>
        </div>
    );
};

const Label: React.FC<{htmlFor?: string; children: React.ReactNode}> = ({htmlFor, children}) => (
    <label htmlFor={htmlFor} className="block text-xs font-medium text-gray-600 mb-1.5">{children}</label>
);

type LocType = 'locationBias' | 'locationRestriction';
type ShapeType = 'none' | 'circle' | 'rectangle';

interface LocationShapeEditorProps {
    locType: LocType;
    label: string;
    request: AutocompleteRequest;
    setRequest: (r: AutocompleteRequest) => void;
    drawingFor: 'bias' | 'restriction' | null;
    setDrawingFor: (forType: 'bias' | 'restriction' | null) => void;
    responseObject: any | null;
    submittedRequest: AutocompleteRequest | null;
    hasBeenCleared: boolean;
}

const LocationShapeEditor: React.FC<LocationShapeEditorProps> = ({ locType, label, request, setRequest, drawingFor, setDrawingFor, responseObject, submittedRequest, hasBeenCleared }) => {
    const internalLocType = locType === 'locationBias' ? 'bias' : 'restriction';
    const isDrawingThis = drawingFor === internalLocType;
    const isDrawingOther = drawingFor !== null && !isDrawingThis;

    const [lastCircle, setLastCircle] = useState<Circle | null>(null);
    const [lastRectangle, setLastRectangle] = useState<Rectangle | null>(null);
    const prevResponseObjectRef = useRef(responseObject);
    const prevRequestRef = useRef<AutocompleteRequest>(request);

    const currentShape = request[locType];
    const shapeType: ShapeType = currentShape ? (currentShape.circle ? 'circle' : 'rectangle') : 'none';

    useEffect(() => {
        // "Remember" the last valid shape configuration, but only if it's not
        // an "empty" placeholder shape. This prevents overwriting a real, drawn
        // shape with a temporary empty one.
        if (currentShape?.circle) {
            const { center, radius } = currentShape.circle;
            if (center.latitude !== 0 || center.longitude !== 0 || radius !== 0) {
                setLastCircle(currentShape.circle);
            }
        }
        if (currentShape?.rectangle) {
            const { low, high } = currentShape.rectangle;
            if (low.latitude !== 0 || low.longitude !== 0 || high.latitude !== 0 || high.longitude !== 0) {
                setLastRectangle(currentShape.rectangle);
            }
        }
    }, [currentShape]);

    useEffect(() => {
        // This effect manages clearing the "remembered" shape to prevent old
        // values from reappearing unexpectedly.
        if (responseObject !== prevResponseObjectRef.current) {
            // Case 1: The main "Clear" button was pressed.
            // The signal for this is the responseObject transitioning to null.
            if (responseObject === null) {
                setLastCircle(null);
                setLastRectangle(null);
            }
            // Case 2: A new request was submitted. When the response arrives,
            // we clear the memory of any shape type that wasn't part of that request.
            else if (submittedRequest) {
                const submittedShape = submittedRequest[locType];
                if (submittedShape) {
                    // A shape for this filter *was* submitted. Clear the memory of the *other* shape type.
                    if (submittedShape.rectangle) {
                        setLastCircle(null);
                    } else if (submittedShape.circle) {
                        setLastRectangle(null);
                    }
                } else {
                    // No shape for this filter was submitted. Clear memory for both shapes.
                    setLastCircle(null);
                    setLastRectangle(null);
                }
            }
        }

        // Update the ref to the current response object for the next render.
        prevResponseObjectRef.current = responseObject;
    }, [responseObject, submittedRequest, locType]);

    useEffect(() => {
        const prevInput = prevRequestRef.current.input;
        const currentInput = request.input;
        const prevShape = prevRequestRef.current[locType];
        
        // This effect specifically handles the case where the user changes the
        // main input away from the "San Francisco" default. If there was a
        // default shape active for this component, we must clear the "remembered"
        // shape to prevent it from reappearing incorrectly later.
        if (prevInput === 'San Francisco' && currentInput !== 'San Francisco' && prevShape) {
            setLastCircle(null);
            setLastRectangle(null);
        }
        
        prevRequestRef.current = request;
    }, [request, locType]);


    const handleShapeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newShape = e.target.value as ShapeType;
        e.target.blur(); // Remove focus from select after change

        if (newShape === 'none') {
            setRequest({ ...request, [locType]: null });
            if (isDrawingThis) {
                setDrawingFor(null);
            }
            return;
        }

        // The SF default should only be applied on the very first load, not after a "Clear" action.
        const isAppInInitialState = !responseObject && request.input === 'San Francisco' && !hasBeenCleared;

        if (newShape === 'circle') {
            if (lastCircle) {
                setRequest({ ...request, [locType]: { circle: lastCircle }});
            } else {
                if (isAppInInitialState) {
                    const center = request.origin || { latitude: 37.77, longitude: -122.41 };
                    setRequest({ ...request, [locType]: { circle: { center, radius: 5000 } } });
                } else {
                    // Create an "empty" shape to prevent drawing a default 0,0 circle
                    setRequest({ ...request, [locType]: { circle: { center: { latitude: 0, longitude: 0 }, radius: 0 } } });
                }
            }
        } else if (newShape === 'rectangle') {
            if (lastRectangle) {
                 setRequest({ ...request, [locType]: { rectangle: lastRectangle }});
            } else {
                 if (isAppInInitialState) {
                    const center = request.origin || { latitude: 37.77, longitude: -122.41 };
                    setRequest({ ...request, [locType]: { rectangle: { 
                        low: { latitude: center.latitude - 0.1, longitude: center.longitude - 0.1 }, 
                        high: { latitude: center.latitude + 0.1, longitude: center.longitude + 0.1 } 
                    }}});
                } else {
                    // Create an "empty" shape
                    setRequest({ ...request, [locType]: { rectangle: { 
                        low: { latitude: 0, longitude: 0 }, 
                        high: { latitude: 0, longitude: 0 } 
                    }}});
                }
            }
        }
    };
    
    const handleDrawToggle = () => {
        if (shapeType === 'none') {
            alert('Please select a shape type (circle or rectangle) before drawing.');
            return;
        }
        setDrawingFor(isDrawingThis ? null : internalLocType);
    };

    const handleClearShape = () => {
        // Clear the "memory" of any last-used shape for this filter.
        setLastCircle(null);
        setLastRectangle(null);

        // Set the current shape to an "empty" placeholder to clear the fields
        // without collapsing them (i.e., without changing shapeType to 'none').
        if (shapeType === 'circle') {
            setRequest({
                ...request,
                [locType]: { circle: { center: { latitude: 0, longitude: 0 }, radius: 0 } }
            });
        } else if (shapeType === 'rectangle') {
            setRequest({
                ...request,
                [locType]: { rectangle: { low: { latitude: 0, longitude: 0 }, high: { latitude: 0, longitude: 0 } } }
            });
        }
        
        // If the user was drawing, stop.
        if (isDrawingThis) {
            setDrawingFor(null);
        }
    };

    const handleValueChange = (field: string, value: string) => {
        const numValue = value.trim() === '' ? 0 : parseFloat(value);
        if (isNaN(numValue) && value.trim() !== '' && value.trim() !== '-') return;
        
        const newLocation = JSON.parse(JSON.stringify(request[locType]));
        
        if (shapeType === 'circle') {
            if(field === 'radius') newLocation.circle.radius = numValue;
            else if (field === 'lat') newLocation.circle.center.latitude = numValue;
            else if (field === 'lng') newLocation.circle.center.longitude = numValue;
        } else if (shapeType === 'rectangle') {
            const [point, coord] = field.split('_');
            const val = numValue;
            if (point === 'low') newLocation.rectangle.low[coord === 'lat' ? 'latitude' : 'longitude'] = val;
            if (point === 'high') newLocation.rectangle.high[coord === 'lat' ? 'latitude' : 'longitude'] = val;
        }
        setRequest({ ...request, [locType]: newLocation });
    };

    const getValue = (path: string): string => {
        const shape = request[locType];
        if (!shape) return '';

        // Check if the shape is our "empty" placeholder and return '' to keep inputs blank
        const circle = shape.circle;
        if (circle && circle.center.latitude === 0 && circle.center.longitude === 0 && circle.radius === 0) {
            return '';
        }
        const rect = shape.rectangle;
        if (rect && rect.low.latitude === 0 && rect.low.longitude === 0 && rect.high.latitude === 0 && rect.high.longitude === 0) {
            return '';
        }

        const keys = path.split('.');
        let current: any = shape;
        for (const key of keys) {
            if (current === undefined || current === null) return '';
            current = current[key];
        }
        return current === null || current === undefined ? '' : String(current);
    };


    return (
        <div className="space-y-3">
            <div className="flex justify-between items-center">
                <Label>{label}</Label>
                <button 
                    type="button" 
                    onClick={handleClearShape}
                    className="text-xs text-gray-500 hover:text-red-600 disabled:text-gray-300 font-medium"
                    disabled={shapeType === 'none'}
                >
                    Clear Shape
                </button>
            </div>
            <div className="flex gap-2">
                <div className="flex-grow">
                    <Select id={`${locType}Type`} value={shapeType} onChange={handleShapeChange}>
                        <option value="none">None</option>
                        <option value="circle">Circle</option>
                        <option value="rectangle">Rectangle</option>
                    </Select>
                </div>
                <button
                    type="button"
                    onClick={handleDrawToggle}
                    disabled={isDrawingOther || shapeType === 'none'}
                    className={`px-3 py-2 text-sm font-semibold rounded-lg transition flex-shrink-0 ${
                        isDrawingThis 
                            ? 'bg-blue-600 text-white hover:bg-blue-700' 
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed'
                    }`}
                >
                    {isDrawingThis ? 'Stop Drawing' : 'Draw on Map'}
                </button>
            </div>

            {isDrawingThis && (
                <p className="text-xs text-blue-600 bg-blue-50 p-2 rounded-md">
                    Drawing mode active. Draw on the map, or move/resize the existing shape.
                </p>
            )}

            {shapeType === 'circle' && (
                <div className="space-y-3 p-3 bg-gray-50 rounded-lg">
                    <div className="grid grid-cols-2 gap-3">
                        <div><Label htmlFor={`${locType}_center_lat`}>Center lat</Label><Input id={`${locType}_center_lat`} type="number" step="0.000001" value={getValue('circle.center.latitude')} onChange={(e) => handleValueChange('lat', e.target.value)} readOnly={isDrawingThis} /></div>
                        <div><Label htmlFor={`${locType}_center_lng`}>Center lng</Label><Input id={`${locType}_center_lng`} type="number" step="0.000001" value={getValue('circle.center.longitude')} onChange={(e) => handleValueChange('lng', e.target.value)} readOnly={isDrawingThis} /></div>
                    </div>
                    <div><Label htmlFor={`${locType}_radius`}>Radius (meters)</Label><Input id={`${locType}_radius`} type="number" value={getValue('circle.radius')} onChange={(e) => handleValueChange('radius', e.target.value)} readOnly={isDrawingThis} /></div>
                </div>
            )}
            {shapeType === 'rectangle' && (
                <div className="space-y-3 p-3 bg-gray-50 rounded-lg">
                    <div className="grid grid-cols-2 gap-3">
                        <div><Label htmlFor={`${locType}_low_lat`}>Low (South) lat</Label><Input id={`${locType}_low_lat`} type="number" step="0.000001" value={getValue('rectangle.low.latitude')} onChange={(e) => handleValueChange('low_lat', e.target.value)} readOnly={isDrawingThis} /></div>
                        <div><Label htmlFor={`${locType}_low_lng`}>Low (West) lng</Label><Input id={`${locType}_low_lng`} type="number" step="0.000001" value={getValue('rectangle.low.longitude')} onChange={(e) => handleValueChange('low_lng', e.target.value)} readOnly={isDrawingThis} /></div>
                        <div><Label htmlFor={`${locType}_high_lat`}>High (North) lat</Label><Input id={`${locType}_high_lat`} type="number" step="0.000001" value={getValue('rectangle.high.latitude')} onChange={(e) => handleValueChange('high_lat', e.target.value)} readOnly={isDrawingThis} /></div>
                        <div><Label htmlFor={`${locType}_high_lng`}>High (East) lng</Label><Input id={`${locType}_high_lng`} type="number" step="0.000001" value={getValue('rectangle.high.longitude')} onChange={(e) => handleValueChange('high_lng', e.target.value)} readOnly={isDrawingThis} /></div>
                    </div>
                </div>
            )}
        </div>
    );
};

const LocationForm: React.FC<LocationFormProps> = ({ request, setRequest, drawingFor, setDrawingFor, responseObject, submittedRequest, hasBeenCleared }) => {
    return (
        <div className="space-y-4">
            <h3 className="text-base font-semibold px-1">Location Bias & Restriction</h3>
            <LocationShapeEditor locType="locationBias" label="Location Bias" {...{request, setRequest, drawingFor, setDrawingFor, responseObject, submittedRequest, hasBeenCleared}} />
            <hr className="border-gray-200" />
            <LocationShapeEditor locType="locationRestriction" label="Location Restriction" {...{request, setRequest, drawingFor, setDrawingFor, responseObject, submittedRequest, hasBeenCleared}} />
            <p className="text-xs text-gray-500 pt-2 px-1">
                Use the form or draw on the map. At most one bias OR restriction is sent in the API request.
            </p>
        </div>
    );
};

export default LocationForm;