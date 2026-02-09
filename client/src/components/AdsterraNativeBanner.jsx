import { useEffect, useRef, useState } from 'react';
import './AdsterraNativeBanner.css';

function AdsterraNativeBanner({ index = 0 }) {
    const scriptLoaded = useRef(false);
    const containerRef = useRef(null);
    const adKey = 'f8c22b2c177bf4ce773ab0085a6c25e9';
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth <= 768);
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        // Only show ads on mobile
        if (!isMobile) return;

        // Only load script once per ad instance
        if (scriptLoaded.current) return;

        // Set atOptions globally before loading the script
        window.atOptions = {
            'key': adKey,
            'format': 'iframe',
            'height': 300,
            'width': 160,
            'params': {}
        };

        const script = document.createElement('script');
        script.src = `https://breachuptown.com/${adKey}/invoke.js`;
        
        // Append script to the container
        if (containerRef.current) {
            containerRef.current.appendChild(script);
            scriptLoaded.current = true;
        }

        // Cleanup function
        return () => {
            if (containerRef.current && script.parentNode) {
                try {
                    script.parentNode.removeChild(script);
                } catch (e) {
                    // Script already removed
                }
            }
            // Clean up global atOptions
            if (window.atOptions) {
                delete window.atOptions;
            }
        };
    }, [adKey, isMobile]);

    // Don't render anything on desktop
    // TODO: Enable ads on desktop when ready
    if (!isMobile) {
        return null;
    }

    return (
        <div className="adsterra-native-wrapper">
            <div className="sponsored-label">Sponsored</div>
            <div className="adsterra-native-container" ref={containerRef}>
                {/* Ad will be injected here by the script */}
            </div>
        </div>
    );
}

export default AdsterraNativeBanner;
