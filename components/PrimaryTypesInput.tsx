import React from 'react';
import MultiSelectInput from './MultiSelectInput';
import { CATEGORIZED_PLACE_TYPES, ALL_PLACE_TYPES } from '../utils/placeTypes';

interface PrimaryTypesInputProps {
    value: string;
    onChange: (value: string) => void;
    id?: string;
}

const filterFn = (type: string, inputValue: string, selectedValues: string[]): boolean => {
    return !selectedValues.includes(type) && type.toLowerCase().includes(inputValue.toLowerCase());
};

const itemToLabel = (item: string): string => {
    // Replace underscores with spaces and capitalize words for better readability
    return item.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
}

const PrimaryTypesInput: React.FC<PrimaryTypesInputProps> = (props) => {
    return (
        <MultiSelectInput<string>
            {...props}
            placeholder="e.g., restaurant, (cities)"
            categorizedData={CATEGORIZED_PLACE_TYPES}
            allItems={ALL_PLACE_TYPES}
            itemToString={(item) => item}
            itemToLabel={itemToLabel}
            filterFn={filterFn}
            dropdownColumns={3}
        />
    );
};

export default PrimaryTypesInput;