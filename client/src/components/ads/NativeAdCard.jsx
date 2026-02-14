import { useEffect, useRef } from 'react';
import './NativeAdCard.css';

function NativeAdCard({ index }) {
    const adRef = useRef(null);
    const scriptLoadedRef = useRef(false);

    useEffect(() => {
        // Only load on desktop
        if (window.innerWidth <= 768) return;

        // Prevent duplicate script loading
        if (scriptLoadedRef.current) return;
        scriptLoadedRef.current = true;

        const script = document.createElement('script');
        script.async = true;
        script.setAttribute('data-cfasync', 'false');
        script.src = 'https://breachuptown.com/f14d7f03dec7b319fea3f8af2bc57eb6/invoke.js';
        
        if (adRef.current) {
            adRef.current.appendChild(script);
        }

        return () => {
            if (adRef.current && script.parentNode === adRef.current) {
                adRef.current.removeChild(script);
            }
            scriptLoadedRef.current = false;
        };
    }, []);

    // Don't render on mobile
    if (window.innerWidth <= 768) return null;

    return (
        <div className="native-ad-card card">
            <div className="ad-label">Sponsored</div>
            <div ref={adRef}>
                <div id={`container-f14d7f03dec7b319fea3f8af2bc57eb6-${index}`}></div>
            </div>
        </div>
    );
}

export default NativeAdCard;
