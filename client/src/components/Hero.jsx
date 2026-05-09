import { Link } from 'react-router-dom';
import { Globe, ShieldCheck, Zap, Tag, ChevronRight } from 'lucide-react';
import './Hero.css';

// Only 8 countries — large circular pins like the reference
const COUNTRIES = [
    { name: 'Canada',      iso2: 'ca', x: '28%', y: '18%' },
    { name: 'USA',         iso2: 'us', x: '24%', y: '40%' },
    { name: 'Brazil',      iso2: 'br', x: '32%', y: '68%' },
    { name: 'Norway',      iso2: 'no', x: '58%', y: '10%' },
    { name: 'Netherlands', iso2: 'nl', x: '56%', y: '26%' },
    { name: 'France',      iso2: 'fr', x: '50%', y: '36%' },
    { name: 'Saudi Arabia',iso2: 'sa', x: '62%', y: '44%' },
    { name: 'India',       iso2: 'in', x: '70%', y: '48%' },
    { name: 'S. Korea',    iso2: 'kr', x: '80%', y: '22%' },
    { name: 'Singapore',   iso2: 'sg', x: '78%', y: '58%' },
];

const CONNECTIONS = [
    ['Canada',  'Norway'],
    ['Canada',  'USA'],
    ['Norway',  'Netherlands'],
    ['Netherlands','France'],
    ['France',  'Saudi Arabia'],
    ['Saudi Arabia','India'],
    ['India',   'Singapore'],
    ['India',   'S. Korea'],
    ['USA',     'Brazil'],
];

function getXY(name, w, h) {
    const c = COUNTRIES.find(c => c.name === name);
    if (!c) return null;
    return {
        x: parseFloat(c.x) / 100 * w,
        y: parseFloat(c.y) / 100 * h,
    };
}

const AVATARS = [
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face',
    'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=40&h=40&fit=crop&crop=face',
    'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=40&h=40&fit=crop&crop=face',
    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=40&h=40&fit=crop&crop=face',
];

function Hero() {
    const badges = [
        { icon: Globe,       label: 'Global Opportunities' },
        { icon: ShieldCheck, label: 'Verified Companies' },
        { icon: Zap,         label: 'Easy Apply' },
        { icon: Tag,         label: '100% Free' },
    ];

    const W = 500, H = 340;

    return (
        <section className="hero">
            <div className="hero-container container">

                {/* ── Left ── */}
                <div className="hero-content">
                    <h1 className="hero-title animate-fadeIn">
                        All Job Opportunities.<br />
                        <span className="hero-title-accent">Worldwide.</span>
                    </h1>

                    <p className="hero-subtitle animate-fadeIn stagger-1">
                        Discover thousands of jobs, internships, and remote
                        opportunities from top companies around the world.
                    </p>

                    <div className="hero-badges animate-fadeIn stagger-2">
                        {badges.map((b, i) => (
                            <span key={i} className="hero-badge-item">
                                <b.icon size={13} />
                                {b.label}
                            </span>
                        ))}
                    </div>

                    <div className="hero-buttons animate-fadeIn stagger-3">
                        <Link to="/jobs" className="btn btn-primary btn-lg">
                            Browse Jobs <ChevronRight size={16}/>
                        </Link>
                        <Link to="/internships" className="btn btn-secondary btn-lg">
                            Internships <ChevronRight size={16}/>
                        </Link>
                    </div>

                    {/* Join row */}
                    <div className="hero-join animate-fadeIn stagger-4">
                        <div className="hero-avatars">
                            {AVATARS.map((src, i) => (
                                <img key={i} src={src} alt="user"
                                    className="hero-avatar"
                                    style={{ zIndex: AVATARS.length - i }}
                                    onError={e => e.target.style.display='none'}
                                />
                            ))}
                            <div className="hero-avatar hero-avatar-plus">+</div>
                        </div>
                        <div className="hero-join-text">
                            Join <strong>1M+</strong> job seekers<br/>
                            <span>and find your dream job</span>
                        </div>
                    </div>
                </div>

                {/* ── Right: World Map ── */}
                <div className="hero-visual animate-fadeIn stagger-2">
                    <div className="hero-worldmap-wrap">

                        {/* SVG: dots + connection lines */}
                        <svg className="hero-map-svg"
                            viewBox={`0 0 ${W} ${H}`}
                            xmlns="http://www.w3.org/2000/svg"
                            preserveAspectRatio="xMidYMid meet">

                            {/* Dot grid */}
                            {Array.from({length: 28}, (_, row) =>
                                Array.from({length: 50}, (_, col) => {
                                    const x = col * 10 + 5;
                                    const y = row * 12 + 6;
                                    const inLand = (
                                        (x>20&&x<130&&y>30&&y<170) ||
                                        (x>90&&x<160&&y>170&&y<290) ||
                                        (x>190&&x<290&&y>15&&y<150) ||
                                        (x>190&&x<310&&y>140&&y<280) ||
                                        (x>270&&x<470&&y>15&&y<210) ||
                                        (x>370&&x<470&&y>200&&y<290)
                                    );
                                    return inLand ? (
                                        <circle key={`${row}-${col}`}
                                            cx={x} cy={y} r="1.6"
                                            fill="#93c5fd" opacity="0.4"/>
                                    ) : null;
                                })
                            )}

                            {/* Connection lines */}
                            {CONNECTIONS.map(([from, to], i) => {
                                const a = getXY(from, W, H);
                                const b = getXY(to, W, H);
                                if (!a || !b) return null;
                                return (
                                    <line key={i}
                                        x1={a.x} y1={a.y} x2={b.x} y2={b.y}
                                        stroke="#f97316" strokeWidth="1.2"
                                        strokeDasharray="5,4" opacity="0.5"/>
                                );
                            })}
                        </svg>

                        {/* Country pins — large circles */}
                        {COUNTRIES.map((c, i) => (
                            <div key={i} className="hero-pin"
                                style={{ left: c.x, top: c.y, animationDelay: `${i * 0.1}s` }}>
                                <div className="hero-pin-circle">
                                    <img
                                        src={`https://flagcdn.com/w40/${c.iso2}.png`}
                                        alt={c.name}
                                        className="hero-pin-flag"
                                        loading="lazy"
                                    />
                                </div>
                                <span className="hero-pin-name">{c.name}</span>
                            </div>
                        ))}

                        {/* 50+ Countries pill */}
                        <div className="hero-countries-badge">
                            <Globe size={15} />
                            <span><strong>50+</strong> Countries</span>
                            <ChevronRight size={14}/>
                        </div>

                        {/* 50K+ card */}
                        <div className="hero-stats-card">
                            <div className="hsc-icon">
                                <svg viewBox="0 0 24 24" width="22" height="22" fill="none"
                                    stroke="#f97316" strokeWidth="2">
                                    <rect x="2" y="7" width="20" height="14" rx="2"/>
                                    <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/>
                                </svg>
                            </div>
                            <div>
                                <div className="hsc-value">50K+</div>
                                <div className="hsc-label">Active Jobs</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Stats bar ── */}
            <div className="hero-stats-bar">
                <div className="container">
                    <div className="hero-stats">
                        <div className="hero-stat">
                            <div className="hero-stat-icon" style={{background:'#ede9fe'}}>
                                <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="#7c3aed" strokeWidth="2">
                                    <rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/>
                                </svg>
                            </div>
                            <div>
                                <div className="hero-stat-value">50K+</div>
                                <div className="hero-stat-title">Active Jobs</div>
                                <div className="hero-stat-desc">New opportunities added daily</div>
                            </div>
                        </div>
                        <div className="hero-stat-divider"/>
                        <div className="hero-stat">
                            <div className="hero-stat-icon" style={{background:'#fff7ed'}}>
                                <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="#f97316" strokeWidth="2">
                                    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
                                </svg>
                            </div>
                            <div>
                                <div className="hero-stat-value">10K+</div>
                                <div className="hero-stat-title">Companies</div>
                                <div className="hero-stat-desc">Top global companies hiring now</div>
                            </div>
                        </div>
                        <div className="hero-stat-divider"/>
                        <div className="hero-stat">
                            <div className="hero-stat-icon" style={{background:'#eff6ff'}}>
                                <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="#2563eb" strokeWidth="2">
                                    <circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/>
                                    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
                                </svg>
                            </div>
                            <div>
                                <div className="hero-stat-value">50+</div>
                                <div className="hero-stat-title">Countries</div>
                                <div className="hero-stat-desc">Global reach, local opportunities</div>
                            </div>
                        </div>
                        <div className="hero-stat-divider"/>
                        <div className="hero-stat">
                            <div className="hero-stat-icon" style={{background:'#f0fdf4'}}>
                                <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="#16a34a" strokeWidth="2">
                                    <circle cx="12" cy="8" r="6"/><path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11"/>
                                </svg>
                            </div>
                            <div>
                                <div className="hero-stat-value">100%</div>
                                <div className="hero-stat-title">Free to Use</div>
                                <div className="hero-stat-desc">No hidden fees, ever</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}

export default Hero;
