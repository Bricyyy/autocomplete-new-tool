import React from 'react';
import MultiSelectInput from './MultiSelectInput';
import { CATEGORIZED_COUNTRIES, ALL_COUNTRIES, Country } from '../utils/regionCodes';

interface RegionCodesInputProps {
    value: string;
    onChange: (value: string) => void;
    id?: string;
}

const filterFn = (country: Country, inputValue: string, selectedValues: string[]): boolean => {
    const lowerInputValue = inputValue.toLowerCase();
    const countryCode = country.code;
    return !selectedValues.includes(countryCode) &&
           (country.name.toLowerCase().includes(lowerInputValue) || countryCode.toLowerCase().includes(lowerInputValue));
};

const RegionCodesInput: React.FC<RegionCodesInputProps> = (props) => {
    return (
        <MultiSelectInput<Country>
            {...props}
            placeholder="e.g., US, CA"
            categorizedData={CATEGORIZED_COUNTRIES}
            allItems={ALL_COUNTRIES}
            itemToString={(country) => country.code}
            itemToLabel={(country) => `${country.name} (${country.code})`}
            filterFn={filterFn}
            maxItems={15}
            maxItemsMessage="A maximum of 15 region codes can be included."
        />
    );
};

export default RegionCodesInput;
