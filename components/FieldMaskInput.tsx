import React from 'react';
import MultiSelectInput from './MultiSelectInput';
import { CATEGORIZED_PLACE_FIELDS, ALL_PLACE_FIELDS } from '../utils/placeFields';

interface FieldMaskInputProps {
    value: string;
    onChange: (value: string) => void;
    id?: string;
}

const filterFn = (field: string, inputValue: string, selectedValues: string[]): boolean => {
    return !selectedValues.includes(field) && field.toLowerCase().startsWith(inputValue.toLowerCase());
};

const FieldMaskInput: React.FC<FieldMaskInputProps> = (props) => {
    return (
        <MultiSelectInput<string>
            {...props}
            placeholder="e.g., displayName,location"
            categorizedData={CATEGORIZED_PLACE_FIELDS}
            allItems={ALL_PLACE_FIELDS}
            itemToString={(item) => item}
            itemToLabel={(item) => item}
            filterFn={filterFn}
        />
    );
};

export default FieldMaskInput;
