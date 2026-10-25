import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, ArrowRight } from 'lucide-react';
import './Hero.css';

const AVATARS = [
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face',
    'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=40&h=40&fit=crop&crop=face',
    'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=40&h=40&fit=crop&crop=face',
    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=40&h=40&fit=crop&crop=face',
];

const POPULAR_TAGS = ['Remote', 'Bengaluru', 'Software engineering', 'Fresher'];

function Hero({ onSearch }) {
    const [searchVal, setSearchVal] = useState('');
    const navigate = useNavigate();

    const handleSearch = (e) => {
        e.preventDefault();
        if (onSearch) onSearch(searchVal);
        else navigate(`/jobs?search=${encodeURIComponent(searchVal)}`);
    };

    const handleTag = (tag) => {
        if (onSearch) onSearch(tag);
        else navigate(`/jobs?search=${encodeURIComponent(tag)}`);
    };

    return (
        <section className="hero">
            <div className="hero-inner">

                {/* ── Left ── */}
                <div className="hero-content">
                    <div className="hero-pill">
                        <span className="hero-pill-dot" />
                        Curated for your next move
                    </div>

                    <h1 className="hero-title">
                        Work worth<br />
                        <span className="hero-title-line2">looking forward to.</span>
                    </h1>

                    <p className="hero-subtitle">
                        Clear, useful job updates for <em>freshers</em>, <em>experienced professionals</em>, and{' '}
                        <strong>everyone building what comes next.</strong>
                    </p>

                    {/* Search */}
                    <form className="hero-search-row" onSubmit={handleSearch}>
                        <div className="hero-search-icon">
                            <Search size={15} />
                        </div>
                        <input
                            type="text"
                            className="hero-search-input"
                            placeholder="Search jobs, companies, or skills"
                            value={searchVal}
                            onChange={e => setSearchVal(e.target.value)}
                        />
                        <button type="submit" className="hero-search-btn">Search jobs</button>
                    </form>

                    {/* Popular tags */}
                    <div className="hero-tags">
                        <span className="hero-tags-label">Popular:</span>
                        {POPULAR_TAGS.map(tag => (
                            <button key={tag} className="hero-tag" onClick={() => handleTag(tag)} type="button">
                                {tag}
                            </button>
                        ))}
                    </div>

                    {/* Join row */}
                    <div className="hero-join">
                        <div className="hero-avatars">
                            {AVATARS.map((src, i) => (
                                <img key={i} src={src} alt="user"
                                    className="hero-avatar"
                                    style={{ zIndex: AVATARS.length - i }}
                                    onError={e => e.target.style.display = 'none'}
                                />
                            ))}
                            <div className="hero-avatar-plus">+</div>
                        </div>
                        <div className="hero-join-text">
                            <strong>4,000+</strong> career readers<br />
                            <span style={{ color: '#aaa', fontSize: '11px' }}>updated daily</span>
                        </div>
                    </div>
                </div>

                {/* ── Right card ── */}
                <div className="hero-card">
                    <div className="hero-card-header">
                        <span className="hero-card-label">Today's pick</span>
                        <span className="hero-card-new">New</span>
                    </div>
                    <div className="hero-card-body">
                        <div className="hero-card-icon">🧱</div>
                        <div className="hero-card-title">
                            Build <em>products</em> people<br />remember.
                        </div>
                        <div className="hero-card-desc">
                            A practical guide to finding roles where your work has room to matter.
                        </div>
                        <a href="/jobs" className="hero-card-link">
                            Read the latest <ArrowRight size={13} />
                        </a>
                    </div>
                </div>
            </div>
        </section>
    );
}

export default Hero;
