import { useEffect, useRef } from 'react';

const ClickTracker = () => {
    const clickCountRef = useRef(0);
    const SMART_LINK = 'https://breachuptown.com/ktayqzg5m?key=79af0e9332de5c4e2dd1a58fd88f666a';
    const CLICK_THRESHOLD = 5;

    useEffect(() => {
        const handleClick = (event) => {
            // Increment click count
            clickCountRef.current += 1;

            // Check if we've reached the threshold
            if (clickCountRef.current >= CLICK_THRESHOLD) {
                // Reset counter
                clickCountRef.current = 0;

                // Open smart link in new tab
                window.open(SMART_LINK, '_blank', 'noopener,noreferrer');
            }
        };

        // Add click listener to document
        document.addEventListener('click', handleClick, true);

        // Cleanup
        return () => {
            document.removeEventListener('click', handleClick, true);
        };
    }, []);

    return null; // This component doesn't render anything
};

export default ClickTracker;
