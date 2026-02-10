import { useEffect, useRef, useState } from 'react';
import './AdsterraBannerMobile.css';

/**
 * Adsterra Banner Ad Component (Mobile Only)
 * Placement: After Required Skills section
 * Size: 468x60
 * Visibility: Mobile only (hidden on tablet/desktop)
 */
function AdsterraBannerMobile() {
    const iframeRef = useRef(null);
    const adKey = 'a7d8e25874deba8b7a307fb936e0027d';
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth <= 768);
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        // Only load on mobile
        if (!isMobile || !iframeRef.current) return;

        // Create iframe content with the ad code
        const iframeDoc = iframeRef.current.contentDocument || iframeRef.current.contentWindow.document;
        
        const adHTML = `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <style>
                    body {
                        margin: 0;
                        padding: 0;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        min-height: 60px;
                        background: transparent;
                        overflow: hidden;
                    }
                </style>
            </head>
            <body>
                <script>
                    atOptions = {
                        'key' : '${adKey}',
                        'format' : 'iframe',
                        'height' : 60,
                        'width' : 468,
                        'params' : {}
                    };
                </script>
                <script src="https://breachuptown.com/${adKey}/invoke.js"></script>
            </body>
            </html>
        `;

        iframeDoc.open();
        iframeDoc.write(adHTML);
        iframeDoc.close();
    }, [adKey, isMobile]);

    // Don't render on desktop/tablet
    if (!isMobile) {
        return null;
    }

    return (
        <div className="ad-banner-mobile-wrapper">
            <div className="ad-label-banner">Sponsored</div>
            <div className="ad-banner-mobile-container">
                <iframe
                    ref={iframeRef}
                    className="ad-banner-iframe"
                    title="Sponsored Banner"
                    scrolling="no"
                    frameBorder="0"
                />
            </div>
        </div>
    );
}

export default AdsterraBannerMobile;
