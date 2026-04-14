import { useEffect } from 'react';

function SocialBar() {
    useEffect(() => {
        // Randomly decide how many ads to show (2 or 3)
        const numAds = Math.random() > 0.5 ? 2 : 3;
        
        // Check if scripts already loaded
        const existingScript = document.querySelector('script[src*="53e55836ee891aa30b1843270191bee1"]');
        if (existingScript) return;

        // Load multiple instances of the ad script with different positioning
        for (let i = 0; i < numAds; i++) {
            setTimeout(() => {
                // Create a wrapper div for each ad with specific positioning
                const adWrapper = document.createElement('div');
                adWrapper.id = `social-ad-wrapper-${i}`;
                adWrapper.style.cssText = `
                    position: fixed;
                    bottom: ${i * 120}px;
                    left: 0;
                    right: 0;
                    z-index: ${9999 - i};
                    pointer-events: none;
                `;
                
                // Create inner container for the ad
                const adContainer = document.createElement('div');
                adContainer.id = `social-ad-container-${i}`;
                adContainer.style.cssText = `
                    pointer-events: auto;
                    position: relative;
                `;
                
                adWrapper.appendChild(adContainer);
                document.body.appendChild(adWrapper);

                // Load the ad script into the container
                const script = document.createElement('script');
                script.src = 'https://breachuptown.com/53/e5/58/53e55836ee891aa30b1843270191bee1.js';
                script.async = true;
                script.setAttribute('data-ad-instance', i);
                adContainer.appendChild(script);
            }, i * 1000); // 1 second delay between each ad
        }

        return () => {
            // Cleanup on unmount
            for (let i = 0; i < 3; i++) {
                const wrapper = document.getElementById(`social-ad-wrapper-${i}`);
                if (wrapper) {
                    wrapper.remove();
                }
            }
        };
    }, []);

    return null; // This ad renders itself
}

export default SocialBar;
