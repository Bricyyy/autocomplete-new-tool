import React, { useState } from 'react';
import { AutocompleteRequest } from '../types';
import FieldMaskInput from './FieldMaskInput';
import LocationForm from './LocationForm';
import { useFocusRing } from './FocusRing';
import RegionCodesInput from './RegionCodesInput';
import PrimaryTypesInput from './PrimaryTypesInput';

interface RequestFormProps {
    apiKey: string;
    setApiKey: (value: string) => void;
    request: AutocompleteRequest;
    setRequest: (request: AutocompleteRequest) => void;
    fieldMask: string;
    setFieldMask: (value: string) => void;
    drawingFor: 'bias' | 'restriction' | null;
    setDrawingFor: (drawingFor: 'bias' | 'restriction' | null) => void;
    responseObject: any | null;
    submittedRequest: AutocompleteRequest | null;
    hasBeenCleared: boolean;
    isPlacingOrigin: boolean;
    setIsPlacingOrigin: (value: boolean) => void;
}

const Input: React.FC<React.InputHTMLAttributes<HTMLInputElement> & { className?: string }> = ({ className, ...props }) => {
    const focusProps = useFocusRing();
    const baseClasses = "w-full box-border px-3 py-2 rounded-lg border border-gray-300 bg-white text-sm focus:outline-none transition";
    return <input {...props} {...focusProps} className={[baseClasses, className].filter(Boolean).join(' ')} />;
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


const Label: React.FC<{htmlFor: string; children: React.ReactNode}> = ({htmlFor, children}) => (
    <label htmlFor={htmlFor} className="block text-xs font-medium text-gray-600 mb-1.5">{children}</label>
);


const RequestForm: React.FC<RequestFormProps> = ({ apiKey, setApiKey, request, setRequest, fieldMask, setFieldMask, drawingFor, setDrawingFor, responseObject, submittedRequest, hasBeenCleared, isPlacingOrigin, setIsPlacingOrigin }) => {
    
    const [originInput, setOriginInput] = useState(() => request.origin ? `${request.origin.latitude},${request.origin.longitude}` : '');
    const [isExpanded, setIsExpanded] = useState(false);
    const [isApiKeyVisible, setIsApiKeyVisible] = useState(false);

    React.useEffect(() => {
        if (request.origin) {
            setOriginInput(`${request.origin.latitude},${request.origin.longitude}`);
        } else {
            setOriginInput('');
        }
    }, [request.origin]);

    const handleOriginChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        const sanitizedValue = value.replace(/[^0-9.,-]/g, '');
        setOriginInput(sanitizedValue);

        const parts = sanitizedValue.split(',');
        if (parts.length === 2) {
            const lat = parseFloat(parts[0]);
            const lng = parseFloat(parts[1]);
            if (!isNaN(lat) && !isNaN(lng) && parts[0].trim() !== '' && parts[1].trim() !== '') {
                setRequest({ ...request, origin: { latitude: lat, longitude: lng } });
            } else {
                if (request.origin !== null) setRequest({ ...request, origin: null });
            }
        } else {
            if (request.origin !== null) setRequest({ ...request, origin: null });
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;

        let processedValue: any = value;
        if (name === 'includePureServiceAreaBusinesses' || name === 'includeQueryPredictions') {
            processedValue = value === "" ? null : value === 'true';
        } else if (name === 'inputOffset') {
            processedValue = value === '' ? undefined : parseInt(value, 10);
        }

        setRequest({ ...request, [name]: processedValue });
    };

    const handleOriginButtonClick = () => {
        if (request.origin) {
            setRequest({ ...request, origin: null });
            if (isPlacingOrigin) {
                setIsPlacingOrigin(false);
            }
        } else {
            setIsPlacingOrigin(!isPlacingOrigin);
        }
    };

    const getOriginButtonConfig = () => {
        if (request.origin) {
            return {
                label: 'Remove',
                icon: 'close',
                className: 'bg-red-100 text-red-700 hover:bg-red-200',
            };
        }
        if (isPlacingOrigin) {
            return {
                label: 'Cancel',
                icon: 'cancel',
                className: 'bg-gray-200 text-gray-700 hover:bg-gray-300',
            };
        }
        return {
            label: 'Place',
            icon: 'add_location',
            className: 'bg-blue-100 text-blue-700 hover:bg-blue-200',
        };
    };

    const originButtonConfig = getOriginButtonConfig();

    return (
        <div className="space-y-4 px-1">
            {/* --- Required Fields --- */}
            <div>
                <Label htmlFor="apiKey">API Key</Label>
                <div className="relative">
                    <Input id="apiKey" name="apiKey" type={isApiKeyVisible ? 'text' : 'password'} value={apiKey} onChange={(e) => setApiKey(e.target.value)} className="pr-12" autoComplete="off" spellCheck="false" />
                    <button
                        type="button"
                        onClick={() => setIsApiKeyVisible(!isApiKeyVisible)}
                        className="absolute inset-y-0 right-0 px-3 flex items-center text-gray-500 hover:text-gray-700 rounded-r-lg focus:outline-none"
                        aria-label={isApiKeyVisible ? 'Hide API Key' : 'Show API Key'}
                    >
                        <span className="material-icons text-lg">
                            {isApiKeyVisible ? 'visibility_off' : 'visibility'}
                        </span>
                    </button>
                </div>
            </div>
            <div>
                <Label htmlFor="input">Input (required)</Label>
                <Input id="input" name="input" type="text" value={request.input} onChange={handleChange} />
            </div>

            {/* --- Expander Button --- */}
            <div className="pt-2">
                <button
                    type="button"
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="text-sm text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1 w-full justify-start focus:outline-none"
                    aria-expanded={isExpanded}
                >
                    {isExpanded ? 'Hide Optional Parameters' : 'Show Optional Parameters'}
                    <span className={`material-icons text-lg transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}>
                        expand_more
                    </span>
                </button>
            </div>
            
            {/* --- Optional Fields (Collapsible) --- */}
            <div className={`transition-all duration-300 ease-in-out overflow-hidden ${isExpanded ? 'max-h-[2000px] opacity-100 pt-2' : 'max-h-0 opacity-0'}`}>
                <div className="space-y-4 border-t border-gray-200 pt-4">
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <Label htmlFor="languageCode">languageCode</Label>
                            <Input id="languageCode" name="languageCode" type="text" value={request.languageCode} onChange={handleChange} placeholder="en" />
                        </div>
                         <div>
                            <Label htmlFor="regionCode">regionCode</Label>
                            <Input id="regionCode" name="regionCode" type="text" value={request.regionCode} onChange={handleChange} placeholder="us" />
                        </div>
                    </div>
                    <div>
                        <Label htmlFor="includedPrimaryTypes">includedPrimaryTypes</Label>
                        <PrimaryTypesInput
                            id="includedPrimaryTypes"
                            value={request.includedPrimaryTypes?.join(',') || ''}
                            onChange={(newValue) => {
                                const newTypes = newValue.split(',').map(s => s.trim()).filter(Boolean);
                                setRequest({ ...request, includedPrimaryTypes: newTypes });
                            }}
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                         <div>
                            <Label htmlFor="includePureServiceAreaBusinesses">includePureServiceAreaBusinesses</Label>
                            <Select id="includePureServiceAreaBusinesses" name="includePureServiceAreaBusinesses" value={request.includePureServiceAreaBusinesses === null ? '' : String(request.includePureServiceAreaBusinesses)} onChange={handleChange}>
                                <option value="">(omit)</option>
                                <option value="true">true</option>
                                <option value="false">false</option>
                            </Select>
                        </div>
                        <div>
                            <Label htmlFor="includeQueryPredictions">includeQueryPredictions</Label>
                            <Select id="includeQueryPredictions" name="includeQueryPredictions" value={request.includeQueryPredictions === null ? '' : String(request.includeQueryPredictions)} onChange={handleChange}>
                                <option value="">(omit)</option>
                                <option value="true">true</option>
                                <option value="false">false</option>
                            </Select>
                        </div>
                    </div>
                     <div>
                        <Label htmlFor="includedRegionCodes">includedRegionCodes</Label>
                        <RegionCodesInput
                            id="includedRegionCodes"
                            value={request.includedRegionCodes?.join(',') || ''}
                            onChange={(newValue) => {
                                const newCodes = newValue.split(',').map(s => s.trim()).filter(Boolean);
                                setRequest({ ...request, includedRegionCodes: newCodes });
                            }}
                        />
                        <p className="text-xs text-gray-500 mt-1.5 px-1">
                            A maximum of 15 region codes can be included.
                        </p>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                         <div>
                            <Label htmlFor="inputOffset">inputOffset</Label>
                            <Input id="inputOffset" name="inputOffset" type="number" value={request.inputOffset ?? ''} onChange={handleChange} />
                        </div>
                        <div>
                            <Label htmlFor="origin">Origin (lat,lng)</Label>
                             <div className="flex gap-2 items-center">
                                <div className="flex-grow">
                                    <Input id="origin" name="origin" type="text" value={originInput} onChange={handleOriginChange} placeholder="15.12,120.57" />
                                </div>
                                <button
                                    type="button"
                                    onClick={handleOriginButtonClick}
                                    className={`px-3 py-2 text-sm font-semibold rounded-lg transition flex-shrink-0 flex items-center gap-1 ${originButtonConfig.className}`}
                                    title={originButtonConfig.label}
                                >
                                    <span className="material-icons text-base">{originButtonConfig.icon}</span>
                                </button>
                             </div>
                        </div>
                    </div>
                    <div>
                        <Label htmlFor="fieldMask">fieldMask (for Place Details)</Label>
                        <FieldMaskInput id="fieldMask" value={fieldMask} onChange={setFieldMask} />
                    </div>
                </div>
                <div className="border-t border-gray-200 mt-4 pt-4">
                    <LocationForm request={request} setRequest={setRequest} drawingFor={drawingFor} setDrawingFor={setDrawingFor} responseObject={responseObject} submittedRequest={submittedRequest} hasBeenCleared={hasBeenCleared} />
                </div>
            </div>
        </div>
    );
};

export default RequestForm;
