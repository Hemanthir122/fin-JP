import { useState } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Clock, Briefcase, Share2, MoreVertical } from 'lucide-react';
import JobModal from './JobModal';
import './JobCard.css';

function JobCard({ job }) {
    const [showMenu, setShowMenu] = useState(false);
    const [modalOpen, setModalOpen] = useState(false);

    const getTypeLabel = (type) => {
        switch (type) {
            case 'internship': return 'Internship';
            case 'walkin':     return 'Walk-in';
            default:           return 'Full Time';
        }
    };

    const getTimeAgo = (date) => {
        const now = new Date();
        const d = job.publishedAt ? new Date(job.publishedAt) : new Date(date);
        const diffMs = now - d;
        const mins  = Math.floor(diffMs / 60000);
        const hours = Math.floor(diffMs / 3600000);
        const days  = Math.floor(diffMs / 86400000);
        if (mins  < 60)  return `${mins}m ago`;
        if (hours < 24)  return `${hours}h ago`;
        if (days  === 1) return '1d ago';
        if (days  < 7)   return `${days}d ago`;
        if (days  < 30)  return `${Math.floor(days / 7)}w ago`;
        return `${Math.floor(days / 30)}mo ago`;
    };

    const isNew = (() => {
        const d = new Date(job.publishedAt || job.createdAt);
        return (new Date() - d) / 3600000 < 24;
    })();

    const isExpired = job.endDate && new Date(job.endDate) < new Date();

    const handleShare = async (e) => {
        e.preventDefault();
        e.stopPropagation();
        const link = `${window.location.origin}/job/${job._id}`;
        const text = `🚀 ${job.title} at ${job.company}\n📍 ${job.location}\n🔗 ${link}`;
        try {
            if (navigator.share) await navigator.share({ title: job.title, text });
            else { await navigator.clipboard.writeText(text); alert('Copied!'); }
        } catch (err) {
            if (err.name !== 'AbortError') navigator.clipboard.writeText(text);
        }
        setShowMenu(false);
    };

    return (
        <>
        <div
            className={`jc-card ${isExpired ? 'jc-expired' : ''} ${isNew ? 'jc-new' : ''}`}
            onMouseLeave={() => setShowMenu(false)}
            onClick={() => setModalOpen(true)}
            style={{ cursor: 'pointer' }}
        >
            {/* ── Logo ── */}
            <div className="jc-logo">
                {job.companyLogo
                    ? <img src={job.companyLogo} alt={job.company} />
                    : <span className="jc-logo-fallback">{job.company?.charAt(0).toUpperCase()}</span>
                }
            </div>

            {/* ── Body ── */}
            <div className="jc-body">
                {/* Title + type badge */}
                <div className="jc-title-row">
                    <h3 className="jc-title">{job.title}</h3>
                    <span className={`jc-badge jc-badge-type jc-badge-${job.type || 'job'}`}>
                        {getTypeLabel(job.type)}
                    </span>
                    {isNew && <span className="jc-badge jc-badge-new">🔥 New</span>}
                </div>

                {/* Company */}
                <Link
                    to={`/company/${encodeURIComponent(job.company)}`}
                    className="jc-company"
                    onClick={e => e.stopPropagation()}
                >
                    {job.company}
                    <svg className="jc-verified" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                    </svg>
                </Link>

                {/* Meta: location · time · experience */}
                <div className="jc-meta">
                    {job.location && (
                        <span className="jc-meta-item">
                            <MapPin size={13} />
                            {job.location.length > 28 ? job.location.substring(0, 28) + '…' : job.location}
                        </span>
                    )}
                    <span className="jc-meta-item jc-meta-time">
                        <Clock size={13} />
                        {getTimeAgo(job.createdAt)}
                    </span>
                    {job.experience && (
                        <span className="jc-meta-item">
                            <Briefcase size={13} />
                            {job.experience}
                        </span>
                    )}
                </div>
            </div>

            {/* ── Right panel (desktop) ── */}
            <div className="jc-right" onClick={e => e.stopPropagation()}>
                <div className="jc-actions">
                    <button
                        className={`jc-btn-apply ${isExpired ? 'jc-btn-expired' : ''}`}
                        onClick={(e) => { e.stopPropagation(); setModalOpen(true); }}
                    >
                        {isExpired ? 'Expired' : 'Apply Now'}
                    </button>
                    <div className="jc-more-wrap">
                        <button
                            className="jc-btn-more"
                            onClick={(e) => { e.preventDefault(); e.stopPropagation(); setShowMenu(m => !m); }}
                            aria-label="More"
                        >
                            <MoreVertical size={16} />
                        </button>
                        {showMenu && (
                            <div className="jc-dropdown">
                                <button className="jc-dropdown-item" onClick={(e) => { e.stopPropagation(); handleShare(e); }}>
                                    <Share2 size={14} /> Share
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* ── Mobile footer (time · Apply) ── */}
            <div className="jc-mobile-footer" onClick={e => e.stopPropagation()}>
                <span className="jc-mobile-time">
                    <Clock size={12} />
                    {getTimeAgo(job.createdAt)}
                </span>
                <div className="jc-mobile-footer-right">
                    <button
                        className={`jc-btn-apply ${isExpired ? 'jc-btn-expired' : ''}`}
                        onClick={(e) => { e.stopPropagation(); setModalOpen(true); }}
                    >
                        {isExpired ? 'Expired' : 'Apply Now'}
                    </button>
                    <div className="jc-more-wrap">
                        <button
                            className="jc-btn-more"
                            onClick={(e) => { e.preventDefault(); e.stopPropagation(); setShowMenu(m => !m); }}
                            aria-label="More"
                        >
                            <MoreVertical size={16} />
                        </button>
                        {showMenu && (
                            <div className="jc-dropdown jc-dropdown-up">
                                <button className="jc-dropdown-item" onClick={(e) => { e.stopPropagation(); handleShare(e); }}>
                                    <Share2 size={14} /> Share
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>

        {/* Modal */}
        {modalOpen && (
            <JobModal job={job} onClose={() => setModalOpen(false)} />
        )}
        </>
    );
}

export default JobCard;
