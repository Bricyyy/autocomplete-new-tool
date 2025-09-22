import { AutocompleteRequest, AutocompleteResponse, PlaceDetails } from '../types';

const API_BASE_URL = 'https://places.googleapis.com/v1/places';

export const fetchAutocomplete = async (request: AutocompleteRequest, apiKey: string): Promise<AutocompleteResponse> => {
    const response = await fetch(`${API_BASE_URL}:autocomplete?key=${encodeURIComponent(apiKey)}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(request),
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || 'Failed to fetch autocomplete suggestions.');
    }

    return response.json();
};

export const fetchPlaceDetails = async (placeId: string, fieldMask: string, apiKey: string): Promise<PlaceDetails> => {
    const url = `${API_BASE_URL}/${encodeURIComponent(placeId)}?fields=${encodeURIComponent(fieldMask)}&key=${encodeURIComponent(apiKey)}`;
    const response = await fetch(url, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || 'Failed to fetch place details.');
    }

    return response.json();
};

export const buildCurlRequest = (requestBody: AutocompleteRequest, apiKey: string): string => {
    const cleanedRequest: Partial<AutocompleteRequest> = {};

    for (const key in requestBody) {
        const k = key as keyof AutocompleteRequest;
        const value = requestBody[k];

        if (value === null || value === undefined || value === '') {
            continue;
        }
        if (Array.isArray(value) && value.length === 0) {
            continue;
        }
        
        // FIX: Corrected the dynamic assignment to prevent a TypeScript error where `cleanedRequest[k]` was inferred as `never`.
        (cleanedRequest as any)[k] = value;
    }

    const jsonBody = JSON.stringify(cleanedRequest, null, 2);
    return `curl -X POST -d '${jsonBody}' \\
-H 'Content-Type: application/json' \\
-H "X-Goog-Api-Key: ${apiKey}" \\
'https://places.googleapis.com/v1/places:autocomplete'`;
};
