import { useEffect } from 'react';

function Popunder() {
    useEffect(() => {
        // Check if popunder already shown in this session
        const popunderShown = sessionStorage.getItem('popunder_shown');
        if (popunderShown) return;

        // Check if script already loaded
        const existingScript = document.querySelector('script[src*="312d000878fa23ff92459a4fb1eac311"]');
        if (existingScript) return;

        // Mark as shown
        sessionStorage.setItem('popunder_shown', 'true');

        // Load popunder script
        const script = document.createElement('script');
        script.src = 'https://breachuptown.com/31/2d/00/312d000878fa23ff92459a4fb1eac311.js';
        script.async = true;
        document.body.appendChild(script);

        return () => {
            // Don't remove on unmount
        };
    }, []);

    return null; // This ad renders itself
}

export default Popunder;
