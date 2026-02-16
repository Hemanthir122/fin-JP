import { useEffect } from 'react';
import './MobileNativeAd.css';

function MobileNativeAd({ index }) {

    useEffect(() => {
        // Only load on mobile
        if (window.innerWidth > 768) return;

        const containerId = `mobile-ad-${index}`;
        
        const timer = setTimeout(() => {
            const container = document.getElementById(containerId);
            if (!container) return;

            container.innerHTML = "";

            // Create iframe to isolate ad script
            const iframe = document.createElement('iframe');
            iframe.style.width = '100%';
            iframe.style.height = '100%';
            iframe.style.minHeight = '250px';
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
                        body { margin: 0; padding: 0; display: flex; justify-content: center; align-items: center; min-height: 250px; }
                    </style>
                </head>
                <body>
                    <script async="async" data-cfasync="false" src="//breachuptown.com/f14d7f03dec7b319fea3f8af2bc57eb6/invoke.js"></script>
                    <div id="container-f14d7f03dec7b319fea3f8af2bc57eb6"></div>
                </body>
                </html>
            `);
            iframeDoc.close();
        }, 500 + (index * 200));

        return () => clearTimeout(timer);
    }, [index]);

    // Don't render on desktop
    if (window.innerWidth > 768) return null;

    return (
        <div className="mobile-ad-card-wrapper">
            <div id={`mobile-ad-${index}`} className="mobile-ad-slot"></div>
        </div>
    );
}

export default MobileNativeAd;
