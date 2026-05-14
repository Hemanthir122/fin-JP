import { useState, useCallback, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Target, Zap, Shield, Users } from 'lucide-react';
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

    const features = [
        { icon: Target, title: 'Curated Opportunities', description: 'Hand-picked jobs from verified companies across industries' },
        { icon: Zap,    title: 'Quick Apply',           description: 'Apply to multiple jobs instantly with your profile' },
        { icon: Shield, title: 'Verified Listings',     description: 'All job postings are verified for authenticity' },
        { icon: Users,  title: 'Career Support',        description: 'Get guidance and support throughout your job search' },
    ];

    /* Inject sponsored native ad + mobile banner:
       - Only sponsored when total > 6: mobile after 3, desktop after 6
       - Mobile banner after every job card (mobile only via CSS)
    */
    const jobsWithAds = useMemo(() => {
        const items = [];
        const total = filteredJobs.length;
        const interval = isMobile ? 3 : 6;
        let adCount = 0;

        filteredJobs.forEach((job, i) => {
            items.push({ type: 'job', job, key: job._id });
            // Mobile banner after every job
            items.push({ type: 'mobile-banner', key: `mb-${i}` });
            // Sponsored native ad at interval (only if > 6 jobs)
            if (total > 6 && (i + 1) % interval === 0) {
                items.push({ type: 'sponsored', key: `sponsored-${adCount++}` });
            }
        });
        return items;
    }, [filteredJobs, isMobile]);

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


            <Hero />

            {/* ── Why Choose Us ── */}
            <section className="section about-section">
                <div className="container">
                    <div className="about-content">
                        <h2 className="section-title">Why Choose JobConnects?</h2>
                        <p className="section-subtitle">
                            We connect talented individuals with their dream careers. Our platform
                            makes job hunting simple, efficient, and effective.
                        </p>
                    </div>

                    <div className="features-grid">
                        {features.map((feature, index) => (
                            <div key={index} className="feature-card card">
                                <div className="feature-icon">
                                    <feature.icon size={28} />
                                </div>
                                <h3 className="feature-title">{feature.title}</h3>
                                <p className="feature-description">{feature.description}</p>
                            </div>
                        ))}
                    </div>

                    <div className="features-navigation">
                        <span className="dot active"></span>
                        <span className="dot"></span>
                        <span className="dot"></span>
                    </div>
                </div>
            </section>
            {/* ── Sponsored — between Why Choose Us and Latest Opportunities ── */}
            <div className="container home-native-banner-wrap">
                <SponsoredCard />
            </div>

            {/* ── Latest Opportunities ── */}
            <section className="section jobs-section">
                <div className="container">
                    <div className="jobs-header">
                        <div>
                            <h2 className="section-title">Latest Opportunities</h2>
                            <p className="section-subtitle">Explore the newest job openings from top companies</p>
                        </div>
                    </div>

                    <CountryBar onCountryChange={handleCountryChange} />
                    <JobFilter onFilter={handleFilter} companies={companies} locations={locations} />

                    {jobsLoading ? (
                        <div className="loading-container">
                            <div className="spinner"></div>
                        </div>
                    ) : filteredJobs.length > 0 ? (
                        <>
                            {/* ── Mobile: flat list, banner after every 4th card ── */}
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

                            {/* ── Desktop: 2-col grid, sponsored every 6 ── */}
                            <div className="jobs-grid grid grid-2 jobs-desktop-grid">
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
                                    View All Jobs
                                    <ArrowRight size={18} />
                                </Link>
                            </div>
                        </>
                    ) : (
                        /* ── Premium Empty State ── */
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
                                    <p>Try adjusting your filters or explore these opportunities:</p>
                                    <div className="empty-state-actions">
                                        <Link to="/jobs" className="btn btn-primary">Browse All Jobs</Link>
                                    </div>
                                </>
                            )}

                            {/* Premium fallback sponsored cards */}
                            <div className="empty-sponsored-grid">
                                <SponsoredCard />
                            </div>
                        </div>
                    )}
                </div>
            </section>



            {/* ── Sponsored — after career resources ── */}
            <div className="container home-native-banner-wrap">
                <SponsoredCard />
            </div>

            {/* ── CTA Section ── */}
            <section className="section cta-section">
                <div className="container">
                    <div className="cta-content glass">
                        <div className="cta-text">
                            <h2>Ready to Start Your Journey?</h2>
                            <p>
                                Thousands of companies are hiring right now. Find your perfect
                                match and take the next step in your career.
                            </p>
                        </div>
                        <div className="cta-buttons">
                            <Link to="/jobs" className="btn btn-primary btn-lg">
                                Browse Jobs
                            </Link>
                            <a
                                href={SMARTLINK}
                                className="btn btn-secondary btn-lg"
                                target="_blank"
                                rel="noopener noreferrer nofollow"
                                onClick={(e) => { e.preventDefault(); window.open(SMARTLINK, '_blank', 'noopener,noreferrer'); }}
                            >
                                Explore Opportunities
                            </a>
                        </div>
                    </div>
                </div>
            </section>

            {/* ── Floating Mobile CTA ── */}
            <FloatingCTA />
        </div>
    );
}

export default Home;
