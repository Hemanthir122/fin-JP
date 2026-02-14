import { useEffect, useRef } from 'react';
import './StickyBanner.css';

function StickyBanner() {
    const bannerRef = useRef(null);
    const scriptLoadedRef = useRef(false);

    useEffect(() => {
        // Only load on desktop
        if (window.innerWidth <= 768) return;

        // Prevent duplicate script loading
        if (scriptLoadedRef.current) return;
        scriptLoadedRef.current = true;

        // Load 160x300 Banner Ad
        if (bannerRef.current) {
            const atOptions = {
                'key': 'f8c22b2c177bf4ce773ab0085a6c25e9',
                'format': 'iframe',
                'height': 300,
                'width': 160,
                'params': {}
            };
            
            const optionsScript = document.createElement('script');
            optionsScript.type = 'text/javascript';
            optionsScript.innerHTML = `atOptions = ${JSON.stringify(atOptions)};`;
            bannerRef.current.appendChild(optionsScript);

            const invokeScript = document.createElement('script');
            invokeScript.type = 'text/javascript';
            invokeScript.src = 'https://breachuptown.com/f8c22b2c177bf4ce773ab0085a6c25e9/invoke.js';
            bannerRef.current.appendChild(invokeScript);
        }

        return () => {
            scriptLoadedRef.current = false;
        };
    }, []);

    // Don't render on mobile
    if (window.innerWidth <= 768) return null;

    return (
        <div className="sticky-banner-container">
            {/* Banner Ad 1 (160x300) */}
            <div className="sticky-banner-wrapper">
                <div className="ad-label-banner">Ad</div>
                <div ref={bannerRef} className="ad-slot-banner"></div>
            </div>

            {/* Placeholder Ad 2 - Replace with new ad key when available */}
            <div className="sticky-banner-wrapper">
                <div className="ad-label-banner">Ad</div>
                <div className="ad-slot-banner ad-placeholder">
                    <div className="placeholder-content">
                        <p>Ad Space</p>
                        <small>160x300</small>
                    </div>
                </div>
            </div>

            {/* Placeholder Ad 3 - Replace with new ad key when available */}
            <div className="sticky-banner-wrapper">
                <div className="ad-label-banner">Ad</div>
                <div className="ad-slot-banner ad-placeholder">
                    <div className="placeholder-content">
                        <p>Ad Space</p>
                        <small>160x300</small>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default StickyBanner;
