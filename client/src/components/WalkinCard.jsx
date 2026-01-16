import { Building2, Clock } from 'lucide-react';
import './WalkinCard.css';

function WalkinCard({ job }) {

    const getTimeAgo = (date) => {
        const now = new Date();
        const posted = new Date(date);
        const diffMs = now - posted;
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

    // Truncate description for preview
    const truncateDescription = (text, maxLength = 150) => {
        if (!text) return '';
        if (text.length <= maxLength) return text;
        return text.substring(0, maxLength) + '...';
    };

    return (
        <div className="walkin-card card">
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
                    <div className="flex justify-between items-center w-full">
                        <h3 className="walkin-company-name">{job.company}</h3>
                        <div className="walkin-time">
                            <Clock size={14} />
                            <span>{getTimeAgo(job.createdAt)}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Full Description */}
            <div className="walkin-description">
                <p className="walkin-full-description">
                    {(() => {
                        if (!job.description) return '';

                        // Split by whitespace to find potential emails, but preserve structure
                        const emailRegex = /([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9._-]+)/gi;

                        const parts = job.description.split(emailRegex);

                        return parts.map((part, index) => {
                            if (part.match(emailRegex)) {
                                return (
                                    <a
                                        key={index}
                                        href={`mailto:${part}`}
                                        className="walkin-email-link"
                                        onClick={(e) => e.stopPropagation()}
                                    >
                                        {part}
                                    </a>
                                );
                            }
                            return part;
                        });
                    })()}
                </p>
            </div>
        </div>
    );
}

export default WalkinCard;
