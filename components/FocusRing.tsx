import React, { createContext, useContext, useState, useLayoutEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';

interface FocusRingContextValue {
    setFocusedElement: (element: HTMLElement | null) => void;
}

const FocusRingContext = createContext<FocusRingContextValue | null>(null);

export const FocusRingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [focusedElement, setFocusedElement] = useState<HTMLElement | null>(null);
    const value = { setFocusedElement };

    return (
        <FocusRingContext.Provider value={value}>
            {children}
            <FocusRing focusedElement={focusedElement} />
        </FocusRingContext.Provider>
    );
};

export const useFocusRing = () => {
    const context = useContext(FocusRingContext);
    if (!context) {
        throw new Error('useFocusRing must be used within a FocusRingProvider');
    }

    const onFocus = useCallback((e: React.FocusEvent<HTMLElement>) => {
        context.setFocusedElement(e.currentTarget);
    }, [context]);

    const onBlur = useCallback((e: React.FocusEvent<HTMLElement>) => {
        // Hide the ring only if focus moves outside the blurring component.
        // This is crucial for composite components where focus shifts between internal elements.
        if (!e.currentTarget.contains(e.relatedTarget as Node)) {
            context.setFocusedElement(null);
        }
    }, [context]);

    return { onFocus, onBlur };
};

const FocusRing: React.FC<{ focusedElement: HTMLElement | null }> = ({ focusedElement }) => {
    const [style, setStyle] = useState<React.CSSProperties>({
        position: 'absolute',
        opacity: 0,
        transform: 'scale(0.95)',
        pointerEvents: 'none',
        border: '2px solid #3b82f6',
        borderRadius: '8px',
        zIndex: 1400,
        boxSizing: 'border-box',
    });

    const updatePosition = useCallback(() => {
        if (focusedElement) {
            const rect = focusedElement.getBoundingClientRect();
            const elementStyle = window.getComputedStyle(focusedElement);
            const borderRadius = elementStyle.getPropertyValue('border-radius');
            
            setStyle(prev => ({
                ...prev,
                opacity: 1,
                transform: 'scale(1)',
                width: rect.width + 8,
                height: rect.height + 8,
                top: rect.top + window.scrollY - 4,
                left: rect.left + window.scrollX - 4,
                borderRadius: `calc(${borderRadius} + 4px)`,
            }));
        } else {
            setStyle(prev => ({
                ...prev,
                opacity: 0,
                transform: 'scale(0.95)',
            }));
        }
    }, [focusedElement]);

    useLayoutEffect(() => {
        const handleUpdate = () => requestAnimationFrame(updatePosition);

        if (focusedElement) {
            handleUpdate();
            
            const resizeObserver = new ResizeObserver(handleUpdate);
            resizeObserver.observe(focusedElement);
            
            document.addEventListener('scroll', handleUpdate, true);
            window.addEventListener('resize', handleUpdate);
            
            return () => {
                resizeObserver.disconnect();
                document.removeEventListener('scroll', handleUpdate, true);
                window.removeEventListener('resize', handleUpdate);
            };
        } else {
            // Animate out
            updatePosition();
        }
    }, [focusedElement, updatePosition]);

    return createPortal(<div style={style} />, document.body);
};