import { useState, useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import JobCard from '../components/JobCard';
import WalkinCard from '../components/WalkinCard';
import Pagination from '../components/Pagination';
import JobFilter from '../components/JobFilter';
import HorizontalNativeAd from '../components/ads/HorizontalNativeAd';
import MobileNativeAd from '../components/ads/MobileNativeAd';
import SocialBar from '../components/ads/SocialBar';
import Popunder from '../components/ads/Popunder';
import { useJobs, useCompanies, useLocations, useWalkins } from '../hooks/useJobs';
import './Jobs.css';

function Jobs({ type: propType }) {
    const [searchParams] = useSearchParams();
    const [currentPage, setCurrentPage] = useState(1);
    const [filters, setFilters] = useState({});
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

    // Build query params for the API
    const queryParams = useMemo(() => ({
        page: currentPage,
        limit: 20,
        ...filters,
        ...(propType && { type: propType }),
    }), [currentPage, filters, propType]);

    // React Query hooks - cached and deduplicated
    // Use the appropriate hook based on the type
    const isWalkin = propType === 'walkin';

    // Only pass query params to the enabled hook, don't pass 'enabled' flag in queryParams
    const jobsQueryParams = !isWalkin ? queryParams : undefined;
    const walkinsQueryParams = isWalkin ? queryParams : undefined;

    const { data: jobsData, isLoading: isLoadingJobs } = useJobs(jobsQueryParams || {});
    const { data: walkinsData, isLoading: isLoadingWalkins } = useWalkins(walkinsQueryParams || {});

    const { data: companies = [] } = useCompanies();
    const { data: locations = [] } = useLocations();

    // Handle resize for responsive ad placement
    useState(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth <= 768);
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const data = isWalkin ? walkinsData : jobsData;
    const isLoading = isWalkin ? isLoadingWalkins : isLoadingJobs;

    let jobs = isWalkin ? (data?.walkins || []) : (data?.jobs || []);
    
    // Safety filter: Remove any draft jobs (should be filtered by backend)
    jobs = jobs.filter(job => job.status === 'published' || !job.status);
    
    const totalPages = data?.totalPages || 1;
    const total = data?.total || 0;

    const handleFilter = useCallback((newFilters) => {
        setFilters(newFilters);
        setCurrentPage(1);
    }, []);

    const getPageTitle = () => {
        switch (propType) {
            case 'internship':
                return 'Internship Opportunities';
            case 'walkin':
                return 'Walk-in / Email Opportunities';
            default:
                return 'All Job Opportunities';
        }
    };

    const getPageDescription = () => {
        switch (propType) {
            case 'internship':
                return 'Start your career with hands-on experience at top companies';
            case 'walkin':
                return 'Direct walk-in and email application opportunities - Apply directly!';
            default:
                return 'Discover thousands of opportunities from leading companies';
        }
    };

    return (
        <div className="jobs-page">
            <Helmet>
                <title>{getPageTitle()} | JobConnects</title>
                <meta name="description" content={`${getPageDescription()}. Search and apply for the best opportunities on JobConnects.`} />
                <link rel="canonical" href={`https://jobconnects.online${propType ? '/' + propType + 's' : '/jobs'}`} />
            </Helmet>

            {/* Global Ads */}
            <SocialBar />
            <Popunder />

            <div className="jobs-page-header">
                <div className="container">
                    <h1 className="page-title">{getPageTitle()}</h1>
                    <p className="page-subtitle">{getPageDescription()}</p>
                    {total > 0 && (
                        <p className="jobs-count">{total} opportunities found</p>
                    )}
                </div>
            </div>

            <div className="container">
                <JobFilter
                    onFilter={handleFilter}
                    companies={companies}
                    locations={locations}
                />

                {isLoading ? (
                    <div className="loading-container">
                        <div className="spinner"></div>
                    </div>
                ) : jobs.length > 0 ? (
                    <>
                        <div className="jobs-grid grid grid-3">
                            {jobs.map((job, index) => {
                                // Desktop: Show Horizontal Ad Row ONLY after first 3 job cards (index 2)
                                const showAdRow = (index + 1) % 3 === 0 && window.innerWidth > 768;
                                
                                // Mobile: Show Native Ad after every 2 walkin cards
                                const showMobileAd = (index + 1) % 2 === 0 && window.innerWidth <= 768 && isWalkin;
                                
                                return (
                                    <>
                                        <div key={job._id} className={`animate-fadeIn stagger-${(index % 5) + 1}`}>
                                            {isWalkin || job.type === 'walkin' ? (
                                                <WalkinCard job={job} />
                                            ) : (
                                                <JobCard job={job} />
                                            )}
                                        </div>
                                        {showAdRow && (
                                            <HorizontalNativeAd key={`horizontal-ad-${index}`} index={index} />
                                        )}
                                        {showMobileAd && (
                                            <MobileNativeAd key={`mobile-ad-${index}`} index={index} />
                                        )}
                                    </>
                                );
                            })}
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
                        <h3>No jobs found</h3>
                        <p>Try adjusting your filters or check back later for new opportunities</p>
                    </div>
                )}
            </div>
        </div>
    );
}

export default Jobs;

