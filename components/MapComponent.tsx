import React, { useEffect, useRef, useState, useCallback } from 'react';
import { MarkerData, LatLng, LocationBias, LocationRestriction, AutocompleteRequest } from '../types';
import { createMarkerIcon, createOriginIcon } from '../utils/mapMarkerUtils';
import { haversineMeters } from '../utils/geoUtils';

interface MapPadding {
    top: number;
    right: number;
    bottom: number;
    left: number;
}

interface MapComponentProps {
    apiKey: string;
    markers: MarkerData[];
    origin: LatLng | null;
    bias: LocationBias | null;
    restriction: LocationRestriction | null;
    selectedPlaceId: string | null;
    onSelectPlace: (placeId: string | null) => void;
    drawingFor: 'bias' | 'restriction' | null;
    setDrawingFor: (forType: 'bias' | 'restriction' | null) => void;
    onShapeUpdate: (
        locType: 'bias' | 'restriction',
        shape: 'circle' | 'rectangle' | null,
        data: any
    ) => void;
    request: AutocompleteRequest;
    isPlacingOrigin: boolean;
    setIsPlacingOrigin: (value: boolean) => void;
    onOriginUpdate: (origin: LatLng | null) => void;
    padding: MapPadding;
}

type MapStatus = 'idle' | 'loading' | 'loaded' | 'error' | 'auth_error' | 'quota_error';

const MapComponent: React.FC<MapComponentProps> = ({ apiKey, markers, origin, bias, restriction, selectedPlaceId, onSelectPlace, drawingFor, setDrawingFor, onShapeUpdate, request, isPlacingOrigin, setIsPlacingOrigin, onOriginUpdate, padding }) => {
    const mapRef = useRef<HTMLDivElement>(null);
    const [map, setMap] = useState<google.maps.Map | null>(null);
    const [infoWindow, setInfoWindow] = useState<google.maps.InfoWindow | null>(null);
    const [mapStatus, setMapStatus] = useState<MapStatus>('idle');
    const authFailed = useRef(false);
    
    const activeMarkersRef = useRef<google.maps.Marker[]>([]);
    const originMarkerRef = useRef<google.maps.Marker | null>(null);
    const drawingManagerRef = useRef<google.maps.drawing.DrawingManager | null>(null);
    const biasShapeRef = useRef<google.maps.Rectangle | google.maps.Circle | null>(null);
    const restrictionShapeRef = useRef<google.maps.Rectangle | google.maps.Circle | null>(null);

    const onShapeUpdateRef = useRef(onShapeUpdate);
    useEffect(() => { onShapeUpdateRef.current = onShapeUpdate; }, [onShapeUpdate]);

    const drawingForRef = useRef(drawingFor);
    useEffect(() => { drawingForRef.current = drawingFor; }, [drawingFor]);

    const setDrawingForRef = useRef(setDrawingFor);
    useEffect(() => { setDrawingForRef.current = setDrawingFor; }, [setDrawingFor]);

    const isPlacingOriginRef = useRef(isPlacingOrigin);
    useEffect(() => { isPlacingOriginRef.current = isPlacingOrigin; }, [isPlacingOrigin]);
    
    const setIsPlacingOriginRef = useRef(setIsPlacingOrigin);
    useEffect(() => { setIsPlacingOriginRef.current = setIsPlacingOrigin; }, [setIsPlacingOrigin]);

    const onOriginUpdateRef = useRef(onOriginUpdate);
    useEffect(() => { onOriginUpdateRef.current = onOriginUpdate; }, [onOriginUpdate]);


    const loadMapScript = useCallback(() => {
        return new Promise<void>((resolve, reject) => {
            // Always remove the previous script to force a reload with the new key.
            const existingScript = document.getElementById('google-maps-script');
            if (existingScript) {
                existingScript.remove();
            }
            
            // The Google Maps script won't re-run if `window.google` exists.
            // We must remove it to force a full re-initialization.
            if (window.google) {
                delete window.google;
            }
    
            if (!apiKey) {
                // Reject promise if apiKey is empty. The useEffect will handle UI state.
                return reject(new Error('API key cannot be empty.'));
            }
    
            const script = document.createElement('script');
            script.id = 'google-maps-script';
            script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=marker,drawing`;
            script.async = true;
            script.defer = true;
            
            script.onload = () => resolve();
            script.onerror = () => {
                // Clean up the failed script tag
                script.remove();
                reject(new Error('Google Maps script failed to load.'));
            }
    
            document.head.appendChild(script);
        });
    }, [apiKey]);
    
    // Initialize map
    useEffect(() => {
        if (!apiKey) {
            setMap(null);
            setInfoWindow(null);
            setMapStatus('idle');
            if ((window as any).gm_authFailure) {
                delete (window as any).gm_authFailure;
            }
            return;
        }
        
        if (!mapRef.current) return;
        
        authFailed.current = false;
        setMapStatus('loading');

        const originalConsoleError = console.error;
        const consoleErrorInterceptor = (...args: any[]) => {
            const message = args[0];
            if (typeof message === 'string') {
                if (message.includes('OverQuotaMapError')) {
                    setMapStatus('quota_error');
                } else if (message.includes('InvalidKeyMapError')) {
                    authFailed.current = true;
                    setMapStatus('auth_error');
                }
            }
            originalConsoleError.apply(console, args);
        };
        console.error = consoleErrorInterceptor;


        // Google Maps JS API calls this global function on auth failure.
        (window as any).gm_authFailure = () => {
            authFailed.current = true;
            setMapStatus(prevStatus => {
                // If the console interceptor already caught a more specific quota error,
                // don't overwrite it with the generic auth error.
                if (prevStatus === 'quota_error') {
                    return prevStatus;
                }
                return 'auth_error';
            });
        };
        
        loadMapScript().then(() => {
            if (authFailed.current || !mapRef.current) {
                return; // Auth failure detected, do not proceed.
            }
            const mapInstance = new google.maps.Map(mapRef.current, {
                center: { lat: 37.7749, lng: -122.4194 },
                zoom: 12,
                gestureHandling: 'greedy',
            });
            setMap(mapInstance);
            
            const infoWindowInstance = new google.maps.InfoWindow({
                maxWidth: 420,
                pixelOffset: new google.maps.Size(0, -10),
            });
            
            google.maps.event.addListener(infoWindowInstance, 'closeclick', () => {
                onSelectPlace(null);
            });
    
            google.maps.event.addListener(infoWindowInstance, 'domready', () => {
                const closeBtn = document.querySelector('.gm-style-iw-c button');
                if (closeBtn) {
                  (closeBtn as HTMLElement).style.display = 'none';
                }
            });
    
            setInfoWindow(infoWindowInstance);
            setMapStatus('loaded');
        }).catch(error => {
            if (!authFailed.current) {
                console.error(error);
                setMapStatus('error');
            }
            setMap(null);
            setInfoWindow(null);
        });

        return () => {
            if ((window as any).gm_authFailure) {
                delete (window as any).gm_authFailure;
            }
            console.error = originalConsoleError;
        };
    }, [apiKey, loadMapScript, onSelectPlace]);
    
    // Initialize DrawingManager
    useEffect(() => {
        if (!map || drawingManagerRef.current) return;

        const drawingManager = new google.maps.drawing.DrawingManager({
            drawingControl: false, // We use our own UI
            circleOptions: {
                fillOpacity: 0.1,
                strokeWeight: 2,
                clickable: false,
                editable: true,
                draggable: true,
                zIndex: 1,
            },
            rectangleOptions: {
                fillOpacity: 0.1,
                strokeWeight: 2,
                clickable: false,
                editable: true,
                draggable: true,
                zIndex: 1,
            },
        });

        drawingManager.setMap(map);
        drawingManagerRef.current = drawingManager;

        google.maps.event.addListener(drawingManager, 'overlaycomplete', (event: any) => {
            const locType = drawingForRef.current;
            if (!locType) return;

            // Extract geometry from the drawn shape
            let shapeType: 'circle' | 'rectangle';
            let data: any;

            if (event.type === google.maps.drawing.OverlayType.CIRCLE) {
                const circle = event.overlay as google.maps.Circle;
                const center = circle.getCenter()!;
                shapeType = 'circle';
                data = { center: [center.lng(), center.lat()], radius: circle.getRadius() };
            } else { // RECTANGLE
                const rectangle = event.overlay as google.maps.Rectangle;
                const bounds = rectangle.getBounds()!;
                const ne = bounds.getNorthEast();
                const sw = bounds.getSouthWest();
                shapeType = 'rectangle';
                data = [[sw.lng(), sw.lat()], [ne.lng(), ne.lat()]];
            }
            
            // Destroy the temporary shape created by the DrawingManager
            event.overlay.setMap(null);

            // Update state. This will trigger the syncShape effect, which creates a new,
            // properly configured and draggable shape via a single, reliable code path.
            onShapeUpdateRef.current(locType, shapeType, data);
            
            setDrawingForRef.current(null);
        });

        google.maps.event.addListener(map, 'click', (e: google.maps.MapMouseEvent) => {
            if (isPlacingOriginRef.current && e.latLng) {
                onOriginUpdateRef.current({ latitude: e.latLng.lat(), longitude: e.latLng.lng() });
                setIsPlacingOriginRef.current(false);
            }
        });

        return () => {
            if (drawingManagerRef.current) {
                google.maps.event.clearInstanceListeners(drawingManagerRef.current);
                drawingManagerRef.current.setMap(null);
                drawingManagerRef.current = null;
            }
        };
    }, [map]);

    // Effect to manage draw mode
    useEffect(() => {
        if (!drawingManagerRef.current) return;
        const dm = drawingManagerRef.current;
        
        if (drawingFor) {
            const locType = drawingFor === 'bias' ? 'locationBias' : 'locationRestriction';
            const shapeData = request[locType];
            const shapeType = shapeData ? (shapeData.circle ? 'circle' : 'rectangle') : 'none';
            
            const color = drawingFor === 'bias' ? '#2563eb' : '#ef4444';
            dm.setOptions({
                circleOptions: { ...dm.get('circleOptions'), strokeColor: color, fillColor: color },
                rectangleOptions: { ...dm.get('rectangleOptions'), strokeColor: color, fillColor: color },
            });

            if (shapeType === 'circle') dm.setDrawingMode(google.maps.drawing.OverlayType.CIRCLE);
            else if (shapeType === 'rectangle') dm.setDrawingMode(google.maps.drawing.OverlayType.RECTANGLE);
            else dm.setDrawingMode(null);
        } else {
            dm.setDrawingMode(null);
        }
    }, [drawingFor, request]);

     // Effect for managing map cursor for origin placement
    useEffect(() => {
        map?.setOptions({ draggableCursor: isPlacingOrigin ? 'crosshair' : null });
    }, [isPlacingOrigin, map]);

    // Effect for two-way sync (form -> map)
    useEffect(() => {
        if (!map) return;

        const syncShape = (locType: 'bias' | 'restriction', shapeData: LocationBias | LocationRestriction | null) => {
            const shapeRef = locType === 'bias' ? biasShapeRef : restrictionShapeRef;
            const color = locType === 'bias' ? '#2563eb' : '#ef4444';

            // Clear existing shape if data is null
            if (!shapeData) {
                if (shapeRef.current) {
                    shapeRef.current.setMap(null);
                    shapeRef.current = null;
                }
                return;
            }
            
            if (shapeData.rectangle) {
                const { low, high } = shapeData.rectangle;
                // Don't draw "empty" placeholder shapes
                if (low.latitude === 0 && low.longitude === 0 && high.latitude === 0 && high.longitude === 0) {
                    if (shapeRef.current) {
                        shapeRef.current.setMap(null);
                        shapeRef.current = null;
                    }
                    return;
                }
                const newBounds = { south: low.latitude, west: low.longitude, north: high.latitude, east: high.longitude };
                
                if (shapeRef.current instanceof google.maps.Rectangle) {
                    const currentBounds = shapeRef.current.getBounds()!;
                    if(currentBounds.getSouthWest().lat() === low.latitude && currentBounds.getSouthWest().lng() === low.longitude &&
                       currentBounds.getNorthEast().lat() === high.latitude && currentBounds.getNorthEast().lng() === high.longitude) return; // already in sync
                    shapeRef.current.setBounds(newBounds);
                } else {
                    if (shapeRef.current) shapeRef.current.setMap(null);
                    shapeRef.current = new google.maps.Rectangle({
                        bounds: newBounds,
                        map,
                        editable: true,
                        draggable: true,
                        strokeColor: color,
                        fillColor: color,
                        fillOpacity: 0.1,
                        strokeWeight: 2,
                    });
                    google.maps.event.addListener(shapeRef.current, 'bounds_changed', () => {
                        const b = (shapeRef.current as google.maps.Rectangle).getBounds()!;
                        onShapeUpdateRef.current(locType, 'rectangle', [[b.getSouthWest().lng(), b.getSouthWest().lat()], [b.getNorthEast().lng(), b.getNorthEast().lat()]]);
                    });
                }
            } else if (shapeData.circle) {
                const { center, radius } = shapeData.circle;
                // Don't draw "empty" placeholder shapes
                if (center.latitude === 0 && center.longitude === 0 && radius === 0) {
                    if (shapeRef.current) {
                        shapeRef.current.setMap(null);
                        shapeRef.current = null;
                    }
                    return;
                }
                const newCenter = { lat: center.latitude, lng: center.longitude };

                if (shapeRef.current instanceof google.maps.Circle) {
                    const currentCenter = shapeRef.current.getCenter()!;
                    if(currentCenter.lat() === newCenter.lat && currentCenter.lng() === newCenter.lng && shapeRef.current.getRadius() === radius) return; // already in sync
                    shapeRef.current.setCenter(newCenter);
                    shapeRef.current.setRadius(radius);
                } else {
                    if (shapeRef.current) shapeRef.current.setMap(null);
                    shapeRef.current = new google.maps.Circle({
                        center: newCenter,
                        radius,
                        map,
                        editable: true,
                        draggable: true,
                        strokeColor: color,
                        fillColor: color,
                        fillOpacity: 0.1,
                        strokeWeight: 2,
                    });
                    google.maps.event.addListener(shapeRef.current, 'radius_changed', () => onShapeUpdateRef.current(locType, 'circle', { center: [(shapeRef.current as google.maps.Circle).getCenter()!.lng(), (shapeRef.current as google.maps.Circle).getCenter()!.lat()], radius: (shapeRef.current as google.maps.Circle).getRadius() }));
                    google.maps.event.addListener(shapeRef.current, 'center_changed', () => onShapeUpdateRef.current(locType, 'circle', { center: [(shapeRef.current as google.maps.Circle).getCenter()!.lng(), (shapeRef.current as google.maps.Circle).getCenter()!.lat()], radius: (shapeRef.current as google.maps.Circle).getRadius() }));
                }
            }
        };

        syncShape('bias', bias);
        syncShape('restriction', restriction);
    }, [bias, restriction, map]);

    // Effect to manage the origin marker (two-way sync)
    useEffect(() => {
        if (!map) return;

        // If origin exists...
        if (origin) {
            const newPosition = { lat: origin.latitude, lng: origin.longitude };
            // ...and marker doesn't exist, create it.
            if (!originMarkerRef.current) {
                const newMarker = new google.maps.Marker({
                    map,
                    position: newPosition,
                    title: 'Origin',
                    icon: createOriginIcon(),
                    draggable: true,
                });
                newMarker.addListener('dragend', (e: google.maps.MapMouseEvent) => {
                    if (e.latLng) {
                        onOriginUpdateRef.current({ latitude: e.latLng.lat(), longitude: e.latLng.lng() });
                    }
                });
                newMarker.addListener('click', () => onSelectPlace('origin'));
                originMarkerRef.current = newMarker;
            } else {
                // ...and marker exists, just update its position if it's different.
                const currentPos = originMarkerRef.current.getPosition();
                if (currentPos && (currentPos.lat() !== newPosition.lat || currentPos.lng() !== newPosition.lng)) {
                    originMarkerRef.current.setPosition(newPosition);
                }
            }
        } 
        // If origin is null...
        else {
            // ...and marker exists, remove it.
            if (originMarkerRef.current) {
                google.maps.event.clearInstanceListeners(originMarkerRef.current);
                originMarkerRef.current.setMap(null);
                originMarkerRef.current = null;
            }
        }
    }, [map, origin, onSelectPlace]);

    // Draw markers and fit bounds
    useEffect(() => {
        if (!map) return;
        
        activeMarkersRef.current.forEach(m => m.setMap(null));
        activeMarkersRef.current = markers.map(markerData => {
            const marker = new google.maps.Marker({
                position: markerData.position,
                map,
                icon: createMarkerIcon(markerData.state, markerData.label),
                title: markerData.title,
            });
            marker.addListener('click', () => onSelectPlace(markerData.details.id));
            return marker;
        });

        if (markers.length > 0 || origin || bias || restriction) {
            const bounds = new google.maps.LatLngBounds();
            activeMarkersRef.current.forEach(m => bounds.extend(m.getPosition()!));
            
            if (originMarkerRef.current) {
                bounds.extend(originMarkerRef.current.getPosition()!);
            }
            if (biasShapeRef.current) {
                bounds.union(biasShapeRef.current.getBounds()!);
            }
            if (restrictionShapeRef.current) {
                bounds.union(restrictionShapeRef.current.getBounds()!);
            }

            if (!bounds.isEmpty()) {
                map.fitBounds(bounds, padding);
            }
        }
    }, [map, markers, origin, onSelectPlace, bias, restriction, padding]);
    
    // Effect to handle opening info window when selectedPlaceId changes
    useEffect(() => {
        if (!map || !infoWindow) return;

        if (!selectedPlaceId) {
            infoWindow.close();
            return;
        }
        
        if (selectedPlaceId === 'origin' && originMarkerRef.current) {
            const position = originMarkerRef.current.getPosition();
            if (position) {
                 const originContent = `
                    <div class="custom-infowindow p-4 text-gray-800 relative w-64 font-sans">
                      <button id="origin-infowindow-close-btn" class="absolute top-2 right-2 text-gray-500 hover:text-gray-800 w-7 h-7 flex items-center justify-center rounded-full hover:bg-gray-100">&times;</button>
                      <h3 class="text-base font-semibold text-gray-900 mb-2">Origin</h3>
                      <div class="text-sm my-1.5"><b>Coords:</b> ${position.lat().toFixed(6)}, ${position.lng().toFixed(6)}</div>
                    </div>
                 `;
                 infoWindow.setContent(originContent);
                 
                 google.maps.event.addListenerOnce(infoWindow, 'domready', () => {
                    const closeButton = document.getElementById('origin-infowindow-close-btn');
                    if (closeButton) {
                        closeButton.addEventListener('click', () => {
                            infoWindow.close();
                            onSelectPlace(null);
                        });
                    }
                 });
                 
                 infoWindow.open({ map, anchor: originMarkerRef.current });
            }
            return;
        }

        const markerIndex = markers.findIndex(m => m.details.id === selectedPlaceId);
        if (markerIndex !== -1) {
            const markerData = markers[markerIndex];
            const googleMarker = activeMarkersRef.current[markerIndex];
            
            if (googleMarker) {
                infoWindow.setContent(buildInfoWindowContent(markerData, origin));
                
                google.maps.event.addListenerOnce(infoWindow, 'domready', () => {
                    const closeButton = document.getElementById('infowindow-close-btn');
                    if (closeButton) {
                        closeButton.addEventListener('click', () => {
                            infoWindow.close();
                            onSelectPlace(null);
                        });
                    }
                });
                infoWindow.open({ map, anchor: googleMarker });
            }
        }

    }, [selectedPlaceId, map, infoWindow, markers, origin, onSelectPlace]);
    
    const renderPlaceholder = () => {
        switch (mapStatus) {
            case 'loading':
                return (
                    <>
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-600 mb-4"></div>
                        <h2 className="text-xl font-semibold">Loading Map...</h2>
                        <p className="text-gray-500">Initializing Google Maps with your API key.</p>
                    </>
                );
            case 'auth_error':
                 return (
                    <>
                        <span className="material-icons text-6xl text-red-500 mb-4">key_off</span>
                        <h2 className="text-xl font-semibold">Invalid API Key</h2>
                        <p className="text-gray-500 max-w-sm">The API key is invalid. Please verify the key and ensure the Maps JavaScript API is enabled for your project.</p>
                    </>
                );
            case 'quota_error':
                return (
                   <>
                       <span className="material-icons text-6xl text-amber-500 mb-4">error_outline</span>
                       <h2 className="text-xl font-semibold">API Quota Exceeded</h2>
                       <p className="text-gray-500 max-w-sm">You have exceeded your usage quota for the Google Maps JavaScript API. Please check your Google Cloud project billing and quotas.</p>
                   </>
               );
            case 'error':
                return (
                    <>
                        <span className="material-icons text-6xl text-red-500 mb-4">wifi_off</span>
                        <h2 className="text-xl font-semibold">Failed to load map script</h2>
                        <p className="text-gray-500 max-w-sm">Could not load the Google Maps script. Please check your network connection and browser settings.</p>
                    </>
                );
            case 'idle':
            default:
                return (
                    <>
                        <span className="material-icons text-6xl text-gray-400 mb-4">map</span>
                        <h2 className="text-xl font-semibold">Map is not available</h2>
                        <p className="text-gray-500 max-w-sm">Please enter a valid Google Maps API key in the request panel to load the map and start visualizing results.</p>
                    </>
                );
        }
    };

    return (
        <div className="w-full h-full relative">
            <div ref={mapRef} className="w-full h-full" style={{ visibility: mapStatus === 'loaded' ? 'visible' : 'hidden' }} />
            {mapStatus !== 'loaded' && (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center bg-gray-100 text-gray-700 p-4">
                    {renderPlaceholder()}
                </div>
            )}
        </div>
    );
};

function buildInfoWindowContent(data: MarkerData, origin: LatLng | null): string {
    const { position, details, title } = data;
    const distance = origin ? haversineMeters(origin.latitude, origin.longitude, position.lat, position.lng) : null;
    
    let content = `
    <div class="custom-infowindow p-4 text-gray-800 relative w-96 font-sans">
      <button id="infowindow-close-btn" class="absolute top-2 right-2 text-gray-500 hover:text-gray-800 w-7 h-7 flex items-center justify-center rounded-full hover:bg-gray-100">&times;</button>
      <h3 class="text-base font-semibold text-gray-900 mb-2">${title}</h3>
      ${details.formattedAddress ? `<div class="text-sm my-1.5"><b>Address:</b> ${details.formattedAddress}</div>` : ''}
      <div class="text-sm my-1.5"><b>Coords:</b> ${position.lat.toFixed(6)}, ${position.lng.toFixed(6)}</div>
      ${distance !== null ? `<div class="text-sm my-1.5"><b>Distance:</b> ${Math.round(distance)} m</div>` : ''}
      ${details.types ? `<div class="text-sm my-1.5"><b>Types:</b> ${details.types.join(', ')}</div>` : ''}
      <div class="border-t border-gray-200 my-2"></div>
      <details class="text-xs">
        <summary class="cursor-pointer font-medium">Raw place details</summary>
        <pre class="bg-gray-100 p-2 rounded-md mt-1 max-h-40 overflow-auto text-xs">${JSON.stringify(details, null, 2)}</pre>
      </details>
    </div>`;
    return content;
}

export default MapComponent;