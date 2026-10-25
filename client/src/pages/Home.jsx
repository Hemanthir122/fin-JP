import { useState, useCallback, useMemo, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import Hero from '../components/Hero';
import JobCard from '../components/JobCard';
import JobFilter from '../components/JobFilter';
import CountryBar from '../components/CountryBar';
import { useLatestJobs, useCompanies, useLocations } from '../hooks/useJobs';
import SponsoredCard from '../components/ads/SponsoredCard';
import FloatingCTA from '../components/ads/FloatingCTA';
import MobileBannerAd from '../components/ads/MobileBannerAd';
import './Home.css';

const SMARTLINK = 'https://breachuptown.com/jnv7mma2?key=d47de908fdd389381c8131eaa2a36085';

function Home() {
    const [filters, setFilters] = useState({});
    const [isMobile, setIsMobile] = useState(() => window.innerWidth <= 640);
    const navigate = useNavigate();

    useEffect(() => {
        const handler = () => setIsMobile(window.innerWidth <= 640);
        window.addEventListener('resize', handler);
        return () => window.removeEventListener('resize', handler);
    }, []);

    const { data: jobs = [], isLoading: jobsLoading } = useLatestJobs();
    const { data: companies = [] } = useCompanies();
    const { data: locations = [] } = useLocations();

    const handleFilter = useCallback((newFilters) => {
        setFilters(newFilters);
    }, []);

    const handleCountryChange = useCallback((country) => {
        setFilters(prev => ({ ...prev, country, cities: [] }));
    }, []);

    // Hero search — update filter
    const handleHeroSearch = useCallback((search) => {
        setFilters(prev => ({ ...prev, search }));
        // Scroll to jobs section
        setTimeout(() => {
            document.querySelector('.home-latest')?.scrollIntoView({ behavior: 'smooth' });
        }, 50);
    }, []);

    const filteredJobs = useMemo(() => {
        let result = [...jobs];
        result = result.filter(job => job.status === 'published' || !job.status);

        const { search, types, company, country, cities } = filters;

        if (cities && cities.length > 0) {
            result = result.filter(job => {
                const loc = (job.location || '').toLowerCase();
                return cities.some(cityName => loc.includes(cityName.toLowerCase()));
            });
        } else if (country) {
            result = result.filter(job => {
                const loc = (job.location || '').toLowerCase();
                const ctry = (job.country || '').toLowerCase();
                return loc.includes(country.toLowerCase()) || ctry.includes(country.toLowerCase());
            });
        }

        if (search) {
            const s = search.toLowerCase();
            result = result.filter(job =>
                job.title.toLowerCase().includes(s) ||
                job.company.toLowerCase().includes(s) ||
                (job.location || '').toLowerCase().includes(s)
            );
        }
        if (types && types.length > 0) result = result.filter(job => types.includes(job.type || 'job'));
        if (company) {
            if (Array.isArray(company) && company.length > 0)
                result = result.filter(job => company.includes(job.company));
            else if (typeof company === 'string' && company)
                result = result.filter(job => job.company.toLowerCase().includes(company.toLowerCase()));
        }

        return result;
    }, [jobs, filters]);

    // Count categories from real data
    const totalPublished = jobs.filter(j => j.status === 'published' || !j.status).length;
    const freshers  = jobs.filter(j => (j.experience || '').toLowerCase().includes('fresh') || (j.experience || '') === 'Fresher').length;
    const internships = jobs.filter(j => j.type === 'internship').length;
    const remote    = jobs.filter(j => (j.location || '').toLowerCase().includes('remote') || (j.jobType || '').toLowerCase().includes('remote')).length;

    const LANES = [
        { count: totalPublished || 148, label: 'Off campus drives',  desc: 'Find your next opportunity', filter: { types: ['job'] } },
        { count: freshers || 96,        label: 'Fresher jobs',        desc: 'Start strong, grow fast',    filter: { search: 'fresher' } },
        { count: internships || 72,     label: 'Internships',         desc: 'Learn by doing',             filter: { types: ['internship'] } },
        { count: remote || 54,          label: 'Work from home',      desc: 'Work from anywhere',         filter: { search: 'remote' } },
    ];

    return (
        <div className="home-page">
            <Helmet>
                <title>JobConnects - Remote, Part-Time, Delivery & Worldwide Jobs 2025</title>
                <meta name="description" content="Find remote jobs, work from home, part-time, per hour, delivery, driving, freelance and full-time jobs worldwide. India, USA, UK, Canada, Australia, UAE, Germany, Singapore and 50+ countries. Freshers to 20+ years. Apply instantly." />
                <meta name="keywords" content="remote jobs, work from home, part time jobs, per hour jobs, hourly jobs, delivery jobs, driver jobs, courier jobs, logistics jobs, freelance jobs, contract jobs, full time jobs, fresher jobs, internships, IT jobs, software engineer, data analyst, jobs in India, jobs in USA, jobs in UK, jobs in Canada, jobs in Australia, jobs in UAE, jobs in Dubai, jobs in Germany, jobs in Singapore, Bangalore jobs, Mumbai jobs, Hyderabad jobs, TCS jobs, Infosys jobs, Google jobs, Amazon jobs, quick apply, hiring 2025" />
                <link rel="canonical" href="https://jobconnects.online/" />
                <meta property="og:title" content="JobConnects - Remote, Part-Time, Delivery & Worldwide Jobs" />
                <meta property="og:description" content="Find remote, part-time, per hour, delivery and full-time jobs worldwide. All countries, all experience levels." />
                <meta property="og:url" content="https://jobconnects.online/" />
                <meta property="og:type" content="website" />
                <meta property="og:image" content="https://jobconnects.online/logo.png" />
                <meta name="twitter:card" content="summary_large_image" />
                <meta name="twitter:title" content="JobConnects - Remote, Part-Time, Delivery & Worldwide Jobs" />
                <meta name="twitter:description" content="Find remote, part-time, per hour, delivery and full-time jobs worldwide." />
            </Helmet>

            {/* ── Hero ── */}
            <Hero onSearch={handleHeroSearch} />

            {/* ── Latest Opportunities ── */}
            <div className="home-latest">
                <div className="home-latest-inner">
                    <div className="home-latest-header">
                        <div>
                            <div className="home-label">The latest</div>
                            <h2 className="home-latest-title">Opportunities worth a look</h2>
                        </div>
                        <Link to="/jobs" className="home-latest-view-all">
                            View all jobs <ArrowRight size={14} />
                        </Link>
                    </div>

                    <CountryBar onCountryChange={handleCountryChange} />

                    <div className="home-filters-bar">
                        <JobFilter onFilter={handleFilter} companies={companies} locations={locations} />
                    </div>

                    {jobsLoading ? (
                        <div style={{ display: 'flex', justifyContent: 'center', padding: '48px 0' }}>
                            <div className="spinner"></div>
                        </div>
                    ) : filteredJobs.length > 0 ? (
                        <>
                            {/* Mobile: flat list, banner every 4th */}
                            <div className="jobs-mobile-list">
                                {filteredJobs.map((job, i) => (
                                    <div key={job._id}>
                                        <div className={`animate-fadeIn stagger-${(i % 5) + 1}`}>
                                            <JobCard job={job} />
                                        </div>
                                        {(i + 1) % 4 === 0 && <MobileBannerAd key={`mb-${job._id}`} />}
                                    </div>
                                ))}
                            </div>

                            {/* Desktop: 2-col grid */}
                            <div className="jobs-grid grid-2 jobs-desktop-grid">
                                {filteredJobs.map((job, i) => (
                                    <div key={job._id} className={`animate-fadeIn stagger-${(i % 5) + 1}`}>
                                        <JobCard job={job} />
                                    </div>
                                ))}
                                {filteredJobs.length > 6 && Array.from(
                                    { length: Math.floor(filteredJobs.length / 6) },
                                    (_, i) => <SponsoredCard key={`sp-d-${i}`} />
                                )}
                            </div>

                            <div className="view-all-container">
                                <Link to="/jobs" className="btn btn-primary btn-lg">
                                    View All Jobs <ArrowRight size={16} />
                                </Link>
                            </div>
                        </>
                    ) : (
                        <div className="home-empty-state">
                            <div className="empty-state-icon">🔍</div>
                            {filters.cities && filters.cities.length > 0 ? (
                                <>
                                    <h3>No jobs found in {filters.cities.join(', ')}</h3>
                                    <p>We're actively sourcing jobs from <strong>{filters.cities.join(', ')}</strong>. Check back in a few days.</p>
                                    <div className="empty-state-actions">
                                        <button className="btn btn-secondary" onClick={() => handleFilter({ ...filters, cities: [] })}>
                                            Show all {filters.country} jobs
                                        </button>
                                        <Link to="/jobs" className="btn btn-primary">Browse All Jobs</Link>
                                    </div>
                                </>
                            ) : filters.country ? (
                                <>
                                    <h3>No jobs found for {filters.country}</h3>
                                    <p>New listings are added daily — check back soon!</p>
                                    <div className="empty-state-actions">
                                        <button className="btn btn-secondary" onClick={() => handleFilter({ ...filters, country: '' })}>Show All Countries</button>
                                        <Link to="/jobs" className="btn btn-primary">Browse All Jobs</Link>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <h3>No jobs found</h3>
                                    <p>Try adjusting your filters or explore all opportunities:</p>
                                    <div className="empty-state-actions">
                                        <Link to="/jobs" className="btn btn-primary">Browse All Jobs</Link>
                                    </div>
                                </>
                            )}
                            <div className="empty-sponsored-grid">
                                <SponsoredCard />
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* ── Sponsored ── */}
            <div className="home-native-banner-wrap" style={{ paddingTop: '24px', paddingBottom: '0' }}>
                <SponsoredCard />
            </div>

            {/* ── Find your lane ── */}
            <div className="home-lanes">
                <div className="home-lanes-inner">
                    <div className="home-label">Find your lane</div>
                    <div className="home-lanes-grid">
                        {LANES.map((lane, i) => (
                            <div
                                key={i}
                                className="home-lane-card"
                                onClick={() => {
                                    handleFilter(lane.filter);
                                    document.querySelector('.home-latest')?.scrollIntoView({ behavior: 'smooth' });
                                }}
                            >
                                <ArrowRight size={14} className="home-lane-arrow" />
                                <div className="home-lane-count">{lane.count}</div>
                                <div className="home-lane-title">{lane.label}</div>
                                <div className="home-lane-desc">{lane.desc}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* ── Manifesto ── */}
            <div className="home-manifesto">
                <div className="home-manifesto-inner">
                    <div className="home-manifesto-headline">
                        A better job search.<br />
                        <span style={{ color: '#2d6a4f' }}>Less noise.</span> More signal.
                    </div>
                    <div className="home-manifesto-body">
                        JobConnects turns scattered <em>hiring updates</em> into clear, useful reads. Every post is
                        structured so you can quickly understand the role, check the essentials, and <strong>apply
                        through the official source.</strong>
                    </div>
                </div>
            </div>

            {/* ── Sponsored ── */}
            <div className="home-native-banner-wrap" style={{ paddingTop: '24px', paddingBottom: '24px' }}>
                <SponsoredCard />
            </div>

            {/* ── Floating Mobile CTA ── */}
            <FloatingCTA />
        </div>
    );
}

export default Home;
