import { useEffect, useRef } from 'react';
import './MobileNativeAd.css';

function MobileNativeAd({ index }) {
    const containerRef = useRef(null);
    const scriptLoadedRef = useRef(false);

    useEffect(() => {
        // Only load on mobile
        if (window.innerWidth > 768) return;

        // Prevent duplicate script loading for this specific instance
        if (scriptLoadedRef.current) return;
        scriptLoadedRef.current = true;

        const containerId = `mobile-ad-container-${index}`;
        
        const timer = setTimeout(() => {
            const container = document.getElementById(containerId);
            if (container && !container.hasChildNodes()) {
                container.innerHTML = '';
                
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
                
                const invokeScript = document.createElement('script');
                invokeScript.type = 'text/javascript';
                invokeScript.src = `https://breachuptown.com/a7d8e25874deba8b7a307fb936e0027d/invoke.js?t=${Date.now()}-${index}`;
                invokeScript.async = true;
                
                container.appendChild(optionsScript);
                container.appendChild(invokeScript);
            }
        }, 300 + (index * 200));

        return () => {
            clearTimeout(timer);
            scriptLoadedRef.current = false;
        };
    }, [index]);

    // Don't render on desktop
    if (window.innerWidth > 768) return null;

    return (
        <div className="mobile-native-ad card" ref={containerRef}>
            <div className="ad-label-mobile">Sponsored</div>
            <div id={`mobile-ad-container-${index}`} className="mobile-ad-content"></div>
        </div>
    );
}

export default MobileNativeAd;
