import { useEffect } from 'react';
import './WalkinBannerAd.css';

function WalkinBannerAd({ index }) {

    useEffect(() => {
        const containerId = `walkin-banner-ad-${index}`;
        
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
            iframe.style.display = 'block';
            
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
                            overflow: hidden;
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
        }, 300 + (index * 150));

        return () => clearTimeout(timer);
    }, [index]);

    return (
        <div className="walkin-banner-ad-wrapper">
            <div id={`walkin-banner-ad-${index}`} className="walkin-banner-ad-container"></div>
        </div>
    );
}

export default WalkinBannerAd;
