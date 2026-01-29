import { useState, useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import JobCard from '../components/JobCard';
import WalkinCard from '../components/WalkinCard';
import Pagination from '../components/Pagination';
import JobFilter from '../components/JobFilter';
import { useJobs, useCompanies, useLocations, useWalkins } from '../hooks/useJobs';
import NativeAd from '../components/NativeAd';
import './Jobs.css';
import '../components/NativeAd.css';

function Jobs({ type: propType }) {
    const [searchParams] = useSearchParams();
    const [currentPage, setCurrentPage] = useState(1);
    const [filters, setFilters] = useState({});

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

    const { data: jobsData, isLoading: isLoadingJobs } = useJobs(
        !isWalkin ? queryParams : { ...queryParams, enabled: false }
    );

    const { data: walkinsData, isLoading: isLoadingWalkins } = useWalkins(
        isWalkin ? queryParams : { ...queryParams, enabled: false }
    );

    const { data: companies = [] } = useCompanies();
    const { data: locations = [] } = useLocations();

    const data = isWalkin ? walkinsData : jobsData;
    const isLoading = isWalkin ? isLoadingWalkins : isLoadingJobs;

    const jobs = isWalkin ? (data?.walkins || []) : (data?.jobs || []);
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
                            {jobs.map((job, index) => (
                                <div key={job._id} className="job-wrapper" style={{ display: 'contents' }}>
                                    <div className={`animate-fadeIn stagger-${(index % 5) + 1}`}>
                                        {isWalkin || job.type === 'walkin' ? (
                                            <WalkinCard job={job} />
                                        ) : (
                                            <JobCard job={job} />
                                        )}
                                    </div>
                                    {/* Insert Native Ad after every 3rd job */}
                                    {(index + 1) % 3 === 0 && index !== jobs.length - 1 && (
                                        <NativeAd />
                                    )}
                                </div>
                            ))}
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

