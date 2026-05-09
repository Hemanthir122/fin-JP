import { useState, useEffect, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Building2 } from 'lucide-react';
import JobCard from '../components/JobCard';
import SponsoredCard from '../components/ads/SponsoredCard';
import { useCompanyJobs, useCompanyDetails } from '../hooks/useJobs';
import './CompanyJobs.css';

function CompanyJobs() {
    const { companyName } = useParams();
    const [isMobile, setIsMobile] = useState(() => window.innerWidth <= 640);

    useEffect(() => {
        const handler = () => setIsMobile(window.innerWidth <= 640);
        window.addEventListener('resize', handler);
        return () => window.removeEventListener('resize', handler);
    }, []);

    const { data: jobs = [], isLoading: jobsLoading } = useCompanyJobs(companyName);
    const { data: company } = useCompanyDetails(companyName);

    // Same logic as Home/Jobs:
    // Only show if total > 6, mobile: after every 3rd, desktop: after every 6th
    const jobsWithAds = useMemo(() => {
        const items = [];
        const total = jobs.length;
        const interval = isMobile ? 3 : 6;
        let adCount = 0;

        jobs.forEach((job, i) => {
            items.push({ type: 'job', job, key: job._id });
            if (total > 6 && (i + 1) % interval === 0) {
                items.push({ type: 'sponsored', key: `sp-cj-${adCount++}` });
            }
        });
        return items;
    }, [jobs, isMobile]);

    return (
        <div className="company-jobs-page">
            <div className="company-header">
                <div className="container">
                    <Link to="/companies" className="back-link">
                        <ArrowLeft size={20} />
                        Back to Companies
                    </Link>

                    <div className="company-info">
                        <div className="company-logo-large">
                            {company?.logo ? (
                                <img src={company.logo} alt={companyName} loading="lazy" decoding="async" />
                            ) : (
                                <Building2 size={48} />
                            )}
                        </div>
                        <div className="company-details">
                            <h1 className="company-name">{decodeURIComponent(companyName)}</h1>
                            <p className="company-jobs-count">
                                {jobs.length} {jobs.length === 1 ? 'opening' : 'openings'} available
                            </p>
                            {company?.aboutCompany && (
                                <p className="company-about" style={{ marginTop: '12px', color: 'var(--text-muted)', fontSize: '14px', lineHeight: '1.5' }}>
                                    {company.aboutCompany}
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <div className="container">
                {jobsLoading ? (
                    <div className="loading-container">
                        <div className="spinner"></div>
                    </div>
                ) : jobs.length > 0 ? (
                    <div className="jobs-grid grid grid-2">
                        {jobsWithAds.map((item, index) =>
                            item.type === 'sponsored' ? (
                                <SponsoredCard key={item.key} />
                            ) : (
                                <div key={item.key} className={`animate-fadeIn stagger-${(index % 5) + 1}`}>
                                    <JobCard job={item.job} />
                                </div>
                            )
                        )}
                    </div>
                ) : (
                    <div className="empty-state">
                        <h3>No openings found</h3>
                        <p>This company doesn't have any active job postings at the moment</p>
                        <Link to="/jobs" className="btn btn-primary mt-3">
                            Browse All Jobs
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
}

export default CompanyJobs;
