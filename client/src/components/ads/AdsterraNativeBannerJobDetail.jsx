import { useEffect, useRef, useState } from 'react';
import './AdsterraNativeBannerJobDetail.css';

/**
 * Adsterra Native Banner Ad Component
 * Placement: After job header, before job description
 * Aspect ratio: 3:1
 */
function AdsterraNativeBannerJobDetail() {
    const iframeRef = useRef(null);
    const adKey = 'f14d7f03dec7b319fea3f8af2bc57eb6';
    const [adLoaded, setAdLoaded] = useState(false);

    useEffect(() => {
        if (!iframeRef.current) return;

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
                        min-height: 200px;
                        background: transparent;
                        overflow: hidden;
                    }
                </style>
            </head>
            <body>
                <script async="async" data-cfasync="false" src="https://breachuptown.com/${adKey}/invoke.js"></script>
                <div id="container-${adKey}"></div>
            </body>
            </html>
        `;

        iframeDoc.open();
        iframeDoc.write(adHTML);
        iframeDoc.close();

        // Mark as loaded after a short delay
        setTimeout(() => setAdLoaded(true), 500);
    }, [adKey]);

    return (
        <div className="ad-native-banner-wrapper">
            <div className="ad-label">Sponsored</div>
            <div className={`ad-native-banner-container ${adLoaded ? 'loaded' : ''}`}>
                <iframe
                    ref={iframeRef}
                    className="ad-native-iframe"
                    title="Sponsored Content"
                    scrolling="no"
                    frameBorder="0"
                />
            </div>
        </div>
    );
}

export default AdsterraNativeBannerJobDetail;
