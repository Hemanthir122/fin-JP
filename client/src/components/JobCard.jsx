import { useState } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Briefcase, Clock, Building2, MoreVertical, Share2 } from 'lucide-react';
import './JobCard.css';

function JobCard({ job }) {
    const [showMenu, setShowMenu] = useState(false);

    const toggleMenu = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setShowMenu(!showMenu);
    };

    const handleShare = async (e) => {
        e.preventDefault();
        e.stopPropagation();

        try {
            await navigator.clipboard.writeText(`${window.location.origin}/job/${job._id}`);
            alert('Job link copied to clipboard!');
        } catch (err) {
            console.error('Failed to copy link:', err);
        }
        setShowMenu(false);
    };

    // ... existing getTypeLabel and getTimeAgo functions ...
    const getTypeLabel = (type) => {
        switch (type) {
            case 'internship':
                return 'Internship';
            case 'walkin':
                return 'Walk-in/Email';
            default:
                return 'Full Time';
        }
    };

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

    // Get only first 4 skills
    const displaySkills = job.skills ? job.skills.slice(0, 4) : [];

    return (
        <div className="job-card card" onMouseLeave={() => setShowMenu(false)}>
            <div className="job-card-top">
                {/* Left: Logo */}
                <div className="job-company-logo">
                    {job.companyLogo ? (
                        <img src={job.companyLogo} alt={job.company} />
                    ) : (
                        <Building2 size={28} />
                    )}
                </div>

                {/* Right: Role & Company */}
                <div className="job-card-info">
                    <h3 className="job-title">{job.title}</h3>
                    <Link to={`/company/${encodeURIComponent(job.company)}`} className="job-company">
                        {job.company}
                    </Link>
                </div>

                {/* Badge OR Menu */}
                <div className="job-card-actions">
                    <span className={`badge badge-${job.type}`}>
                        {getTypeLabel(job.type)}
                    </span>

                    <button className="btn-icon-more" onClick={toggleMenu}>
                        <MoreVertical size={18} />
                    </button>

                    {showMenu && (
                        <div className="job-card-menu">
                            <button onClick={handleShare} className="menu-item">
                                <Share2 size={14} />
                                Share
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Skills */}
            {displaySkills.length > 0 && (
                <div className="job-skills">
                    {displaySkills.map((skill, index) => (
                        <span key={index} className="skill-chip">{skill}</span>
                    ))}
                </div>
            )}

            {/* Meta: Location, Package, Experience */}
            <div className="job-meta">
                <div className="meta-item">
                    <MapPin size={15} />
                    <span>{job.location}</span>
                </div>
                <div className="meta-item">
                    <span className="meta-label">Package:</span>
                    <span className="meta-value">{job.package} LPA</span>
                </div>
                <div className="meta-item">
                    <span className="meta-label">Exp:</span>
                    <span className="meta-value">
                        {job.experience}
                    </span>
                </div>
            </div>

            {/* Footer */}
            <div className="job-card-footer">
                <div className="job-time">
                    <Clock size={14} />
                    <span>{getTimeAgo(job.createdAt)}</span>
                </div>
                <Link to={`/job/${job._id}`} className="btn btn-primary btn-sm">
                    Apply Now
                </Link>
            </div>
        </div>
    );
}

export default JobCard;
