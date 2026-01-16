import { useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
    MapPin, Briefcase, Clock, Building2,
    CheckCircle, ArrowLeft, ExternalLink, Share2
} from 'lucide-react';
import { useJobDetails, useCompanyJobs, useWalkinDetails } from '../hooks/useJobs';
import './JobDetails.css';

function JobDetails() {
    const { id } = useParams();

    const queryParams = new URLSearchParams(window.location.search);
    const typeParam = queryParams.get('type');

    // Check if we need to fetch from jobs or walkins
    const isWalkin = typeParam === 'walkin';

    // React Query hooks - cached
    // We need useJobDetails or useWalkinDetails based on type
    // Since hooks shouldn't be conditional, we can use useQuery directly or import both hooks
    // But useWalkinDetails is not imported yet. Let's fix imports first.
    // For now, assuming imports are fixed
    const { data: jobData, isLoading: isLoadingJob } = useJobDetails(id);
    const { data: walkinData, isLoading: isLoadingWalkin } = useWalkinDetails(id);

    const job = isWalkin ? walkinData : jobData;
    const isLoading = isWalkin ? isLoadingWalkin : isLoadingJob;
    const { data: companyJobs = [] } = useCompanyJobs(job?.company);

    // Filter out current job from related jobs
    const relatedJobs = useMemo(() => {
        if (!job || !companyJobs.length) return [];
        return companyJobs.filter(j => j._id !== id).slice(0, 3);
    }, [companyJobs, job, id]);

    const getTypeLabel = (type) => {
        switch (type) {
            case 'internship':
                return 'Internship';
            case 'walkin':
                return 'Walk-in';
            default:
                return 'Full Time';
        }
    };

    const formatDate = (date) => {
        return new Date(date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const handleShare = async () => {
        try {
            await navigator.share({
                title: `${job.title} at ${job.company}`,
                text: `Check out this job opportunity: ${job.title} at ${job.company}`,
                url: window.location.href
            });
        } catch (error) {
            navigator.clipboard.writeText(window.location.href);
            alert('Link copied to clipboard!');
        }
    };

    if (isLoading) {
        return (
            <div className="job-details-page">
                <div className="loading-container">
                    <div className="spinner"></div>
                </div>
            </div>
        );
    }

    if (!job) {
        return (
            <div className="job-details-page">
                <div className="container">
                    <div className="empty-state">
                        <h3>Job not found</h3>
                        <p>This job posting may have been removed or doesn't exist</p>
                        <Link to="/jobs" className="btn btn-primary mt-3">
                            Browse All Jobs
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="job-details-page">
            {/* Header */}
            <div className="job-header">
                <div className="container">
                    <Link to="/jobs" className="back-link">
                        <ArrowLeft size={20} />
                        Back to Jobs
                    </Link>

                    <div className="job-header-content">
                        <div className="job-header-left">
                            <div className="job-company-logo-lg">
                                {job.companyLogo ? (
                                    <img src={job.companyLogo} alt={job.company} loading="lazy" decoding="async" />
                                ) : (
                                    <Building2 size={40} />
                                )}
                            </div>
                            <div className="job-header-info">
                                <span className={`badge badge-${isWalkin ? 'walkin' : job.type}`}>
                                    {isWalkin ? 'Walk-in / Email' : getTypeLabel(job.type)}
                                </span>
                                <h1 className="job-title-lg">{job.title || job.company}</h1>
                            </div>

                            <div className="job-header-right">
                                <button className="btn btn-ghost" onClick={handleShare}>
                                    <Share2 size={18} />
                                    Share
                                </button>
                            </div>
                        </div>

                        <div className="job-meta-bar">
                            {job.location && (
                                <div className="meta-chip">
                                    <MapPin size={16} />
                                    {job.location}
                                </div>
                            )}
                            {job.experience && (
                                <div className="meta-chip">
                                    <Briefcase size={16} />
                                    {job.experience} years
                                </div>
                            )}
                            {job.package && (
                                <div className="meta-chip">
                                    <span className="meta-chip-label">Package:</span>
                                    {job.package}
                                </div>
                            )}
                            <div className="meta-chip">
                                <Clock size={16} />
                                Posted {formatDate(job.createdAt)}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="job-content">
                <div className="container">
                    <div className="job-content-grid">
                        <div className="job-main">
                            {/* Description */}
                            <section className="job-section">
                                <h2 className="section-heading">Job Description</h2>
                                <div className="job-description">
                                    {job.description}
                                </div>
                            </section>

                            {/* Skills */}
                            {job.skills && job.skills.length > 0 && (
                                <section className="job-section">
                                    <h2 className="section-heading">Required Skills</h2>
                                    <div className="skills-list">
                                        {job.skills.map((skill, index) => (
                                            <span key={index} className="skill-tag">
                                                {skill}
                                            </span>
                                        ))}
                                    </div>
                                </section>
                            )}

                            {/* Responsibilities */}
                            {job.responsibilities && job.responsibilities.length > 0 && (
                                <section className="job-section">
                                    <h2 className="section-heading">Roles & Responsibilities</h2>
                                    <ul className="responsibilities-list">
                                        {job.responsibilities.map((item, index) => (
                                            <li key={index}>
                                                <CheckCircle size={18} className="check-icon" />
                                                {item}
                                            </li>
                                        ))}
                                    </ul>
                                </section>
                            )}

                            {/* Qualifications */}
                            {job.qualifications && job.qualifications.length > 0 && (
                                <section className="job-section">
                                    <h2 className="section-heading">Qualifications</h2>
                                    <ul className="responsibilities-list">
                                        {job.qualifications.map((item, index) => (
                                            <li key={index}>
                                                <CheckCircle size={18} className="check-icon" />
                                                {item}
                                            </li>
                                        ))}
                                    </ul>
                                </section>
                            )}

                            {/* Apply Button - In Page - Hidden for Walkins */}
                            {!isWalkin && (
                                <div className="apply-section">
                                    <a
                                        href={job.applyLink || '#'}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="btn btn-primary btn-lg btn-apply"
                                    >
                                        Apply Now
                                        <ExternalLink size={18} />
                                    </a>
                                </div>
                            )}
                        </div>

                        {/* Sidebar */}
                        <div className="job-sidebar">
                            <div className="sidebar-card card">
                                <h3>Job Overview</h3>
                                <div className="overview-list">
                                    <div className="overview-item">
                                        <span className="overview-label">Job Type</span>
                                        <span className="overview-value">{isWalkin ? 'Walk-in / Email' : getTypeLabel(job.type)}</span>
                                    </div>
                                    {job.location && (
                                        <div className="overview-item">
                                            <span className="overview-label">Location</span>
                                            <span className="overview-value">{job.location}</span>
                                        </div>
                                    )}
                                    {job.experience && (
                                        <div className="overview-item">
                                            <span className="overview-label">Experience</span>
                                            <span className="overview-value">{job.experience} years</span>
                                        </div>
                                    )}
                                    {job.package && (
                                        <div className="overview-item">
                                            <span className="overview-label">Package</span>
                                            <span className="overview-value highlight">{job.package}</span>
                                        </div>
                                    )}
                                    <div className="overview-item">
                                        <span className="overview-label">Posted On</span>
                                        <span className="overview-value">{formatDate(job.createdAt)}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Related Jobs */}
                            {relatedJobs.length > 0 && (
                                <div className="sidebar-card card">
                                    <h3>More from {job.company}</h3>
                                    <div className="related-jobs">
                                        {relatedJobs.map((relJob) => (
                                            <Link
                                                key={relJob._id}
                                                to={`/job/${relJob._id}`}
                                                className="related-job-item"
                                            >
                                                <span className="related-job-title">{relJob.title}</span>
                                                <span className="related-job-location">{relJob.location}</span>
                                            </Link>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default JobDetails;
