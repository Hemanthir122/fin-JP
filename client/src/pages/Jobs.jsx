import { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Copy, Check } from 'lucide-react';
import JobCard from '../components/JobCard';
import WalkinCard from '../components/WalkinCard';
import Pagination from '../components/Pagination';
import JobFilter from '../components/JobFilter';
import CountryBar from '../components/CountryBar';
import JobModal from '../components/JobModal';
import { useJobs, useCompanies, useLocations, useWalkins, useJobDetails } from '../hooks/useJobs';
import SponsoredCard from '../components/ads/SponsoredCard';
import DesktopSidebar from '../components/ads/DesktopSidebar';
import FloatingCTA from '../components/ads/FloatingCTA';
import MobileBannerAd from '../components/ads/MobileBannerAd';
import './Jobs.css';

const SMARTLINK = 'https://breachuptown.com/jnv7mma2?key=d47de908fdd389381c8131eaa2a36085';
const HOUR_OPTIONS = [1, 3, 6, 12, 24];

// Fetches a single job by ID and opens the modal — used for shared link redirects
function ModalJobLoader({ jobId, onClose }) {
    const { data: job, isLoading } = useJobDetails(jobId);
    if (isLoading || !job) return null;
    return <JobModal job={job} onClose={onClose} />;
}

function Jobs({ type: propType }) {
    const [currentPage, setCurrentPage]   = useState(1);
    const [filters, setFilters]           = useState({});
    const [modalJobId, setModalJobId]     = useState(null);

    // ── Copy toolbar state ───────────────────────────────────────────────────
    const [copyHours, setCopyHours]       = useState(1);
    const [copyCountry, setCopyCountry]   = useState('');
    const [copied, setCopied]             = useState(false);
    const [copyCount, setCopyCount]       = useState(null);
    const copyTimerRef                    = useRef(null);

    const location = useLocation();
    const navigate = useNavigate();
    const isWalkin = propType === 'walkin';

    // Auto-open modal if ?modal=:id is in URL
    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const modalId = params.get('modal');
        if (modalId) {
            setModalJobId(modalId);
            params.delete('modal');
            const newSearch = params.toString();
            navigate(
                { pathname: location.pathname, search: newSearch ? `?${newSearch}` : '' },
                { replace: true }
            );
        }
    }, [location.search]);

    const queryParams = useMemo(() => {
        const params = {
            page: currentPage,
            limit: 20,
            ...filters,
            ...(propType && { type: propType }),
        };

        if (!propType) {
            if (Array.isArray(params.types) && params.types.length > 0) {
                params.type = params.types.join(',');
            } else {
                delete params.type;
            }
        }
        delete params.types;

        if (Array.isArray(params.company)) {
            if (params.company.length > 0) params.company = params.company.join(',');
            else delete params.company;
        }

        if (params.cities && params.cities.length > 0) {
            params.location = params.cities.join('|');
            delete params.cities;
            delete params.country;
        } else if (params.country) {
            if (!params.location) params.location = params.country;
            delete params.country;
        }

        delete params.cities;
        return params;
    }, [currentPage, filters, propType]);

    const { data: jobsData,    isLoading: isLoadingJobs    } = useJobs(!isWalkin ? queryParams : null);
    const { data: walkinsData, isLoading: isLoadingWalkins } = useWalkins(isWalkin ? queryParams : null);
    const { data: companies = [] } = useCompanies();
    const { data: locations  = [] } = useLocations();

    const data      = isWalkin ? walkinsData : jobsData;
    const isLoading = isWalkin ? isLoadingWalkins : isLoadingJobs;

    let jobs = isWalkin ? (data?.walkins || []) : (data?.jobs || []);
    jobs = jobs.filter(job => job.status === 'published' || !job.status);

    const totalPages = data?.totalPages || 1;
    const total      = data?.total      || 0;

    const handleFilter = useCallback((newFilters) => {
        setFilters(newFilters);
        setCurrentPage(1);
    }, []);

    const handleCountryChange = useCallback((country) => {
        setFilters(prev => ({ ...prev, country, cities: [] }));
        setCurrentPage(1);
    }, []);

    // ── Copy jobs handler ────────────────────────────────────────────────────
    const handleCopyJobs = useCallback(() => {
        const cutoff = new Date(Date.now() - copyHours * 3600000);
        const countryQ = copyCountry.trim().toLowerCase();

        const matched = jobs.filter(job => {
            const pubDate = new Date(job.publishedAt || job.createdAt);
            if (pubDate < cutoff) return false;
            if (countryQ) {
                const inCountry  = (job.country  || '').toLowerCase().includes(countryQ);
                const inLocation = (job.location || '').toLowerCase().includes(countryQ);
                if (!inCountry && !inLocation) return false;
            }
            return true;
        });

        setCopyCount(matched.length);

        if (matched.length === 0) {
            alert(`No jobs found in the last ${copyHours}h${countryQ ? ` for "${copyCountry}"` : ''}.`);
            return;
        }

        const baseUrl = 'https://www.jobconnects.online/job/';

        const blocks = matched.map(job => {
            const isIntern = job.type === 'internship';
            const isWalkin = job.type === 'walkin';
            const typeLabel = isIntern ? 'Internship' : isWalkin ? 'Walk-in' : 'Job';

            const lines = [
                `🔥 New ${typeLabel} Alert!`,
                ``,
                `🏢 Company  : ${job.company}`,
                `💼 Role       : ${job.title}`,
            ];
            if (job.location)   lines.push(`📍 Location  : ${job.location}`);
            if (job.experience) lines.push(`🎓 Experience: ${job.experience}`);
            const pkg = job.package;
            if (pkg && pkg !== 'Not disclosed' && pkg !== 'Not disclosed in supplied listing' && pkg !== 'Not specified') {
                lines.push(`💰 Package   : ${pkg}`);
            }
            if (job.batch && job.batch !== 'Not specified') {
                lines.push(`🎓 Batch      : ${job.batch}`);
            }
            if (job.skills && job.skills.length) {
                lines.push(`🛠 Skills      : ${job.skills.slice(0, 5).join(', ')}`);
            }
            lines.push(``);
            lines.push(`🔗 Apply Now: ${baseUrl}${job._id}`);
            lines.push(``);
            lines.push(`✨ Share with someone who needs this!`);
            return lines.join('\n');
        });

        // Join each job block with a clear separator + blank line
        const fullText = blocks.join('\n\n━━━━━━━━━━━━━━━━━━━━━━━\n\n');

        navigator.clipboard.writeText(fullText)
            .then(() => {
                setCopied(true);
                clearTimeout(copyTimerRef.current);
                copyTimerRef.current = setTimeout(() => { setCopied(false); setCopyCount(null); }, 4000);
            })
            .catch(() => alert('Copy failed — please allow clipboard access in your browser.'));
    }, [jobs, copyHours, copyCountry]);

    const getPageTitle = () => {
        switch (propType) {
            case 'internship': return 'Internship Opportunities';
            case 'walkin':     return 'Walk-in / Email Opportunities';
            default:           return 'All Job Opportunities';
        }
    };

    const getPageDescription = () => {
        switch (propType) {
            case 'internship': return 'Start your career with hands-on experience at top companies';
            case 'walkin':     return 'Direct walk-in and email application opportunities - Apply directly!';
            default:           return 'Discover thousands of opportunities from leading companies';
        }
    };

    return (
        <div className="jobs-page">
            <Helmet>
                <title>{getPageTitle()} | JobConnects</title>
                <meta name="description" content={`${getPageDescription()}. Search and apply for the best opportunities on JobConnects.`} />
                <link rel="canonical" href={`https://jobconnects.online${propType ? '/' + propType + 's' : '/jobs'}`} />
            </Helmet>

            <div className="jobs-page-header">
                <div className="container">
                    <h1 className="page-title">{getPageTitle()}</h1>
                    <p className="page-subtitle">{getPageDescription()}</p>
                    {total > 0 && <p className="jobs-count">{total} opportunities found</p>}
                </div>
            </div>

            <div className="container">
                <CountryBar onCountryChange={handleCountryChange} />
                <JobFilter onFilter={handleFilter} companies={companies} locations={locations} />

                {/* ── Copy Jobs Toolbar ───────────────────────────────────────── */}
                <div className="copy-toolbar">
                    <span className="copy-toolbar-label">📋 Copy Jobs</span>

                    {/* Time window pills */}
                    <div className="copy-hours-group">
                        {HOUR_OPTIONS.map(h => (
                            <button
                                key={h}
                                className={`copy-hour-pill${copyHours === h ? ' active' : ''}`}
                                onClick={() => setCopyHours(h)}
                            >
                                {h}h
                            </button>
                        ))}
                    </div>

                    {/* Country filter */}
                    <input
                        type="text"
                        className="copy-country-input"
                        placeholder="Country (optional)"
                        value={copyCountry}
                        onChange={e => setCopyCountry(e.target.value)}
                    />

                    {/* Copy button */}
                    <button
                        className={`copy-btn${copied ? ' copied' : ''}`}
                        onClick={handleCopyJobs}
                    >
                        {copied
                            ? <><Check size={14} /> Copied {copyCount} job{copyCount !== 1 ? 's' : ''}!</>
                            : <><Copy size={14} /> Copy last {copyHours}h</>
                        }
                    </button>
                </div>

                {/* ── Desktop layout: jobs + sidebar ── */}
                <div className="jobs-with-sidebar">
                    <div className="jobs-main-col">
                        {isLoading ? (
                            <div className="loading-container">
                                <div className="spinner"></div>
                            </div>
                        ) : jobs.length > 0 ? (
                            <>
                                {/* ── Single responsive job list ── */}
                                <div className="jobs-grid grid grid-2">
                                    {jobs.map((job, i) => (
                                        <div key={job._id} className={`animate-fadeIn stagger-${(i % 5) + 1}`}>
                                            {isWalkin || job.type === 'walkin'
                                                ? <WalkinCard job={job} />
                                                : <JobCard job={job} />
                                            }
                                        </div>
                                    ))}
                                    {jobs.length > 6 && Array.from(
                                        { length: Math.floor(jobs.length / 10) },
                                        (_, i) => <SponsoredCard key={`sp-d-${i}`} />
                                    )}
                                </div>

                                {/* Sponsored after job list */}
                                <div className="jobs-native-banner-wrap">
                                    <SponsoredCard />
                                </div>

                                {totalPages > 1 && (
                                    <Pagination
                                        currentPage={currentPage}
                                        totalPages={totalPages}
                                        onPageChange={setCurrentPage}
                                    />
                                )}
                            </>
                        ) : (
                            <div className="empty-state">
                                {filters.cities && filters.cities.length > 0 ? (
                                    <>
                                        <div className="empty-state-icon">📍</div>
                                        <h3>No jobs found in {filters.cities.join(', ')}</h3>
                                        <p>We're actively sourcing jobs from <strong>{filters.cities.join(', ')}</strong> — check back in a few days!</p>
                                        <div className="empty-state-actions">
                                            <button className="btn btn-secondary" onClick={() => handleFilter({ ...filters, cities: [] })}>
                                                Show all {filters.country || ''} jobs
                                            </button>
                                        </div>
                                    </>
                                ) : filters.company && (Array.isArray(filters.company) ? filters.company.length > 0 : filters.company) ? (
                                    <>
                                        <div className="empty-state-icon">🏢</div>
                                        <h3>No jobs available right now</h3>
                                        <p>We're actively fetching new listings from <strong>{Array.isArray(filters.company) ? filters.company.join(', ') : filters.company}</strong>.</p>
                                        <div className="empty-state-actions">
                                            <button className="btn btn-secondary" onClick={() => handleFilter({ ...filters, company: [] })}>
                                                Clear Company Filter
                                            </button>
                                        </div>
                                    </>
                                ) : filters.country ? (
                                    <>
                                        <div className="empty-state-icon">🌍</div>
                                        <h3>No jobs found for {filters.country}</h3>
                                        <p>New listings are added daily — check back soon!</p>
                                        <div className="empty-state-actions">
                                            <button className="btn btn-secondary" onClick={() => handleFilter({ ...filters, country: '' })}>
                                                Show All Countries
                                            </button>
                                            <a href={SMARTLINK} className="btn btn-primary" target="_blank" rel="noopener noreferrer nofollow"
                                                onClick={(e) => { e.preventDefault(); window.open(SMARTLINK, '_blank', 'noopener,noreferrer'); }}>
                                                Explore Remote Jobs
                                            </a>
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <div className="empty-state-icon">🔍</div>
                                        <h3>No jobs found</h3>
                                        <p>Try adjusting your filters or explore these opportunities:</p>
                                        <div className="empty-state-actions">
                                            <a href={SMARTLINK} className="btn btn-primary" target="_blank" rel="noopener noreferrer nofollow"
                                                onClick={(e) => { e.preventDefault(); window.open(SMARTLINK, '_blank', 'noopener,noreferrer'); }}>
                                                View Remote Jobs
                                            </a>
                                        </div>
                                    </>
                                )}
                                <div className="empty-sponsored-row">
                                    <SponsoredCard />
                                </div>
                            </div>
                        )}
                    </div>

                    {/* ── Desktop Sidebar ── */}
                    <DesktopSidebar />
                </div>
            </div>

            <FloatingCTA />

            {modalJobId && (
                <ModalJobLoader jobId={modalJobId} onClose={() => setModalJobId(null)} />
            )}
        </div>
    );
}

export default Jobs;
