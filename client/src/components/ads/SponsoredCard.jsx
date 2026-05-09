import { useEffect, useRef, useState } from 'react';
import './SponsoredCard.css';

function SponsoredCard() {
    const wrapperRef = useRef(null);
    const iframeRef = useRef(null);
    const loadedRef = useRef(false);
    const [visible, setVisible] = useState(false);

    // Lazy load — only fire when scrolled into view
    useEffect(() => {
        if (!wrapperRef.current) return;
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setVisible(true);
                    observer.disconnect();
                }
            },
            { rootMargin: '300px' }
        );
        observer.observe(wrapperRef.current);
        return () => observer.disconnect();
    }, []);

    // Write ad into isolated iframe — each instance has its own DOM
    // so Adsterra's script always finds exactly one container
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
                body { background: transparent; overflow: hidden; }
            </style>
        </head><body>
            <script async="async" data-cfasync="false"
                src="https://breachuptown.com/f14d7f03dec7b319fea3f8af2bc57eb6/invoke.js">
            <\/script>
            <div id="container-f14d7f03dec7b319fea3f8af2bc57eb6"></div>
        </body></html>`);
        iframeDoc.close();
    }, [visible]);

    return (
        <div className="sponsored-native-card" ref={wrapperRef}>
            <div className="sponsored-native-label">
                <span className="sponsored-dot" />
                Sponsored
            </div>
            <div className="sponsored-native-body">
                <iframe
                    ref={iframeRef}
                    className="sponsored-native-iframe"
                    title="Sponsored"
                    scrolling="no"
                    frameBorder="0"
                />
            </div>
        </div>
    );
}

export default SponsoredCard;
