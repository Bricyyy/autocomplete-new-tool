import React, { useRef, useEffect } from 'react';
import { MarkerData } from '../types';
import { useFocusRing } from './FocusRing';

interface ResultsPanelProps {
    responseObject: any | null;
    curlCommand: string;
    markers: MarkerData[];
    selectedPlaceId: string | null;
    onSelectPlace: (placeId: string | null) => void;
    isCollapsed: boolean;
}

const ResultsPanel: React.FC<ResultsPanelProps> = ({ responseObject, curlCommand, markers, selectedPlaceId, onSelectPlace, isCollapsed }) => {
    const preRef = useRef<HTMLPreElement>(null);
    const selectedItemRef = useRef<HTMLDivElement>(null);
    const focusProps = useFocusRing();
    const prevSelectedPlaceIdRef = useRef<string | null>(null);
    const listContainerRef = useRef<HTMLDivElement>(null);
    const jsonContainerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const prevSelected = prevSelectedPlaceIdRef.current;
        prevSelectedPlaceIdRef.current = selectedPlaceId;

        if (isCollapsed) return;
        if (!selectedPlaceId || selectedPlaceId === prevSelected) return;
        if (selectedItemRef.current) {
            selectedItemRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
    }, [selectedPlaceId, isCollapsed]);

    useEffect(() => {
        if (listContainerRef.current) {
            listContainerRef.current.scrollTop = 0;
        }
        if (jsonContainerRef.current) {
            jsonContainerRef.current.scrollTop = 0;
        }
    }, [responseObject, markers]);

    useEffect(() => {
        if (!preRef.current) return;
        const fullJsonString = responseObject ? JSON.stringify(responseObject, null, 2) : '(no response yet)';
        let highlightedHtml: string | null = null;

        if (selectedPlaceId && responseObject?.suggestions) {
            const selectedSuggestion = responseObject.suggestions.find(
                (s: any) => s.placePrediction?.placeId === selectedPlaceId
            );

            if (selectedSuggestion) {
                const placeIdStr = `"placeId": "${selectedPlaceId}"`;
                const placeIdIndex = fullJsonString.indexOf(placeIdStr);

                if (placeIdIndex !== -1) {
                    const ppKey = '"placePrediction": {';
                    const startIndex = fullJsonString.lastIndexOf(ppKey, placeIdIndex);

                    if (startIndex !== -1) {
                        let openBraces = 1;
                        let endIndex = -1;
                        for (let i = startIndex + ppKey.length; i < fullJsonString.length; i++) {
                            if (fullJsonString[i] === '{') openBraces++;
                            else if (fullJsonString[i] === '}') openBraces--;

                            if (openBraces === 0) {
                                endIndex = i;
                                break;
                            }
                        }

                        if (endIndex !== -1) {
                            const escapeHtml = (unsafe: string) =>
                                unsafe
                                    .replace(/&/g, "&amp;")
                                    .replace(/</g, "&lt;")
                                    .replace(/>/g, "&gt;")
                                    .replace(/"/g, "&quot;")
                                    .replace(/'/g, "&#039;");

                            const before = escapeHtml(fullJsonString.substring(0, startIndex));
                            const target = escapeHtml(fullJsonString.substring(startIndex, endIndex + 1));
                            const after = escapeHtml(fullJsonString.substring(endIndex + 1));

                            highlightedHtml = `${before}<span class="bg-yellow-200 block rounded">${target}</span>${after}`;
                        }
                    }
                }
            }
        }

        if (highlightedHtml) {
            preRef.current.innerHTML = highlightedHtml;
        } else {
            preRef.current.textContent = fullJsonString;
        }
    }, [responseObject, selectedPlaceId]);

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text).then(() => {
            alert('cURL command copied to clipboard!');
        }).catch(err => {
            console.error('Failed to copy: ', err);
        });
    };

    return (
        <div className="p-4 space-y-4">
            <h3 className="text-lg font-semibold px-1">Results</h3>

            {markers.length > 0 && (
                <div>
                    <h4 className="text-base font-semibold mb-2">Places Found</h4>
                    <div ref={listContainerRef} className="max-h-60 overflow-auto border border-gray-200 rounded-lg">
                        <div className="inline-block min-w-full align-top">
                            {markers.map((marker) => (
                                <div
                                    key={marker.details.id}
                                    ref={marker.details.id === selectedPlaceId ? selectedItemRef : null}
                                    tabIndex={0}
                                    {...focusProps}
                                    onClick={(e) => {
                                        onSelectPlace(marker.details.id);
                                        e.currentTarget.blur();
                                    }}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' || e.key === ' ') {
                                            onSelectPlace(marker.details.id);
                                            e.currentTarget.blur();
                                        }
                                    }}
                                    className={`flex items-start gap-3 p-2 cursor-pointer border-b last:border-b-0 focus:outline-none ${marker.details.id === selectedPlaceId ? 'bg-blue-50' : 'hover:bg-gray-50'}`}
                                >
                                    <span className="flex-shrink-0 w-6 h-6 text-xs font-bold text-white bg-gray-500 rounded-full flex items-center justify-center">{marker.label}</span>
                                    <div className="flex-grow min-w-0">
                                        <p className="text-sm font-medium text-gray-800 whitespace-nowrap">{marker.title}</p>
                                        <p className="text-xs text-gray-500 whitespace-nowrap">{marker.details.formattedAddress || marker.placePrediction.text.text}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            <div>
                <h4 className="text-base font-semibold mb-2">Autocomplete Response</h4>
                <div ref={jsonContainerRef} className="max-h-72 overflow-auto bg-gray-100 rounded-lg border border-gray-200">
                    <div className="inline-block min-w-full">
                        <pre ref={preRef} className="p-2.5 text-xs font-mono whitespace-pre">
                            {/* Content will be set by useEffect */}
                        </pre>
                    </div>
                </div>
            </div>

            {curlCommand && (
                <div>
                    <h4 className="text-base font-semibold mb-2">Generated cURL Request</h4>
                    <pre className="whitespace-pre max-h-48 overflow-auto bg-gray-800 text-gray-200 p-3 rounded-lg text-xs font-mono">
                        {curlCommand}
                    </pre>
                    <button
                        {...focusProps}
                        onClick={() => copyToClipboard(curlCommand)}
                        className="mt-2 bg-blue-600 text-white font-semibold py-1.5 px-3 rounded-md text-sm hover:bg-blue-700 transition focus:outline-none">
                        Copy cURL
                    </button>
                </div>
            )}
        </div>
    );
};

export default ResultsPanel;
