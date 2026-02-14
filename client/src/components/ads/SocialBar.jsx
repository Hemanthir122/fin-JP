import { useEffect } from 'react';

function SocialBar() {
    useEffect(() => {
        // Check if script already loaded
        const existingScript = document.querySelector('script[src*="53e55836ee891aa30b1843270191bee1"]');
        if (existingScript) return;

        const script = document.createElement('script');
        script.src = 'https://breachuptown.com/53/e5/58/53e55836ee891aa30b1843270191bee1.js';
        script.async = true;
        document.body.appendChild(script);

        return () => {
            // Don't remove on unmount as it's global
        };
    }, []);

    return null; // This ad renders itself
}

export default SocialBar;
