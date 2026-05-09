import { useEffect, useRef, useState } from 'react';
import './MobileBannerAd.css';

function MobileBannerAd() {
    const wrapperRef = useRef(null);
    const iframeRef = useRef(null);
    const loadedRef = useRef(false);
    const [visible, setVisible] = useState(false);

    // Only render on mobile
    const [isMobile] = useState(() => window.innerWidth <= 640);
    if (!isMobile) return null;

    // Lazy load when scrolled into view
    useEffect(() => {
        if (!wrapperRef.current) return;
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setVisible(true);
                    observer.disconnect();
                }
            },
            { rootMargin: '150px' }
        );
        observer.observe(wrapperRef.current);
        return () => observer.disconnect();
    }, []);

    // Write banner into isolated iframe
    useEffect(() => {
        if (!visible || loadedRef.current || !iframeRef.current) return;
        loadedRef.current = true;

        const iframeDoc = iframeRef.current.contentDocument
            || iframeRef.current.contentWindow?.document;
        if (!iframeDoc) return;

        iframeDoc.open();
        iframeDoc.write(`<!DOCTYPE html><html><head>
            <style>
                * { margin: 0; padding: 0; box-sizing: border-box; }
                body {
                    background: transparent;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    overflow: hidden;
                    min-height: 60px;
                }
            </style>
        </head><body>
            <script type="text/javascript">
                atOptions = {
                    'key': 'f8c22b2c177bf4ce773ab0085a6c25e9',
                    'format': 'iframe',
                    'height': 60,
                    'width': 320,
                    'params': {}
                };
            <\/script>
            <script type="text/javascript"
                src="https://breachuptown.com/f8c22b2c177bf4ce773ab0085a6c25e9/invoke.js">
            <\/script>
        </body></html>`);
        iframeDoc.close();
    }, [visible]);

    return (
        <div className="mobile-banner-ad" ref={wrapperRef}>
            <span className="mobile-banner-label">Ad</span>
            <iframe
                ref={iframeRef}
                className="mobile-banner-iframe"
                title="Advertisement"
                scrolling="no"
                frameBorder="0"
                width="320"
                height="60"
            />
        </div>
    );
}

export default MobileBannerAd;
