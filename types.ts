




// FIX: To fix "Cannot find name 'google'" and "Cannot find namespace 'google'" errors,
// the `google` namespace declaration is moved inside `declare global` to make it available in all files.
declare global {
  // FIX: To fix "Cannot find namespace 'google'", `const google: any` was replaced
  // with a `namespace` declaration. This allows `google.maps.*` to be used as types.
  // `maps` is declared as `any` to avoid needing full type definitions for the Google Maps API.
  namespace google {
    // FIX: Changed `const maps: any` to `namespace maps` to correctly define it as a namespace for types.
    // The members are declared as `const` of type `any` to allow them to be used as both types and values (e.g., constructors)
    // without full type definitions, resolving the "no exported member 'maps'" errors.
    namespace maps {
      // FIX: Replaced `const` declarations with `declare class` for Google Maps API types.
      // This provides both a type for instances and a value for constructors, resolving errors
      // where a value was being used as a type. The `[key: string]: any` index signature
      // preserves the flexibility of the original `any` type, allowing calls to any method.
      // FIX: Removed redundant 'declare' modifier from class definitions as they are already in an ambient context, and added generic constructors to fix instantiation errors.
      class Map {
        constructor(...args: any[]);
        [key: string]: any;
      }
      class InfoWindow {
        constructor(...args: any[]);
        [key: string]: any;
      }
      class Marker {
        constructor(...args: any[]);
        [key: string]: any;
      }
      class Circle {
        constructor(...args: any[]);
        [key: string]: any;
      }
      class Rectangle {
        constructor(...args: any[]);
        [key: string]: any;
      }
      class LatLngBounds {
        constructor(...args: any[]);
        [key: string]: any;
      }
      class Size {
        constructor(width: number, height: number, widthUnit?: string, heightUnit?: string);
        [key: string]: any;
      }
      class Point {
        constructor(x: number, y: number);
        [key: string]: any;
      }
      // FIX: Added MapMouseEvent class definition to resolve 'no exported member' errors in MapComponent.tsx.
      class MapMouseEvent {
        [key: string]: any;
      }
      const event: any;

      namespace drawing {
        class DrawingManager {
          constructor(...args: any[]);
          [key: string]: any;
        }
        const OverlayType: any;
      }
    }
  }

  interface Window {
    google: typeof google;
  }
}

export interface LatLng {
  latitude: number;
  longitude: number;
}

export interface Circle {
  center: LatLng;
  radius: number;
}

export interface Rectangle {
  low: LatLng;
  high: LatLng;
}

export interface LocationBias {
  rectangle?: Rectangle;
  circle?: Circle;
}

export interface LocationRestriction {
  rectangle?: Rectangle;
  circle?: Circle;
}

export interface AutocompleteRequest {
  input: string;
  languageCode?: string;
  includedPrimaryTypes?: string[];
  includePureServiceAreaBusinesses?: boolean | null;
  includeQueryPredictions?: boolean | null;
  includedRegionCodes?: string[];
  inputOffset?: number;
  regionCode?: string;
  origin?: LatLng | null;
  locationBias?: LocationBias | null;
  locationRestriction?: LocationRestriction | null;
}

export interface PlacePrediction {
    placeId: string;
    text: {
        text: string;
        matches: {
            endOffset: number;
        }[];
    };
}

export interface AutocompleteSuggestion {
    placePrediction: PlacePrediction;
}

export interface AutocompleteResponse {
    suggestions: AutocompleteSuggestion[];
}

export interface PlaceDetails {
    id: string;
    displayName?: { text: string; languageCode: string };
    formattedAddress?: string;
    location?: LatLng;
    types?: string[];
}

export interface MarkerData {
    position: { lat: number, lng: number };
    title: string;
    label: string;
    state: 'insideRestr' | 'insideBias' | 'outside';
    details: PlaceDetails;
    placePrediction: PlacePrediction;
}