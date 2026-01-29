import { useEffect, useRef } from 'react';
import './NativeAd.css';

function NativeAd() {
    const containerRef = useRef(null);

    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        // Create an iframe to isolate the ad script execution
        // This is necessary because the ad script uses document.write() and global variables (atOptions)
        const iframe = document.createElement('iframe');
        iframe.style.border = 'none';
        iframe.style.width = '100%';
        iframe.style.height = '75px'; // Slightly larger than 60px to avoid scrollbars
        iframe.style.overflow = 'hidden';
        iframe.scrolling = 'no';

        container.innerHTML = ''; // Clear previous content
        container.appendChild(iframe);

        const doc = iframe.contentWindow.document;

        // Ad Content
        const adContent = `
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body { margin: 0; display: flex; justify-content: center; align-items: center; background: transparent; }
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
                <script type="text/javascript" src="https://www.highperformanceformat.com/a7d8e25874deba8b7a307fb936e0027d/invoke.js"></script>
            </body>
            </html>
        `;

        doc.open();
        doc.write(adContent);
        doc.close();

    }, []);

    return (
        <div className="native-ad-container">
            <div className="ad-label">Advertisement</div>
            <div className="ad-content-wrapper" ref={containerRef} style={{ minHeight: '60px', width: '100%' }}>
                {/* Iframe will be injected here */}
            </div>
        </div>
    );
}

export default NativeAd;
