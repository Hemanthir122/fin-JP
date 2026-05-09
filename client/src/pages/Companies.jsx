import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Search, Building2, ShieldCheck, Briefcase, Globe } from 'lucide-react';
import { useCompanies } from '../hooks/useJobs';
import SponsoredCard from '../components/ads/SponsoredCard';
import './Companies.css';

const ALPHABET = ['All','A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','P','Q','R','S','T','U','V','W','X','Y','Z'];

// Floating logo bubbles — inline SVG brand colors, always render
const HERO_BUBBLES = [
    { label: 'G', color: '#4285F4', bg: '#e8f0fe', size: 72, top: '10%', right: '28%' },
    { label: '⊞', color: '#00a4ef', bg: '#e0f4ff', size: 60, top: '8%',  right: '14%' },
    { label: 'in', color: '#0a66c2', bg: '#dbeafe', size: 52, top: '5%',  right: '4%'  },
    { label: '♫',  color: '#1db954', bg: '#dcfce7', size: 56, top: '52%', right: '30%' },
    { label: 'A',  color: '#ff0000', bg: '#fee2e2', size: 56, top: '50%', right: '16%' },
    { label: 'a',  color: '#ff9900', bg: '#fff7ed', size: 64, top: '28%', right: '5%'  },
    { label: '🍎', color: '#1c1c1e', bg: '#f1f5f9', size: 44, top: '72%', right: '22%' },
];

function Companies() {
    const [search, setSearch]     = useState('');
    const [activeLetter, setActiveLetter] = useState('All');
    const { data: companies = [], isLoading } = useCompanies();

    const filtered = useMemo(() => {
        let list = [...companies];
        if (search.trim()) {
            const s = search.toLowerCase();
            list = list.filter(c => c.name.toLowerCase().includes(s));
        }
        if (activeLetter !== 'All') {
            list = list.filter(c => c.name[0].toUpperCase() === activeLetter);
        }
        return list;
    }, [companies, search, activeLetter]);

    // Group by first letter
    const grouped = useMemo(() => {
        const map = {};
        filtered.forEach(c => {
            const letter = c.name[0].toUpperCase();
            if (!map[letter]) map[letter] = [];
            map[letter].push(c);
        });
        return Object.entries(map).sort(([a], [b]) => a.localeCompare(b));
    }, [filtered]);

    return (
        <div className="companies-page">
            <Helmet>
                <title>Browse Companies | JobConnects</title>
                <meta name="description" content="Browse all companies hiring on JobConnects." />
            </Helmet>

            {/* ── Hero Header ── */}
            <div className="companies-hero">
                <div className="container companies-hero-inner">
                    <div className="companies-hero-left">
                        <h1 className="companies-hero-title">
                            Browse <span className="companies-hero-accent">Companies</span>
                        </h1>
                        <p className="companies-hero-sub">
                            Explore {companies.length}+ companies actively hiring on JobConnects
                        </p>

                        {/* Search */}
                        <div className="companies-search">
                            <Search size={17} className="cs-icon" />
                            <input
                                type="text"
                                placeholder="Search companies, keywords, or industries..."
                                value={search}
                                onChange={e => { setSearch(e.target.value); setActiveLetter('All'); }}
                                className="cs-input"
                            />
                        </div>

                        {/* Trust badges */}
                        <div className="companies-trust">
                            <span className="ct-badge"><ShieldCheck size={13}/> Verified Companies</span>
                            <span className="ct-badge"><Briefcase size={13}/> Active Job Openings</span>
                            <span className="ct-badge"><Globe size={13}/> Global Opportunities</span>
                        </div>
                    </div>

                    {/* Solar system visual */}
                    <div className="solar-system">
                        {/* Sun — center */}
                        <div className="solar-sun">
                            <img src="/logo.png" alt="JobConnects"
                                onError={e => { e.target.style.display='none'; e.target.nextSibling.style.display='flex'; }}
                            />
                            <span className="solar-sun-fb">JC</span>
                        </div>

                        {/* Orbit 1 — 3 planets, fast */}
                        <div className="solar-orbit solar-orbit-1">
                            {companies.filter(c => c.logo).slice(0, 3).map((c, i) => (
                                <div key={i} className={`solar-planet solar-p1-${i+1}`}>
                                    <img src={c.logo} alt={c.name} title={c.name}
                                        onError={e => { e.target.style.display='none'; e.target.nextSibling.style.display='flex'; }}
                                    />
                                    <span className="solar-planet-fb">{c.name.charAt(0)}</span>
                                </div>
                            ))}
                        </div>

                        {/* Orbit 2 — 5 planets, medium */}
                        <div className="solar-orbit solar-orbit-2">
                            {companies.filter(c => c.logo).slice(3, 8).map((c, i) => (
                                <div key={i} className={`solar-planet solar-p2-${i+1}`}>
                                    <img src={c.logo} alt={c.name} title={c.name}
                                        onError={e => { e.target.style.display='none'; e.target.nextSibling.style.display='flex'; }}
                                    />
                                    <span className="solar-planet-fb">{c.name.charAt(0)}</span>
                                </div>
                            ))}
                        </div>

                        {/* Orbit 3 — 8 planets, slow */}
                        <div className="solar-orbit solar-orbit-3">
                            {companies.filter(c => c.logo).slice(8, 16).map((c, i) => (
                                <div key={i} className={`solar-planet solar-p3-${i+1}`}>
                                    <img src={c.logo} alt={c.name} title={c.name}
                                        onError={e => { e.target.style.display='none'; e.target.nextSibling.style.display='flex'; }}
                                    />
                                    <span className="solar-planet-fb">{c.name.charAt(0)}</span>
                                </div>
                            ))}
                        </div>

                        {/* Orbit 4 — 10 planets, very slow */}
                        <div className="solar-orbit solar-orbit-4">
                            {companies.filter(c => c.logo).slice(16, 26).map((c, i) => (
                                <div key={i} className={`solar-planet solar-p4-${i+1}`}>
                                    <img src={c.logo} alt={c.name} title={c.name}
                                        onError={e => { e.target.style.display='none'; e.target.nextSibling.style.display='flex'; }}
                                    />
                                    <span className="solar-planet-fb">{c.name.charAt(0)}</span>
                                </div>
                            ))}
                        </div>

                        {/* Stat cards */}
                        <div className="solar-stat solar-stat-1">
                            <span className="solar-stat-val">{companies.length}+</span>
                            <span className="solar-stat-lbl">Companies</span>
                        </div>
                        <div className="solar-stat solar-stat-2">
                            <span className="solar-stat-val">10K+</span>
                            <span className="solar-stat-lbl">Open Jobs</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Alphabet Filter ── */}
            <div className="companies-alpha-bar">
                <div className="container">
                    <div className="alpha-pills">
                        {ALPHABET.map(l => (
                            <button
                                key={l}
                                className={`alpha-pill ${activeLetter === l ? 'active' : ''}`}
                                onClick={() => { setActiveLetter(l); setSearch(''); }}
                            >
                                {l}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* ── Company List ── */}
            <div className="container companies-body">
                {isLoading ? (
                    <div className="loading-container"><div className="spinner"/></div>
                ) : filtered.length === 0 ? (
                    <div className="empty-state">
                        <Building2 size={48} style={{ opacity:0.25, margin:'0 auto 16px', display:'block' }}/>
                        <h3>No companies found</h3>
                        <p>Try a different search or letter</p>
                    </div>
                ) : (
                    grouped.map(([letter, list], groupIndex) => (
                        <div key={letter}>
                            <div className="cg-section">
                                <div className="cg-letter">{letter}</div>
                                <div className="cg-grid">
                                    {list.map(company => (
                                        <Link
                                            key={company.name}
                                            to={`/company/${encodeURIComponent(company.name)}`}
                                            className="cg-card"
                                        >
                                            <div className="cg-logo">
                                                {company.logo ? (
                                                    <img src={company.logo} alt={company.name}
                                                        onError={e => { e.target.style.display='none'; e.target.nextSibling.style.display='flex'; }}/>
                                                ) : null}
                                                <span className="cg-logo-fb" style={{ display: company.logo ? 'none' : 'flex' }}>
                                                    {company.name.charAt(0)}
                                                </span>
                                            </div>
                                            <div className="cg-info">
                                                <span className="cg-name">{company.name}</span>
                                                <span className={company.jobCount > 0 ? 'cg-sub-count' : 'cg-sub'}>
                                                    {company.jobCount > 0
                                                        ? `${company.jobCount} open ${company.jobCount === 1 ? 'job' : 'jobs'}`
                                                        : 'View open jobs'
                                                    }
                                                </span>
                                            </div>
                                            <svg className="cg-chevron" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
                                                <path d="M9 18l6-6-6-6"/>
                                            </svg>
                                        </Link>
                                    ))}
                                </div>
                            </div>
                            {/* Inject sponsored ad after every 3rd letter group, only if total > 6 */}
                            {filtered.length > 6 && (groupIndex + 1) % 3 === 0 && (
                                <div className="cg-sponsored-wrap">
                                    <SponsoredCard key={`sp-cg-${groupIndex}`} />
                                </div>
                            )}
                        </div>
                    ))
                )}

                {/* CTA banner */}
                {!isLoading && filtered.length > 0 && (
                    <div className="companies-cta">
                        <div className="companies-cta-icon">
                            <Building2 size={28} />
                        </div>
                        <div className="companies-cta-text">
                            <strong>Don't see your company?</strong>
                            <span>Invite your company to post jobs and hire the best talent.</span>
                        </div>
                        <a href="mailto:technifyz@technifyz.online" className="btn btn-primary">
                            Invite Company
                        </a>
                    </div>
                )}
            </div>
        </div>
    );
}

export default Companies;
