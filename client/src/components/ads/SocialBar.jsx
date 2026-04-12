import { useEffect } from 'react';

function SocialBar() {
    useEffect(() => {
        // Randomly decide how many ads to show (2 or 3)
        const numAds = Math.random() > 0.5 ? 2 : 3;
        
        // Check if scripts already loaded
        const existingScript = document.querySelector('script[src*="53e55836ee891aa30b1843270191bee1"]');
        if (existingScript) return;

        // Load multiple instances of the ad script
        for (let i = 0; i < numAds; i++) {
            // Add a small delay between each ad load to prevent conflicts
            setTimeout(() => {
                const script = document.createElement('script');
                script.src = 'https://breachuptown.com/53/e5/58/53e55836ee891aa30b1843270191bee1.js';
                script.async = true;
                script.setAttribute('data-ad-instance', i);
                document.body.appendChild(script);
            }, i * 500); // 500ms delay between each ad
        }

        return () => {
            // Don't remove on unmount as it's global
        };
    }, []);

    return null; // This ad renders itself
}

export default SocialBar;
