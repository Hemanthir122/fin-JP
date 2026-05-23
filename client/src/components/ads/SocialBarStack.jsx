import { useEffect, useRef } from 'react';
import './SocialBarStack.css';

const SOCIAL_BAR_SRC = 'https://breachuptown.com/53/e5/58/53e55836ee891aa30b1843270191bee1.js';

function SocialBarFrame({ index }) {
    const iframeRef = useRef(null);

    useEffect(() => {
        if (!iframeRef.current) return;
        const doc = iframeRef.current.contentDocument
            || iframeRef.current.contentWindow?.document;
        if (!doc) return;

        const script = doc.createElement('script');
        script.src = SOCIAL_BAR_SRC;
        script.async = true;
        
        doc.head.innerHTML = `
            <style>
                * { margin: 0; padding: 0; box-sizing: border-box; }
                body { background: transparent; overflow: hidden; display: flex; justify-content: center; align-items: center; height: 100vh; }
            </style>
        `;
        doc.body.appendChild(script);
    }, []);

    return (
        <iframe
            ref={iframeRef}
            className="social-bar-frame"
            title={`Social Bar ${index}`}
            scrolling="no"
            frameBorder="0"
        />
    );
}

function SocialBarStack() {
    return (
        <div className="social-bar-stack">
            <SocialBarFrame index={1} />
            <SocialBarFrame index={2} />
            <SocialBarFrame index={3} />
        </div>
    );
}

export default SocialBarStack;
