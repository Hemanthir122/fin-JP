import { useEffect } from 'react';
import './HorizontalNativeAd.css';

function HorizontalNativeAd({ index }) {

    useEffect(() => {

        const isMobile = window.innerWidth <= 768;

        const loadAd = (containerId, delay, width, height) => {
            setTimeout(() => {

                const container = document.getElementById(containerId);
                if (!container) return;

                container.innerHTML = "";

                const optionsScript = document.createElement('script');
                optionsScript.type = 'text/javascript';
                optionsScript.innerHTML = `
                    var atOptions = {
                        'key' : 'a7d8e25874deba8b7a307fb936e0027d',
                        'format' : 'iframe',
                        'height' : ${height},
                        'width' : ${width},
                        'params' : {}
                    };
                `;

                const invokeScript = document.createElement('script');
                invokeScript.type = 'text/javascript';
                invokeScript.src = 'https://breachuptown.com/a7d8e25874deba8b7a307fb936e0027d/invoke.js';
                invokeScript.async = true;

                container.appendChild(optionsScript);
                container.appendChild(invokeScript);

            }, delay);
        };

        if (isMobile) {
            // 🔹 Only ONE ad for mobile
            loadAd(`ad-${index}-mobile`, 300, 320, 50);
        } else {
            // 🔹 TWO ads for desktop
            loadAd(`ad-${index}-1`, 300, 468, 60);
            loadAd(`ad-${index}-2`, 900, 468, 60);
        }

    }, [index]);

    const isMobile = window.innerWidth <= 768;

    return (
        <div className={`horizontal-native-ad-container ${isMobile ? 'mobile-ad' : ''}`}>

            {!isMobile && (
                <div className="horizontal-ad-label">Sponsored</div>
            )}

            {isMobile ? (
                <div className="horizontal-ads-row">
                    <div id={`ad-${index}-mobile`} className="horizontal-ad-slot"></div>
                </div>
            ) : (
                <div className="horizontal-ads-row">
                    <div id={`ad-${index}-1`} className="horizontal-ad-slot"></div>
                    <div id={`ad-${index}-2`} className="horizontal-ad-slot"></div>
                </div>
            )}

        </div>
    );
}

export default HorizontalNativeAd;
