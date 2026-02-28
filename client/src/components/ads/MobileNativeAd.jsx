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
            iframe.style.height = '80px';
            iframe.style.minHeight = '60px';
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
                        body { 
                            margin: 0; 
                            padding: 0; 
                            display: flex; 
                            justify-content: center; 
                            align-items: center; 
                            min-height: 60px;
                        }
                    </style>
                </head>
                <body>
                    <script type="text/javascript">
                        atOptions = {
                            'key' : 'a7d8e25874deba8b7a307fb936e0027d',
                            'format' : 'iframe',
                            'height' : 60,
                            'width' : 468,
                            'params' : {}
                        };
                    </script>
                    <script type="text/javascript" src="https://breachuptown.com/a7d8e25874deba8b7a307fb936e0027d/invoke.js"></script>
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
