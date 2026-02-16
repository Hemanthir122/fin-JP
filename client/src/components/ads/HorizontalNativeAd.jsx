import { useEffect } from 'react';
import './HorizontalNativeAd.css';

function HorizontalNativeAd({ index }) {
    const isMobile = window.innerWidth <= 768;

    useEffect(() => {
        // Only load ads on desktop
        if (!isMobile) {
            // Load 3 ads with different delays
            for (let i = 1; i <= 3; i++) {
                const containerId = `ad-${index}-${i}`;
                
                setTimeout(() => {
                    const container = document.getElementById(containerId);
                    if (!container) return;

                    container.innerHTML = "";

                    // Create iframe to isolate ad script
                    const iframe = document.createElement('iframe');
                    iframe.style.width = '100%';
                    iframe.style.height = '100%';
                    iframe.style.minHeight = '300px';
                    iframe.style.border = 'none';
                    iframe.style.overflow = 'hidden';
                    
                    container.appendChild(iframe);
                    
                    // Write ad code into iframe
                    const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
                    iframeDoc.open();
                    iframeDoc.write(`
                        <!DOCTYPE html>
                        <html>
                        <head>
                            <style>
                                body { margin: 0; padding: 0; display: flex; justify-content: center; align-items: center; min-height: 300px; }
                            </style>
                        </head>
                        <body>
                            <script async="async" data-cfasync="false" src="//breachuptown.com/f14d7f03dec7b319fea3f8af2bc57eb6/invoke.js"></script>
                            <div id="container-f14d7f03dec7b319fea3f8af2bc57eb6"></div>
                        </body>
                        </html>
                    `);
                    iframeDoc.close();
                }, 500 + (i * 200));
            }
        }
    }, [index, isMobile]);

    // Don't show anything on mobile
    if (isMobile) {
        return null;
    }

    // Return 3 separate ad cards that look like job cards
    return (
        <>
            <div className="ad-card-wrapper">
                <div id={`ad-${index}-1`} className="ad-slot-inline"></div>
            </div>
            <div className="ad-card-wrapper">
                <div id={`ad-${index}-2`} className="ad-slot-inline"></div>
            </div>
            <div className="ad-card-wrapper">
                <div id={`ad-${index}-3`} className="ad-slot-inline"></div>
            </div>
        </>
    );
}

export default HorizontalNativeAd;
