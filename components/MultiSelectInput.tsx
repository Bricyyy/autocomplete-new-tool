import React, { useState, useRef, useEffect, useCallback } from 'react';
import Portal from './Portal';
import { useFocusRing } from './FocusRing';

// --- PROPS & TYPES ---

interface MultiSelectInputProps<T> {
    value: string;
    onChange: (value: string) => void;
    id?: string;
    placeholder: string;
    categorizedData: { [key: string]: T[] };
    allItems: T[];
    itemToString: (item: T) => string;
    itemToLabel: (item: T) => string;
    filterFn: (item: T, inputValue: string, selectedValues: string[]) => boolean;
    maxItems?: number;
    maxItemsMessage?: string;
    dropdownColumns?: number;
}

// --- HOOKS ---

const useClickOutside = (refs: React.RefObject<HTMLElement>[], callback: () => void) => {
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            const isOutside = refs.every(ref => !ref.current || !ref.current.contains(event.target as Node));
            if (isOutside) {
                callback();
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [refs, callback]);
};


// --- COMPONENT ---

const MultiSelectInput = <T,>({
    value,
    onChange,
    id,
    placeholder,
    categorizedData,
    allItems,
    itemToString,
    itemToLabel,
    filterFn,
    maxItems,
    maxItemsMessage,
    dropdownColumns = 1,
}: MultiSelectInputProps<T>) => {
    const [inputValue, setInputValue] = useState('');
    const [suggestions, setSuggestions] = useState<T[]>([]);
    const [isInputFocused, setIsInputFocused] = useState(false);
    const [isSelectorOpen, setIsSelectorOpen] = useState(false);
    const [activeIndex, setActiveIndex] = useState(-1);
    
    const inputRef = useRef<HTMLInputElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const wrapperRef = useRef<HTMLDivElement>(null);
    const selectorPopupRef = useRef<HTMLDivElement>(null);
    const suggestionsRef = useRef<HTMLUListElement>(null);
    
    const selectedValues = value ? value.split(',').filter(Boolean) : [];
    const focusProps = useFocusRing();

    const isAtMax = maxItems !== undefined && selectedValues.length >= maxItems;

    // --- LOGIC ---

    const addItem = useCallback((itemValue: string) => {
        const trimmedValue = itemValue.trim();
        if (maxItems !== undefined && selectedValues.length >= maxItems) {
            if (maxItemsMessage) alert(maxItemsMessage);
            return;
        }
        if (trimmedValue && !selectedValues.includes(trimmedValue)) {
            onChange([...selectedValues, trimmedValue].join(','));
        }
        setInputValue('');
        setSuggestions([]);
        setActiveIndex(-1);
    }, [selectedValues, onChange, maxItems, maxItemsMessage]);

    const removeItem = (itemToRemove: string) => {
        const newValues = selectedValues.filter(v => v !== itemToRemove);
        onChange(newValues.join(','));
    };
    
    const handleItemToggle = (item: T) => {
        const itemValue = itemToString(item);
        if (selectedValues.includes(itemValue)) {
            removeItem(itemValue);
        } else {
            addItem(itemValue);
        }
    };
    
    useClickOutside([containerRef, selectorPopupRef, suggestionsRef], () => {
        setIsSelectorOpen(false);
    });

    useEffect(() => {
        if (inputValue && isInputFocused) {
            const filtered = allItems.filter(item => filterFn(item, inputValue, selectedValues));
            setSuggestions(filtered);
        } else {
            setSuggestions([]);
        }
    }, [inputValue, isInputFocused, allItems, filterFn, selectedValues]);
    
    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        switch (e.key) {
            case 'Enter':
            case ',':
                e.preventDefault();
                if (activeIndex > -1 && suggestions[activeIndex]) {
                    addItem(itemToString(suggestions[activeIndex]));
                } else if (inputValue) {
                    addItem(inputValue);
                }
                break;
            case 'Backspace':
                if (inputValue === '' && selectedValues.length > 0) {
                    removeItem(selectedValues[selectedValues.length - 1]);
                }
                break;
            case 'ArrowDown':
                e.preventDefault();
                setActiveIndex(prev => (prev < suggestions.length - 1 ? prev + 1 : prev));
                break;
            case 'ArrowUp':
                e.preventDefault();
                setActiveIndex(prev => (prev > 0 ? prev - 1 : prev));
                break;
            case 'Escape':
                setSuggestions([]);
                setActiveIndex(-1);
                setIsSelectorOpen(false);
                inputRef.current?.blur();
                break;
            default:
                break;
        }
    };

    const handleBlur = () => {
        setTimeout(() => {
            const activeEl = document.activeElement;
            const isFocusOutside = (wrapperRef.current && !wrapperRef.current.contains(activeEl)) &&
                                 (!selectorPopupRef.current || !selectorPopupRef.current.contains(activeEl)) &&
                                 (!suggestionsRef.current || !suggestionsRef.current.contains(activeEl));
            if (isFocusOutside) {
                 if(inputValue) addItem(inputValue);
                 setIsInputFocused(false);
                 setIsSelectorOpen(false);
            }
        }, 150);
    };
    
    const handleMouseDownOnPopup = (e: React.MouseEvent) => {
        if (window.getSelection()?.toString().length) {
            window.getSelection()?.removeAllRanges();
        }
        e.preventDefault();
    };

    // --- RENDER ---

    return (
        <div ref={containerRef} className="relative">
            <div
                ref={wrapperRef}
                {...focusProps}
                tabIndex={-1}
                className="flex items-center w-full box-border rounded-lg border border-gray-300 bg-white text-sm transition focus:outline-none"
            >
                <div 
                    className="flex-grow px-2 py-1.5 flex flex-wrap items-center gap-1.5"
                    onClick={(e) => { if (e.target === e.currentTarget) inputRef.current?.focus(); }}
                    onMouseDown={(e) => { if (e.target instanceof HTMLElement && e.target.nodeName === 'BUTTON') e.preventDefault(); }}
                >
                    {selectedValues.map(v => (
                        <span key={v} className="bg-blue-100 text-blue-800 text-xs font-semibold px-2 py-1 rounded-full flex items-center gap-1.5 whitespace-nowrap">
                            {v}
                            <button 
                                type="button"
                                onClick={(e) => { e.stopPropagation(); removeItem(v); }}
                                className="text-blue-500 hover:text-blue-700 font-bold focus:outline-none"
                                aria-label={`Remove ${v}`}
                            >&times;</button>
                        </span>
                    ))}
                    <input
                        ref={inputRef}
                        id={id}
                        type="text"
                        value={inputValue}
                        onChange={(e) => {
                            setInputValue(e.target.value);
                            if (isSelectorOpen) {
                                setIsSelectorOpen(false);
                            }
                            setActiveIndex(-1);
                        }}
                        onKeyDown={handleKeyDown}
                        onFocus={() => setIsInputFocused(true)}
                        onBlur={handleBlur}
                        className="flex-grow bg-transparent outline-none p-0.5 min-w-[100px]"
                        placeholder={selectedValues.length === 0 ? placeholder : ''}
                        aria-autocomplete="list"
                        aria-expanded={suggestions.length > 0}
                        disabled={isAtMax}
                    />
                </div>
                <button
                    type="button"
                    onClick={() => setIsSelectorOpen(prev => !prev)}
                    className="flex-shrink-0 px-2 self-stretch border-l border-gray-300 text-gray-500 hover:text-blue-600 hover:bg-gray-50 rounded-r-lg focus:outline-none"
                    aria-label="Select items"
                >
                    +
                </button>
            </div>
            
            <Portal isOpen={isSelectorOpen} targetRef={containerRef}>
                <div 
                    ref={selectorPopupRef} 
                    onMouseDown={handleMouseDownOnPopup}
                    className="bg-white border border-gray-300 rounded-md shadow-lg max-h-96 overflow-auto p-2 text-sm"
                    style={{ width: dropdownColumns > 1 ? '640px' : undefined }} // Wider for columns
                >
                    <div style={{ columns: dropdownColumns, columnGap: '1rem' }}>
                        {Object.entries(categorizedData).map(([category, items]) => (
                            <div key={category} className="mb-3 last:mb-0" style={{ breakInside: 'avoid' }}>
                                <h5 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 px-2">{category}</h5>
                                <div className="space-y-1">
                                    {items.map((item, index) => {
                                        const itemValue = itemToString(item);
                                        const isSelected = selectedValues.includes(itemValue);
                                        const isDisabled = isAtMax && !isSelected;
                                        return (
                                            <label key={index} className={`flex items-center gap-2 p-2 rounded-md ${isDisabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer hover:bg-gray-100'}`}>
                                                <input
                                                    type="checkbox"
                                                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:outline-none focus:ring-0 disabled:bg-gray-200"
                                                    checked={isSelected}
                                                    onChange={() => handleItemToggle(item)}
                                                    disabled={isDisabled}
                                                />
                                                <span className="text-gray-700">{itemToLabel(item)}</span>
                                            </label>
                                        );
                                    })}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </Portal>

            <Portal isOpen={isInputFocused && suggestions.length > 0 && !isSelectorOpen} targetRef={containerRef}>
                <ul ref={suggestionsRef} className="bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
                    {suggestions.map((item, index) => (
                        <li
                            key={index}
                            className={`px-3 py-2 cursor-pointer text-sm ${index === activeIndex ? 'bg-blue-500 text-white' : 'hover:bg-gray-100'}`}
                            onMouseDown={(e) => { e.preventDefault(); addItem(itemToString(item)); }}
                            role="option"
                            aria-selected={index === activeIndex}
                        >
                            {itemToLabel(item)}
                        </li>
                    ))}
                </ul>
            </Portal>
        </div>
    );
};

export default MultiSelectInput;