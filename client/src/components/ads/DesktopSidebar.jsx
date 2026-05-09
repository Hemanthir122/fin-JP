import { useEffect, useRef } from 'react';
import './DesktopSidebar.css';

const SMARTLINK = 'https://breachuptown.com/jnv7mma2?key=d47de908fdd389381c8131eaa2a36085';

const trendingItems = [
    { icon: '🌍', label: 'Remote Full-Stack', tag: 'Hot' },
    { icon: '📊', label: 'Data Analyst',      tag: 'New' },
    { icon: '🎨', label: 'UI/UX Designer',    tag: 'Hot' },
    { icon: '☁️', label: 'Cloud Engineer',    tag: 'Trending' },
    { icon: '📱', label: 'Mobile Developer',  tag: 'New' },
];

const resources = [
    { icon: '📄', label: 'Resume Builder',    href: '/resume-builder', external: false },
    { icon: '✈️', label: 'Work Abroad Guide', href: SMARTLINK,         external: true },
    { icon: '💰', label: 'Salary Insights',   href: SMARTLINK,         external: true },
    { icon: '🎯', label: 'Interview Prep',    href: SMARTLINK,         external: true },
];

function DesktopSidebar() {
    const bannerIframeRef  = useRef(null);
    const bannerLoadedRef  = useRef(false);
    const nativeIframeRef  = useRef(null);
    const nativeLoadedRef  = useRef(false);

    // 160x300 banner ad
    useEffect(() => {
        if (bannerLoadedRef.current || !bannerIframeRef.current) return;
        bannerLoadedRef.current = true;

        const iframeDoc = bannerIframeRef.current.contentDocument
            || bannerIframeRef.current.contentWindow?.document;
        if (!iframeDoc) return;

        iframeDoc.open();
        iframeDoc.write(`<!DOCTYPE html><html><head>
            <style>body{margin:0;padding:0;display:flex;align-items:center;justify-content:center;min-height:300px;background:transparent;overflow:hidden;}</style>
        </head><body>
            <script type="text/javascript">
                atOptions = { 'key': 'f8c22b2c177bf4ce773ab0085a6c25e9', 'format': 'iframe', 'height': 300, 'width': 160, 'params': {} };
            <\/script>
            <script type="text/javascript" src="https://breachuptown.com/f8c22b2c177bf4ce773ab0085a6c25e9/invoke.js"><\/script>
        </body></html>`);
        iframeDoc.close();
    }, []);

    // Native banner below Work Abroad — lazy via IntersectionObserver, isolated iframe
    useEffect(() => {
        if (nativeLoadedRef.current || !nativeIframeRef.current) return;

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (!entry.isIntersecting) return;
                nativeLoadedRef.current = true;
                observer.disconnect();

                const iframeDoc = nativeIframeRef.current.contentDocument
                    || nativeIframeRef.current.contentWindow?.document;
                if (!iframeDoc) return;

                iframeDoc.open();
                iframeDoc.write(`<!DOCTYPE html><html><head>
                    <style>*{margin:0;padding:0;box-sizing:border-box;}body{background:transparent;overflow:hidden;}</style>
                </head><body>
                    <script async="async" data-cfasync="false"
                        src="https://breachuptown.com/f14d7f03dec7b319fea3f8af2bc57eb6/invoke.js">
                    <\/script>
                    <div id="container-f14d7f03dec7b319fea3f8af2bc57eb6"></div>
                </body></html>`);
                iframeDoc.close();
            },
            { rootMargin: '200px' }
        );
        observer.observe(nativeIframeRef.current);
        return () => observer.disconnect();
    }, []);

    const openSmartlink = (e) => {
        e.preventDefault();
        window.open(SMARTLINK, '_blank', 'noopener,noreferrer');
    };

    return (
        <aside className="desktop-sidebar">

            {/* ── Banner Ad 160x300 ── */}
            <div className="sidebar-widget sidebar-ad-widget">
                <span className="sidebar-ad-label">Ad</span>
                <iframe
                    ref={bannerIframeRef}
                    className="sidebar-banner-iframe"
                    title="Advertisement"
                    scrolling="no"
                    frameBorder="0"
                    width="160"
                    height="300"
                />
            </div>

            {/* ── Trending Searches ── */}
            <div className="sidebar-widget">
                <h4 className="sidebar-widget-title">🔥 Trending Searches</h4>
                <ul className="sidebar-trending-list">
                    {trendingItems.map((item, i) => (
                        <li key={i}>
                            <a href={SMARTLINK} className="sidebar-trending-item"
                                target="_blank" rel="noopener noreferrer nofollow"
                                onClick={openSmartlink}>
                                <span className="sidebar-trending-icon">{item.icon}</span>
                                <span className="sidebar-trending-label">{item.label}</span>
                                <span className={`sidebar-trending-tag tag-${item.tag.toLowerCase()}`}>{item.tag}</span>
                            </a>
                        </li>
                    ))}
                </ul>
            </div>

            {/* ── Career Resources ── */}
            <div className="sidebar-widget">
                <h4 className="sidebar-widget-title">📚 Career Resources</h4>
                <ul className="sidebar-resources-list">
                    {resources.map((r, i) => (
                        <li key={i}>
                            <a
                                href={r.href}
                                className="sidebar-resource-item"
                                target={r.external ? '_blank' : '_self'}
                                rel={r.external ? 'noopener noreferrer nofollow' : undefined}
                                onClick={r.external ? openSmartlink : undefined}
                            >
                                <span>{r.icon}</span>
                                <span>{r.label}</span>
                                {r.external && <span className="sidebar-ext-arrow">↗</span>}
                            </a>
                        </li>
                    ))}
                </ul>
            </div>

            {/* ── Work Abroad CTA ── */}
            <div className="sidebar-widget sidebar-cta-widget">
                <div className="sidebar-cta-icon">✈️</div>
                <h4 className="sidebar-cta-title">Work Abroad</h4>
                <p className="sidebar-cta-desc">Visa-sponsored roles at global companies.</p>
                <a href={SMARTLINK} className="sidebar-cta-btn"
                    target="_blank" rel="noopener noreferrer nofollow"
                    onClick={openSmartlink}>
                    Explore Now →
                </a>
            </div>

            {/* ── Native Banner below Work Abroad ── */}
            <div className="sidebar-widget sidebar-native-widget">
                <div className="sidebar-native-label">
                    <span className="sidebar-native-dot" />
                    Sponsored
                </div>
                <iframe
                    ref={nativeIframeRef}
                    className="sidebar-native-iframe"
                    title="Sponsored Content"
                    scrolling="no"
                    frameBorder="0"
                />
            </div>

        </aside>
    );
}

export default DesktopSidebar;
