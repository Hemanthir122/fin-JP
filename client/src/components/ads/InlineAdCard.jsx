import { useEffect, useRef } from 'react';
import './InlineAdCard.css';

function InlineAdCard({ position }) {
    const adRef = useRef(null);
    const scriptLoadedRef = useRef(false);

    useEffect(() => {
        // Only load on desktop
        if (window.innerWidth <= 768) return;

        // Prevent duplicate script loading for this specific instance
        if (scriptLoadedRef.current) return;
        scriptLoadedRef.current = true;

        // Create atOptions script
        const atOptions = {
            'key': 'a7d8e25874deba8b7a307fb936e0027d',
            'format': 'iframe',
            'height': 60,
            'width': 468,
            'params': {}
        };

        const optionsScript = document.createElement('script');
        optionsScript.type = 'text/javascript';
        optionsScript.innerHTML = `atOptions = ${JSON.stringify(atOptions)};`;
        
        // Create invoke script
        const invokeScript = document.createElement('script');
        invokeScript.type = 'text/javascript';
        invokeScript.src = 'https://breachuptown.com/a7d8e25874deba8b7a307fb936e0027d/invoke.js';
        
        if (adRef.current) {
            adRef.current.appendChild(optionsScript);
            adRef.current.appendChild(invokeScript);
        }

        return () => {
            if (adRef.current) {
                if (optionsScript.parentNode === adRef.current) {
                    adRef.current.removeChild(optionsScript);
                }
                if (invokeScript.parentNode === adRef.current) {
                    adRef.current.removeChild(invokeScript);
                }
            }
            scriptLoadedRef.current = false;
        };
    }, []);

    // Don't render on mobile
    if (window.innerWidth <= 768) return null;

    return (
        <div className="inline-ad-card card">
            <div className="inline-ad-label">Ad</div>
            <div ref={adRef} className="inline-ad-content"></div>
        </div>
    );
}

export default InlineAdCard;
