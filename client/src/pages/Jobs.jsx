import { useState, useCallback, useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import JobCard from '../components/JobCard';
import WalkinCard from '../components/WalkinCard';
import Pagination from '../components/Pagination';
import JobFilter from '../components/JobFilter';
import CountryBar from '../components/CountryBar';
import { useJobs, useCompanies, useLocations, useWalkins } from '../hooks/useJobs';
import SponsoredCard from '../components/ads/SponsoredCard';
import NativeBannerSection from '../components/ads/NativeBannerSection';
import DesktopSidebar from '../components/ads/DesktopSidebar';
import FloatingCTA from '../components/ads/FloatingCTA';
import MobileBannerAd from '../components/ads/MobileBannerAd';
import './Jobs.css';

const SMARTLINK = 'https://breachuptown.com/jnv7mma2?key=d47de908fdd389381c8131eaa2a36085';

function Jobs({ type: propType }) {
    const [currentPage, setCurrentPage] = useState(1);
    const [filters, setFilters] = useState({});

    const isWalkin = propType === 'walkin';

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

    const { data: jobsData,    isLoading: isLoadingJobs    } = useJobs(!isWalkin ? queryParams : {});
    const { data: walkinsData, isLoading: isLoadingWalkins } = useWalkins(isWalkin ? queryParams : {});
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

    /* Inject sponsored card every 10 jobs + mobile banner after every job */
    const jobsWithAds = useMemo(() => {
        const items = [];
        jobs.forEach((job, i) => {
            items.push({ type: 'job', job, key: job._id });
            // Mobile banner after every job card
            items.push({ type: 'mobile-banner', key: `mb-${i}` });
            // Sponsored native ad every 10 jobs (desktop + mobile)
            if ((i + 1) % 10 === 0) {
                items.push({ type: 'sponsored', key: `sp-${i}` });
            }
        });
        return items;
    }, [jobs]);

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

                {/* ── Desktop layout: jobs + sidebar ── */}
                <div className="jobs-with-sidebar">
                    <div className="jobs-main-col">
                        {isLoading ? (
                            <div className="loading-container">
                                <div className="spinner"></div>
                            </div>
                        ) : jobs.length > 0 ? (
                            <>
                                {/* ── Mobile: flat list, banner after every card ── */}
                                <div className="jobs-mobile-list">
                                    {jobs.map((job, i) => (
                                        <div key={job._id}>
                                            <div className={`animate-fadeIn stagger-${(i % 5) + 1}`}>
                                                {isWalkin || job.type === 'walkin'
                                                    ? <WalkinCard job={job} />
                                                    : <JobCard job={job} />
                                                }
                                            </div>
                                            <MobileBannerAd key={`mb-${job._id}`} />
                                            {jobs.length > 6 && (i + 1) % 3 === 0 && (
                                                <SponsoredCard key={`sp-m-${i}`} />
                                            )}
                                        </div>
                                    ))}
                                </div>

                                {/* ── Desktop: 2-col grid ── */}
                                <div className="jobs-grid grid grid-2 jobs-desktop-grid">
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

                                {/* Native banner after job list */}
                                <div className="jobs-native-banner-wrap">
                                    <NativeBannerSection title="Sponsored Resources" />
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
                                            <a
                                                href={SMARTLINK}
                                                className="btn btn-primary"
                                                target="_blank"
                                                rel="noopener noreferrer nofollow"
                                                onClick={(e) => { e.preventDefault(); window.open(SMARTLINK, '_blank', 'noopener,noreferrer'); }}
                                            >
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
                                            <a
                                                href={SMARTLINK}
                                                className="btn btn-primary"
                                                target="_blank"
                                                rel="noopener noreferrer nofollow"
                                                onClick={(e) => { e.preventDefault(); window.open(SMARTLINK, '_blank', 'noopener,noreferrer'); }}
                                            >
                                                View Remote Jobs
                                            </a>
                                        </div>
                                    </>
                                )}

                                {/* Sponsored fallback cards */}
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

            {/* ── Floating Mobile CTA ── */}
            <FloatingCTA />
        </div>
    );
}

export default Jobs;
