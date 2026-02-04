import { useEffect, useRef } from 'react';
import './GoogleAdSense.css';

function GoogleAdSense() {
    const adRef = useRef(null);

    useEffect(() => {
        if (typeof window !== 'undefined' && window.adsbygoogle) {
            try {
                (adsbygoogle = window.adsbygoogle || []).push({});
            } catch (error) {
                console.error('AdSense error:', error);
            }
        }
    }, []);

    return (
        <div className="google-adsense-container" ref={adRef}>
            <ins
                className="adsbygoogle"
                style={{ display: 'block', textAlign: 'center' }}
                data-ad-layout="in-article"
                data-ad-format="fluid"
                data-ad-client="ca-pub-6996549358996440"
                data-ad-slot="2864599655"
            ></ins>
        </div>
    );
}

export default GoogleAdSense;
