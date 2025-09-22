// A comprehensive list of fields available for Place Details requests.
// Source: https://developers.google.com/maps/documentation/places/web-service/place-data-fields

export const CATEGORIZED_PLACE_FIELDS: { [key: string]: string[] } = {
    'Basic': [
        'addressComponents',
        'adrAddress',
        'businessStatus',
        'displayName',
        'formattedAddress',
        'geometry',
        'icon',
        'iconBackgroundColor',
        'iconMaskBaseUri',
        'id',
        'location',
        'name',
        'photos',
        'placeId',
        'plusCode',
        'types',
        'url',
        'userRatingCount',
        'utcOffsetMinutes',
        'vicinity',
        'viewport',
        'website',
    ],
    'Atmosphere': [
        'allowsDogs',
        'goodForChildren',
        'goodForCouples',
        'goodForGroups',
        'goodForWatchingSports',
        'liveMusic',
        'menuForChildren',
        'outdoorSeating',
        'reservable',
        'restroom',
        'servesBeer',
        'servesBreakfast',
        'servesBrunch',
        'servesCocktails',
        'servesCoffee',
        'servesDessert',
        'servesDinner',
        'servesLunch',
        'servesVegetarianFood',
        'servesWine',
    ],
    'Contact': [
        'currentOpeningHours',
        'internationalPhoneNumber',
        'nationalPhoneNumber',
        'regularOpeningHours',
    ],
    'Food and Drink': [
        'dineIn',
        'delivery',
        'takeout',
        'curbsidePickup',
    ],
    'Payment': [
        'paymentOptions',
    ],
    'Other': [
        'priceLevel',
        'rating',
        'reviews',
        'wheelchairAccessibleEntrance',
        'generativeSummary',
        'areaSummary',
    ],
};


// A flattened array for autocomplete suggestions
export const ALL_PLACE_FIELDS: string[] = Object.values(CATEGORIZED_PLACE_FIELDS).flat().sort();
