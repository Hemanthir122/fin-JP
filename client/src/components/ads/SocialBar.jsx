import { useEffect, useRef } from 'react';

function SocialBar() {
    const containerRef = useRef(null);

    useEffect(() => {
        // Randomly decide how many ads to show (2 or 3)
        const numAds = Math.random() > 0.5 ? 2 : 3;
        
        // Check if scripts already loaded
        const existingScript = document.querySelector('script[src*="53e55836ee891aa30b1843270191bee1"]');
        if (existingScript) return;

        // Create container for ads if it doesn't exist
        let adsContainer = document.getElementById('social-ads-container');
        if (!adsContainer) {
            adsContainer = document.createElement('div');
            adsContainer.id = 'social-ads-container';
            adsContainer.style.cssText = `
                position: fixed;
                bottom: 0;
                left: 0;
                right: 0;
                z-index: 9999;
                display: flex;
                flex-direction: column;
                gap: 10px;
                padding: 10px;
                pointer-events: none;
            `;
            document.body.appendChild(adsContainer);
        }

        // Load multiple instances of the ad script
        for (let i = 0; i < numAds; i++) {
            setTimeout(() => {
                // Create a separate div for each ad
                const adDiv = document.createElement('div');
                adDiv.id = `social-ad-${i}`;
                adDiv.style.cssText = `
                    width: 100%;
                    pointer-events: auto;
                    margin-bottom: 5px;
                `;
                adsContainer.appendChild(adDiv);

                // Load the ad script
                const script = document.createElement('script');
                script.src = 'https://breachuptown.com/53/e5/58/53e55836ee891aa30b1843270191bee1.js';
                script.async = true;
                script.setAttribute('data-ad-instance', i);
                adDiv.appendChild(script);
            }, i * 800); // 800ms delay between each ad
        }

        return () => {
            // Cleanup on unmount
            const container = document.getElementById('social-ads-container');
            if (container) {
                container.remove();
            }
        };
    }, []);

    return null; // This ad renders itself
}

export default SocialBar;
