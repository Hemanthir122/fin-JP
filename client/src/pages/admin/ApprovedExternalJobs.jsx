import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Menu, Trash2, Eye, Building2, MapPin, Briefcase, Clock, ExternalLink } from 'lucide-react';
import api from '../../utils/api';
import './Admin.css';

function ApprovedExternalJobs() {
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [deleteModal, setDeleteModal] = useState({ show: false, id: null, title: '' });

    useEffect(() => {
        fetchApprovedJobs();
    }, []);

    const fetchApprovedJobs = async () => {
        setLoading(true);
        try {
            const { data } = await api.get('/jobs?isExternalJob=true&limit=100');
            setJobs(data.jobs || []);
        } catch (error) {
            console.error('Failed to fetch approved external jobs:', error);
        } finally {
            setLoading(false);
        }
    };

    const openDeleteModal = (job) => {
        setDeleteModal({
            show: true,
            id: job._id,
            title: job.title || job.company
        });
    };

    const closeDeleteModal = () => {
        setDeleteModal({ show: false, id: null, title: '' });
    };

    const confirmDelete = async () => {
        const { id } = deleteModal;
        if (!id) return;

        try {
            await api.delete(`/jobs/${id}`);
            setJobs(jobs.filter(job => job._id !== id));
            closeDeleteModal();
        } catch (error) {
            console.error('Error deleting job:', error);
            alert('Error deleting job. Please try again.');
        }
    };

    const formatDate = (date) => {
        return new Date(date).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <div className="admin-page">
            {/* Sidebar */}
            <div className={`admin-sidebar ${isSidebarOpen ? 'show' : ''}`}>
                <div className="admin-logo">
                    <span className="logo-text">Jobs</span>
                    <span className="logo-accent">Connect</span>
                </div>

                <nav className="admin-nav">
                    <Link to="/admin" className="nav-item">
                        Dashboard
                    </Link>
                    <Link to="/admin/post-job" className="nav-item">
                        Post New Job
                    </Link>
                    <Link to="/admin/manage-jobs" className="nav-item">
                        Manage Jobs
                    </Link>
                    <Link to="/admin/external-jobs" className="nav-item">
                        External Jobs Database
                    </Link>
                    <Link to="/admin/update-company-logo" className="nav-item">
                        Update Company Logo
                    </Link>
                    <Link to="/admin/feedback-stats" className="nav-item">
                        Feedback Stats
                    </Link>
                    <Link to="/admin/approved-external-jobs" className="nav-item active">
                        Approved External Jobs
                    </Link>
                </nav>
                <div className="admin-sidebar-footer">
                    <Link to="/" className="nav-item back-link">
                        ← Back to Site
                    </Link>
                </div>
            </div>

            {/* Overlay for mobile sidebar */}
            {isSidebarOpen && (
                <div
                    className="sidebar-overlay"
                    onClick={() => setIsSidebarOpen(false)}
                ></div>
            )}

            {/* Main Content */}
            <div className="admin-content">
                <div className="admin-header">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <button
                            className="mobile-menu-btn"
                            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                        >
                            <Menu size={24} />
                        </button>
                        <div>
                            <h1>Approved External Jobs</h1>
                            <p>Jobs approved from the external database and now posted on the portal.</p>
                        </div>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="stats-grid">
                    <div className="stat-card stat-primary">
                        <div className="stat-icon">
                            <Building2 size={24} />
                        </div>
                        <div className="stat-info">
                            <span className="stat-value">{jobs.length}</span>
                            <span className="stat-title">Posted Jobs</span>
                            <span className="stat-desc">From external sources</span>
                        </div>
                    </div>
                </div>

                {/* Jobs Grid */}
                <div className="approved-jobs-container">
                    {loading ? (
                        <div className="loading-container">
                            <div className="spinner"></div>
                        </div>
                    ) : jobs.length === 0 ? (
                        <div className="empty-state" style={{ padding: '60px', textAlign: 'center', color: 'var(--text-muted)' }}>
                            <div style={{ marginBottom: '16px', color: 'var(--border-color)' }}>
                                <Building2 size={48} />
                            </div>
                            <h3>No approved external jobs yet</h3>
                            <p>Approve jobs from the External Jobs Database to see them here.</p>
                        </div>
                    ) : (
                        <div className="jobs-grid grid grid-3">
                            {jobs.map((job) => (
                                <div key={job._id} className="approved-job-card">
                                    {/* Card Header */}
                                    <div className="card-header">
                                        <div className="company-info">
                                            <div className="company-avatar">
                                                {job.company?.charAt(0).toUpperCase()}
                                            </div>
                                            <div className="company-details">
                                                <h3>{job.title}</h3>
                                                <span className="company-name">{job.company}</span>
                                            </div>
                                        </div>
                                        <span className="external-badge">External</span>
                                    </div>

                                    {/* Meta Info */}
                                    <div className="meta-info">
                                        {job.location && (
                                            <div className="meta-item">
                                                <MapPin size={16} />
                                                <span>{job.location}</span>
                                            </div>
                                        )}
                                        {job.experience && (
                                            <div className="meta-item">
                                                <Clock size={16} />
                                                <span>{job.experience}</span>
                                            </div>
                                        )}
                                        {job.package && job.package !== 'Not specified' && (
                                            <div className="meta-item">
                                                <span className="salary-icon">💰</span>
                                                <span>{job.package}</span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Skills */}
                                    {job.skills && job.skills.length > 0 && (
                                        <div className="skills-section">
                                            {job.skills.slice(0, 3).map((skill, i) => (
                                                <span key={i} className="skill-tag">{skill}</span>
                                            ))}
                                            {job.skills.length > 3 && (
                                                <span className="skill-tag skill-more">+{job.skills.length - 3}</span>
                                            )}
                                        </div>
                                    )}

                                    {/* Posted Date */}
                                    <div className="posted-date">
                                        Posted: {formatDate(job.publishedAt || job.createdAt)}
                                    </div>

                                    {/* Actions */}
                                    <div className="card-actions">
                                        {job.applyLink && (
                                            <a 
                                                href={job.applyLink} 
                                                target="_blank" 
                                                rel="noopener noreferrer" 
                                                className="action-btn view-btn"
                                            >
                                                <ExternalLink size={16} />
                                                View
                                            </a>
                                        )}
                                        <button
                                            className="action-btn delete-btn"
                                            onClick={() => openDeleteModal(job)}
                                            title="Delete Job"
                                        >
                                            <Trash2 size={16} />
                                            Delete
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Delete Confirmation Modal */}
            {deleteModal.show && (
                <div className="modal-overlay" style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(0, 0, 0, 0.5)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1000
                }}>
                    <div className="modal-content" style={{
                        backgroundColor: 'white',
                        padding: '24px',
                        borderRadius: '12px',
                        width: '100%',
                        maxWidth: '400px',
                        boxShadow: '0 10px 25px rgba(0,0,0,0.1)'
                    }}>
                        <h3 style={{ marginTop: 0, marginBottom: '12px', fontSize: '1.2rem' }}>Confirm Deletion</h3>
                        <p style={{ marginBottom: '24px', color: '#666', lineHeight: '1.5' }}>
                            Are you sure you want to delete <strong>"{deleteModal.title}"</strong>?
                            This action will permanently remove the job listing from the portal.
                        </p>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                            <button
                                onClick={closeDeleteModal}
                                style={{
                                    padding: '10px 18px',
                                    border: '1px solid #ddd',
                                    borderRadius: '8px',
                                    background: 'white',
                                    cursor: 'pointer',
                                    fontWeight: '500'
                                }}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmDelete}
                                style={{
                                    padding: '10px 18px',
                                    border: 'none',
                                    borderRadius: '8px',
                                    background: '#ef4444',
                                    color: 'white',
                                    cursor: 'pointer',
                                    fontWeight: '500',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '6px'
                                }}
                            >
                                <Trash2 size={16} /> Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default ApprovedExternalJobs;
