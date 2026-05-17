import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { X, MapPin, Clock, Briefcase, Building2, Calendar, ChevronDown, ChevronUp, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';
import './JobModal.css';

function JobModal({ job, onClose }) {
    const [descExpanded, setDescExpanded] = useState(false);
    const overlayRef = useRef(null);

    // Close on Escape
    useEffect(() => {
        const handler = (e) => { if (e.key === 'Escape') onClose(); };
        document.addEventListener('keydown', handler);
        document.body.style.overflow = 'hidden';
        return () => {
            document.removeEventListener('keydown', handler);
            document.body.style.overflow = '';
        };
    }, [onClose]);

    const getTypeLabel = (type) => {
        switch (type) {
            case 'internship': return 'Internship';
            case 'walkin':     return 'Walk-in';
            default:           return 'Full Time';
        }
    };

    const formatDate = (date) => {
        if (!date) return '—';
        return new Date(date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    };

    const handleApply = () => {
        // Fire smartlink every 3rd apply click (shared counter across modal + detail page)
        const count = parseInt(sessionStorage.getItem('job_apply_count') || '0') + 1;
        sessionStorage.setItem('job_apply_count', count.toString());
        if (count % 3 === 0) {
            window.open('https://breachuptown.com/jnv7mma2?key=d47de908fdd389381c8131eaa2a36085', '_blank', 'noopener,noreferrer');
        }
        if (job.applyLink && job.applyLink !== '#') {
            setTimeout(() => window.open(job.applyLink, '_blank'), 300);
        }
        onClose();
    };

    const shortDesc = job.description
        ? job.description.substring(0, 220) + (job.description.length > 220 ? '…' : '')
        : null;

    return createPortal(
        <div
            className="jm-overlay"
            ref={overlayRef}
            onClick={(e) => { if (e.target === overlayRef.current) onClose(); }}
        >
            <div className="jm-modal" role="dialog" aria-modal="true" aria-label={job.title}>

                {/* ── Header ── */}
                <div className="jm-header">
                    <div className="jm-header-left">
                        <div className="jm-logo">
                            {job.companyLogo
                                ? <img src={job.companyLogo} alt={job.company} />
                                : <span className="jm-logo-fallback">{job.company?.charAt(0).toUpperCase()}</span>
                            }
                        </div>
                        <div>
                            <h2 className="jm-title">{job.title}</h2>
                            <div className="jm-company-row">
                                <Link
                                    to={`/company/${encodeURIComponent(job.company)}`}
                                    className="jm-company"
                                    onClick={onClose}
                                >
                                    {job.company}
                                </Link>
                                <svg className="jm-verified" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                                </svg>
                            </div>
                        </div>
                    </div>
                    <button className="jm-close" onClick={onClose} aria-label="Close">
                        <X size={20} />
                    </button>
                </div>

                {/* ── Scrollable body ── */}
                <div className="jm-body">

                    {/* Job Overview grid */}
                    <section className="jm-section">
                        <div className="jm-section-title">
                            <Building2 size={16} />
                            Job Overview
                        </div>
                        <div className="jm-overview-grid">
                            <div className="jm-overview-item">
                                <span className="jm-ov-label">
                                    <Briefcase size={14} className="jm-ov-icon jm-ov-blue" />
                                    Job Type
                                </span>
                                <span className="jm-ov-value">{getTypeLabel(job.type)}</span>
                            </div>
                            {job.location && (
                                <div className="jm-overview-item">
                                    <span className="jm-ov-label">
                                        <MapPin size={14} className="jm-ov-icon jm-ov-red" />
                                        Location
                                    </span>
                                    <span className="jm-ov-value">{job.location}</span>
                                </div>
                            )}
                            {job.experience && (
                                <div className="jm-overview-item">
                                    <span className="jm-ov-label">
                                        <svg className="jm-ov-icon jm-ov-orange" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>
                                        Experience
                                    </span>
                                    <span className="jm-ov-value">{job.experience}</span>
                                </div>
                            )}
                            {job.package && (
                                <div className="jm-overview-item">
                                    <span className="jm-ov-label">
                                        <svg className="jm-ov-icon jm-ov-green" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
                                        Package
                                    </span>
                                    <span className="jm-ov-value jm-ov-highlight">
                                        {job.package}{job.type === 'internship' ? '/mo' : ' LPA'}
                                    </span>
                                </div>
                            )}
                            <div className="jm-overview-item">
                                <span className="jm-ov-label">
                                    <Calendar size={14} className="jm-ov-icon jm-ov-purple" />
                                    Posted On
                                </span>
                                <span className="jm-ov-value">{formatDate(job.publishedAt || job.createdAt)}</span>
                            </div>
                            {job.batch && (
                                <div className="jm-overview-item">
                                    <span className="jm-ov-label">
                                        <Clock size={14} className="jm-ov-icon jm-ov-blue" />
                                        Batch
                                    </span>
                                    <span className="jm-ov-value">{job.batch}</span>
                                </div>
                            )}
                        </div>
                    </section>

                    {/* About the Role */}
                    {job.description && (
                        <section className="jm-section">
                            <div className="jm-section-title">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                                About the Role
                            </div>
                            <p className="jm-desc">
                                {descExpanded ? job.description : shortDesc}
                            </p>
                            {job.description.length > 220 && (
                                <button
                                    className="jm-show-more"
                                    onClick={() => setDescExpanded(e => !e)}
                                >
                                    {descExpanded ? (
                                        <><ChevronUp size={14} /> Show less</>
                                    ) : (
                                        <><ChevronDown size={14} /> Show more</>
                                    )}
                                </button>
                            )}
                        </section>
                    )}

                    {/* Skills */}
                    {job.skills?.length > 0 && (
                        <section className="jm-section">
                            <div className="jm-section-title">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"/><path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83"/></svg>
                                Skills <span className="jm-section-sub">(Preferred)</span>
                            </div>
                            <div className="jm-skills">
                                {job.skills.slice(0, 8).map((s, i) => (
                                    <span key={i} className="jm-skill">{s}</span>
                                ))}
                                {job.skills.length > 8 && (
                                    <span className="jm-skill jm-skill-more">+{job.skills.length - 8} more</span>
                                )}
                            </div>
                        </section>
                    )}

                    {/* ── Similar Opportunities smartlink banner ── */}
                    <a
                        href="https://breachuptown.com/jnv7mma2?key=d47de908fdd389381c8131eaa2a36085"
                        className="jm-similar-banner"
                        target="_blank"
                        rel="noopener noreferrer nofollow"
                        onClick={(e) => { e.preventDefault(); window.open('https://breachuptown.com/jnv7mma2?key=d47de908fdd389381c8131eaa2a36085', '_blank', 'noopener,noreferrer'); }}
                    >
                        <span className="jm-similar-icon">🚀</span>
                        <div className="jm-similar-text">
                            <strong>Explore Similar Opportunities</strong>
                            <span>Thousands of jobs matching your profile</span>
                        </div>
                        <span className="jm-similar-arrow">→</span>
                    </a>

                </div>

                {/* ── Footer ── */}
                <div className="jm-footer">
                    <button className="jm-btn-close" onClick={onClose}>
                        Close
                    </button>
                    <button className="jm-btn-apply" onClick={handleApply}>
                        Continue Applying
                        <ExternalLink size={16} />
                    </button>
                </div>
            </div>
        </div>
    , document.body);
}

export default JobModal;
