import { useEffect, useRef, useState } from 'react';
import './NativeBannerSection.css';

// Global counter to give each instance a unique container ID
let instanceCounter = 0;

function NativeBannerSection({ title = 'Recommended Opportunities' }) {
    const containerRef = useRef(null);
    const loadedRef = useRef(false);
    const [visible, setVisible] = useState(false);
    // Each instance gets its own unique ID so duplicate IDs never happen
    const instanceId = useRef(`native-ad-${++instanceCounter}`);

    useEffect(() => {
        if (!containerRef.current) return;

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setVisible(true);
                    observer.disconnect();
                }
            },
            { rootMargin: '300px' }
        );
        observer.observe(containerRef.current);
        return () => observer.disconnect();
    }, []);

    useEffect(() => {
        if (!visible || loadedRef.current || !containerRef.current) return;
        loadedRef.current = true;

        // The container div must exist before the script runs
        const containerId = `container-f14d7f03dec7b319fea3f8af2bc57eb6-${instanceId.current}`;
        const containerDiv = containerRef.current.querySelector(`#${containerId}`);
        if (!containerDiv) return;

        const script = document.createElement('script');
        script.async = true;
        script.setAttribute('data-cfasync', 'false');
        script.src = 'https://breachuptown.com/f14d7f03dec7b319fea3f8af2bc57eb6/invoke.js';
        containerRef.current.appendChild(script);
    }, [visible]);

    const containerId = `container-f14d7f03dec7b319fea3f8af2bc57eb6-${instanceId.current}`;

    return (
        <div className="native-banner-section">
            <div className="native-banner-header">
                <span className="native-banner-dot" />
                <span className="native-banner-title">{title}</span>
                <span className="native-banner-ad-badge">Ad</span>
            </div>
            <div className="native-banner-body" ref={containerRef}>
                <div id={containerId} />
            </div>
        </div>
    );
}

export default NativeBannerSection;
