import React, { useLayoutEffect, useState } from 'react';
import { createPortal } from 'react-dom';

interface PortalProps {
    children: React.ReactNode;
    targetRef: React.RefObject<HTMLElement>;
    isOpen: boolean;
    offsetY?: number;
    offsetX?: number;
}

const Portal: React.FC<PortalProps> = ({ children, targetRef, isOpen, offsetY = 4, offsetX = 0 }) => {
    const [position, setPosition] = useState({ top: 0, left: 0, width: 0 });

    useLayoutEffect(() => {
        const targetElement = targetRef.current;
        if (!isOpen || !targetElement) return;

        const updatePosition = () => {
            if (targetRef.current) { // Check ref again inside closure
                const targetRect = targetRef.current.getBoundingClientRect();
                setPosition({
                    top: targetRect.bottom + window.scrollY + offsetY,
                    left: targetRect.left + window.scrollX + offsetX,
                    width: targetRect.width,
                });
            }
        };

        updatePosition();

        // Use a ResizeObserver to update position when the target element's size changes
        const resizeObserver = new ResizeObserver(updatePosition);
        resizeObserver.observe(targetElement);

        // Using `true` for capture phase to catch scroll events on any parent element
        document.addEventListener('scroll', updatePosition, true);
        window.addEventListener('resize', updatePosition);

        return () => {
            resizeObserver.disconnect();
            document.removeEventListener('scroll', updatePosition, true);
            window.removeEventListener('resize', updatePosition);
        };
    }, [isOpen, targetRef, offsetY, offsetX]);

    if (!isOpen) {
        return null;
    }

    return createPortal(
        <div
            style={{
                position: 'absolute',
                top: `${position.top}px`,
                left: `${position.left}px`,
                width: `${position.width}px`,
                zIndex: 1300, // High z-index to appear above other content
            }}
        >
            {children}
        </div>,
        document.body
    );
};

export default Portal;