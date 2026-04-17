import { useEffect } from 'react';

function SocialBar() {
    useEffect(() => {
        // Always show 3 ads
        const numAds = 3;
        
        // Check if scripts already loaded
        const existingScript = document.querySelector('script[src*="53e55836ee891aa30b1843270191bee1"]');
        if (existingScript) return;

        // Add CSS to force positioning of ads
        const style = document.createElement('style');
        style.id = 'social-ads-positioning';
        style.textContent = `
            /* Force positioning for social bar ads */
            body > div[id*="container-"] {
                position: fixed !important;
                left: 0 !important;
                right: 0 !important;
                width: 100% !important;
                margin: 0 !important;
                transform: none !important;
            }
            
            /* Position each ad with specific bottom values */
            body > div[id*="container-"]:nth-of-type(1) {
                bottom: 0px !important;
                z-index: 9997 !important;
            }
            
            body > div[id*="container-"]:nth-of-type(2) {
                bottom: 45px !important;
                z-index: 9998 !important;
            }
            
            body > div[id*="container-"]:nth-of-type(3) {
                bottom: 135px !important;
                z-index: 9999 !important;
            }
        `;
        document.head.appendChild(style);

        // Load multiple instances of the ad script
        for (let i = 0; i < numAds; i++) {
            setTimeout(() => {
                const script = document.createElement('script');
                script.src = 'https://breachuptown.com/53/e5/58/53e55836ee891aa30b1843270191bee1.js';
                script.async = true;
                script.setAttribute('data-ad-instance', i);
                document.body.appendChild(script);
            }, i * 1200); // 1.2 second delay between each ad
        }

        return () => {
            // Cleanup
            const styleEl = document.getElementById('social-ads-positioning');
            if (styleEl) {
                styleEl.remove();
            }
        };
    }, []);

    return null; // This ad renders itself
}

export default SocialBar;
