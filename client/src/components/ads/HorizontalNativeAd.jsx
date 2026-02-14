import { useEffect } from 'react';
import './HorizontalNativeAd.css';

function HorizontalNativeAd({ index }) {

    useEffect(() => {
        if (window.innerWidth <= 768) return;

        const loadAd = (containerId, delay) => {
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
                        'height' : 60,
                        'width' : 468,
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

        loadAd(`ad-${index}-1`, 300);
        loadAd(`ad-${index}-2`, 900);

    }, [index]);

    if (window.innerWidth <= 768) return null;

    return (
        <div className="horizontal-native-ad-container">

            <div className="horizontal-ad-label">Sponsored</div>

            <div className="horizontal-ads-row">
                <div id={`ad-${index}-1`} className="horizontal-ad-slot"></div>
                <div id={`ad-${index}-2`} className="horizontal-ad-slot"></div>
            </div>

        </div>
    );
}

export default HorizontalNativeAd;
