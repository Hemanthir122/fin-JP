import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Building2 } from 'lucide-react';
import JobCard from '../components/JobCard';
import { useCompanyJobs, useCompanyDetails } from '../hooks/useJobs';
import './CompanyJobs.css';

function CompanyJobs() {
    const { companyName } = useParams();

    // React Query hooks - cached
    const { data: jobs = [], isLoading: jobsLoading } = useCompanyJobs(companyName);
    const { data: company } = useCompanyDetails(companyName);

    const loading = jobsLoading;

    return (
        <div className="company-jobs-page">
            <div className="company-header">
                <div className="container">
                    <Link to="/jobs" className="back-link">
                        <ArrowLeft size={20} />
                        Back to Jobs
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
                {loading ? (
                    <div className="loading-container">
                        <div className="spinner"></div>
                    </div>
                ) : jobs.length > 0 ? (
                    <div className="jobs-grid grid grid-3">
                        {jobs.map((job, index) => (
                            <div key={job._id} className={`animate-fadeIn stagger-${(index % 5) + 1}`}>
                                <JobCard job={job} />
                            </div>
                        ))}
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
