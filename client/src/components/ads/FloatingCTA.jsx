import { useState, useEffect } from 'react';
import './FloatingCTA.css';

const SMARTLINK = 'https://breachuptown.com/jnv7mma2?key=d47de908fdd389381c8131eaa2a36085';

const labels = ['⚡ Quick Apply', '🔥 Trending Jobs', '🚀 Instant Hiring'];

function FloatingCTA() {
    const [visible, setVisible] = useState(false);
    const [labelIdx, setLabelIdx] = useState(0);

    // Show after 3s scroll
    useEffect(() => {
        const timer = setTimeout(() => setVisible(true), 3000);
        return () => clearTimeout(timer);
    }, []);

    // Rotate label every 4s
    useEffect(() => {
        const interval = setInterval(() => {
            setLabelIdx(i => (i + 1) % labels.length);
        }, 4000);
        return () => clearInterval(interval);
    }, []);

    const handleClick = (e) => {
        e.preventDefault();
        window.open(SMARTLINK, '_blank', 'noopener,noreferrer');
    };

    return (
        <a
            href={SMARTLINK}
            className={`floating-cta ${visible ? 'floating-cta-visible' : ''}`}
            onClick={handleClick}
            rel="noopener noreferrer nofollow"
            target="_blank"
            aria-label="Quick Apply"
        >
            <span className="floating-cta-label">{labels[labelIdx]}</span>
        </a>
    );
}

export default FloatingCTA;
