import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Menu, Trash2, Eye, Building2, MapPin, Briefcase, Clock, ExternalLink, CheckCircle, XCircle, RotateCcw, ArrowLeft } from 'lucide-react';
import api from '../../utils/api';
import './Admin.css';

function ExternalJobsHistory() {
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [activeTab, setActiveTab] = useState('approved');
    const [deleteModal, setDeleteModal] = useState({ show: false, id: null, title: '', action: '' });

    useEffect(() => {
        fetchHistoryJobs();
    }, [activeTab]);

    const fetchHistoryJobs = async () => {
        setLoading(true);
        try {
            // Fetch external jobs with specific status
            const { data } = await api.get(`/external-jobs?status=${activeTab}`);
            setJobs(data.jobs || []);
        } catch (error) {
            console.error('Failed to fetch history jobs:', error);
            setJobs([]);
        } finally {
            setLoading(false);
        }
    };

    const handleRemoveApproved = async (jobId) => {
        if (!window.confirm('Remove this job from approved? It will go back to pending.')) return;
        
        try {
            // Update status back to pending in external DB
            await api.patch(`/external-jobs/${jobId}/status`, { status: 'pending' });
            fetchHistoryJobs();
        } catch (error) {
            console.error('Error removing job:', error);
            alert('Error removing job: ' + (error.response?.data?.message || error.message));
        }
    };

    const handleRestoreDeleted = async (jobId) => {
        if (!window.confirm('Restore this job to pending?')) return;
        
        try {
            await api.patch(`/external-jobs/${jobId}/status`, { status: 'pending' });
            fetchHistoryJobs();
        } catch (error) {
            console.error('Error restoring job:', error);
            alert('Error restoring job. Please try again.');
        }
    };

    const handleApproveDeleted = async (jobId) => {
        if (!window.confirm('Approve this deleted job?')) return;
        
        try {
            await api.patch(`/external-jobs/${jobId}/status`, { status: 'approved' });
            fetchHistoryJobs();
        } catch (error) {
            console.error('Error approving job:', error);
            alert('Error approving job. Please try again.');
        }
    };

    const handlePermanentDelete = async (jobId) => {
        if (!window.confirm('Permanently delete this job? This cannot be undone.')) return;
        
        try {
            const job = jobs.find(j => j._id === jobId);
            if (job && job.internalJobId) {
                await api.delete(`/jobs/${job.internalJobId}`);
            }
            fetchHistoryJobs();
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
                    <Link to="/admin/external-jobs-history" className="nav-item active">
                        External Jobs History
                    </Link>
                    <Link to="/admin/manage-company-logos" className="nav-item">
                        Manage Company Logos
                    </Link>
                    <Link to="/admin/update-company-logo" className="nav-item">
                        Update Company Logo
                    </Link>
                    <Link to="/admin/feedback-stats" className="nav-item">
                        Feedback Stats
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
                            <h1>External Jobs History</h1>
                            <p>Track approved and deleted external jobs.</p>
                        </div>
                    </div>
                </div>

                {/* Filter Tabs */}
                <div className="dashboard-tabs" style={{ marginBottom: '32px' }}>
                    <button 
                        className={`tab-item ${activeTab === 'approved' ? 'active' : ''}`}
                        onClick={() => setActiveTab('approved')}
                    >
                        <CheckCircle size={16} style={{ marginRight: '8px' }} />
                        Approved ({jobs.length})
                    </button>
                    <button 
                        className={`tab-item ${activeTab === 'rejected' ? 'active' : ''}`}
                        onClick={() => setActiveTab('rejected')}
                    >
                        <Trash2 size={16} style={{ marginRight: '8px' }} />
                        Deleted ({jobs.length})
                    </button>
                </div>

                {/* Stats Cards */}
                <div className="stats-grid">
                    <div className="stat-card stat-primary">
                        <div className="stat-icon">
                            <Building2 size={24} />
                        </div>
                        <div className="stat-info">
                            <span className="stat-value">{jobs.length}</span>
                            <span className="stat-title">Total Jobs</span>
                            <span className="stat-desc">{activeTab === 'approved' ? 'Approved' : 'Deleted'}</span>
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
                            <h3>No {activeTab} jobs yet</h3>
                            <p>{activeTab === 'approved' ? 'Approved jobs will appear here.' : 'Deleted jobs will appear here.'}</p>
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
                                                <h3>{job.role}</h3>
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
                                                <span>{Array.isArray(job.location) ? job.location[0] : job.location}</span>
                                            </div>
                                        )}
                                        {job.experience && (
                                            <div className="meta-item">
                                                <Clock size={16} />
                                                <span>{job.experience}</span>
                                            </div>
                                        )}
                                        {job.salary && job.salary !== 'Not specified' && (
                                            <div className="meta-item">
                                                <span className="salary-icon">💰</span>
                                                <span>{job.salary}</span>
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

                                    {/* Status Badge */}
                                    <div style={{ marginTop: '8px', marginBottom: '8px' }}>
                                        <span style={{
                                            display: 'inline-block',
                                            padding: '4px 12px',
                                            background: activeTab === 'approved' ? 'rgba(34, 197, 94, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                                            color: activeTab === 'approved' ? '#16a34a' : '#dc2626',
                                            borderRadius: '50px',
                                            fontSize: '12px',
                                            fontWeight: '600'
                                        }}>
                                            {activeTab === 'approved' ? '✓ Approved' : '✕ Deleted'}
                                        </span>
                                    </div>

                                    {/* Actions */}
                                    <div className="card-actions">
                                        {activeTab === 'approved' && (
                                            <>
                                                {job.apply_link && (
                                                    <a 
                                                        href={job.apply_link} 
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
                                                    onClick={() => handleRemoveApproved(job._id)}
                                                    title="Remove from approved"
                                                >
                                                    <ArrowLeft size={16} />
                                                    Remove
                                                </button>
                                            </>
                                        )}
                                        {activeTab === 'rejected' && (
                                            <>
                                                <button
                                                    className="action-btn approve-btn"
                                                    onClick={() => handleApproveDeleted(job._id)}
                                                    title="Approve this job"
                                                >
                                                    <CheckCircle size={16} />
                                                    Approve
                                                </button>
                                                <button
                                                    className="action-btn restore-btn"
                                                    onClick={() => handleRestoreDeleted(job._id)}
                                                    title="Restore to pending"
                                                >
                                                    <RotateCcw size={16} />
                                                    Restore
                                                </button>
                                            </>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default ExternalJobsHistory;
