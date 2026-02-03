import { Building2, Clock, ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';
import './WalkinCard.css';

function WalkinCard({ job }) {
    const [isExpanded, setIsExpanded] = useState(false);

    const getTimeAgo = (date) => {
        const now = new Date();
        const displayDate = job.publishedAt ? new Date(job.publishedAt) : new Date(date);
        const diffMs = now - displayDate;
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
        const diffMinutes = Math.floor(diffMs / (1000 * 60));

        if (diffMinutes < 60) {
            return `${diffMinutes}m ago`;
        } else if (diffHours < 24) {
            return `${diffHours}h ago`;
        } else if (diffDays === 1) {
            return 'Yesterday';
        } else if (diffDays < 7) {
            return `${diffDays}d ago`;
        } else if (diffDays < 30) {
            return `${Math.floor(diffDays / 7)}w ago`;
        } else {
            return `${Math.floor(diffDays / 30)}mo ago`;
        }
    };

    // Check if content needs "Show More" button
    const shouldShowMore = () => {
        const descLength = job.description?.length || 0;
        const qualsCount = job.qualifications?.length || 0;
        const respCount = job.responsibilities?.length || 0;
        
        return descLength > 300 || qualsCount > 3 || respCount > 3;
    };

    const renderDescription = () => {
        if (!job.description) return '';

        // Combined regex for both URLs and emails
        const urlRegex = /(https?:\/\/[^\s]+)/gi;
        const emailRegex = /([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9._-]+)/gi;

        // First, split by URLs
        const urlParts = job.description.split(urlRegex);

        return urlParts.map((part, index) => {
            // Check if part is a URL
            if (part && part.match(/^https?:\/\//i)) {
                return (
                    <a
                        key={index}
                        href={part}
                        className="walkin-url-link"
                        onClick={(e) => e.stopPropagation()}
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        {part}
                    </a>
                );
            }

            // Then check for emails in remaining text
            if (!part) return null;

            const emailParts = part.split(emailRegex);
            return emailParts.map((emailPart, emailIndex) => {
                if (emailPart && emailPart.match(emailRegex)) {
                    return (
                        <a
                            key={`${index}-${emailIndex}`}
                            href={`mailto:${emailPart}`}
                            className="walkin-email-link"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {emailPart}
                        </a>
                    );
                }
                return emailPart;
            });
        });
    };

    const hasMore = shouldShowMore();

    return (
        <div className={`walkin-card card ${isExpanded ? 'expanded' : 'collapsed'}`}>
            <div className="walkin-card-header">
                {/* Company Logo */}
                <div className="walkin-company-logo">
                    {job.companyLogo ? (
                        <img src={job.companyLogo} alt={job.company} />
                    ) : (
                        <Building2 size={24} />
                    )}
                </div>

                {/* Company Name & Time */}
                <div className="walkin-card-info">
                    <div className="walkin-header-top">
                        <h3 className="walkin-company-name">{job.company}</h3>
                        <div className="walkin-time">
                            <Clock size={14} />
                            <span>{getTimeAgo(job.createdAt)}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content Container with Fixed Height */}
            <div className={`walkin-content-wrapper ${hasMore ? 'has-more' : ''}`}>
                {/* Description */}
                <div className="walkin-description">
                    <p className="walkin-full-description">
                        {renderDescription()}
                    </p>
                </div>

                {/* Qualifications */}
                {job.qualifications && job.qualifications.length > 0 && (
                    <div className="walkin-section">
                        <h4 className="walkin-section-title">Qualifications</h4>
                        <ul className="walkin-list">
                            {job.qualifications.map((qual, index) => (
                                <li key={index} className="walkin-list-item">{qual}</li>
                            ))}
                        </ul>
                    </div>
                )}

                {/* Responsibilities */}
                {job.responsibilities && job.responsibilities.length > 0 && (
                    <div className="walkin-section">
                        <h4 className="walkin-section-title">Responsibilities</h4>
                        <ul className="walkin-list">
                            {job.responsibilities.map((resp, index) => (
                                <li key={index} className="walkin-list-item">{resp}</li>
                            ))}
                        </ul>
                    </div>
                )}

                {/* Gradient Fade - Only shown when collapsed and has more content */}
                {!isExpanded && hasMore && <div className="walkin-fade-gradient"></div>}
            </div>

            {/* Show More/Less Button */}
            {hasMore && (
                <button
                    className="walkin-show-more-btn"
                    onClick={() => setIsExpanded(!isExpanded)}
                    aria-expanded={isExpanded}
                >
                    <span className="walkin-btn-text">
                        {isExpanded ? 'Show Less' : 'Show More'}
                    </span>
                    {isExpanded ? (
                        <ChevronUp size={18} />
                    ) : (
                        <ChevronDown size={18} />
                    )}
                </button>
            )}
        </div>
    );
}

export default WalkinCard;
