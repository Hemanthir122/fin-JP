import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ThumbsUp, ThumbsDown, Filter, Menu, Trash2 } from 'lucide-react';
import api from '../../utils/api';
import './Admin.css';

function FeedbackStats() {
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState({
        type: '',
        sortBy: 'usefulCount',
        order: 'desc'
    });
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    // Delete modal state
    const [deleteModal, setDeleteModal] = useState({ show: false, id: null, type: null, title: '' });

    const fetchStats = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (filter.type) params.append('type', filter.type);
            params.append('sortBy', filter.sortBy);
            params.append('order', filter.order);

            const { data } = await api.get(`/jobs/admin/feedback-stats?${params.toString()}`);
            setJobs(data);
        } catch (error) {
            console.error('Failed to fetch feedback stats:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStats();
    }, [filter]);

    const handleFilterChange = (key, value) => {
        setFilter(prev => ({ ...prev, [key]: value }));
    };

    const openDeleteModal = (job) => {
        setDeleteModal({
            show: true,
            id: job._id,
            type: job.type === 'walkin' ? 'walkin' : 'job',
            title: job.title || job.company
        });
    };

    const closeDeleteModal = () => {
        setDeleteModal({ show: false, id: null, type: null, title: '' });
    };

    const confirmDelete = async () => {
        const { id, type } = deleteModal;
        if (!id) return;

        try {
            const endpoint = type === 'walkin' ? `/walkins/${id}` : `/jobs/${id}`;
            await api.delete(endpoint);
            setJobs(jobs.filter(job => job._id !== id));
            closeDeleteModal();
        } catch (error) {
            console.error('Error deleting job:', error);
            alert('Error deleting job. Please try again.');
        }
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
                    <Link to="/admin/feedback-stats" className="nav-item active">
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
                            <h1>Feedback Statistics</h1>
                            <p>View user feedback on job listings to see what's helpful.</p>
                        </div>
                    </div>
                </div>

                {/* Filters */}
                <div className="admin-filters card" style={{ padding: '20px', marginBottom: '24px', display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
                    <div className="filter-group">
                        <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500' }}>Job Type</label>
                        <select
                            value={filter.type}
                            onChange={(e) => handleFilterChange('type', e.target.value)}
                            className="select"
                            style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--border-color)' }}
                        >
                            <option value="">All Types</option>
                            <option value="job">Jobs</option>
                            <option value="internship">Internships</option>
                        </select>
                    </div>

                    <div className="filter-group">
                        <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500' }}>Sort By</label>
                        <select
                            value={filter.sortBy}
                            onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                            className="select"
                            style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--border-color)' }}
                        >
                            <option value="usefulCount">Most Useful</option>
                            <option value="notUsefulCount">Most Not Useful</option>
                        </select>
                    </div>

                    <div className="filter-group">
                        <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500' }}>Order</label>
                        <select
                            value={filter.order}
                            onChange={(e) => handleFilterChange('order', e.target.value)}
                            className="select"
                            style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--border-color)' }}
                        >
                            <option value="desc">Highest First</option>
                            <option value="asc">Lowest First</option>
                        </select>
                    </div>
                </div>

                {/* Stats Table */}
                <div className="admin-table-container card">
                    {loading ? (
                        <div className="loading-container">
                            <div className="spinner"></div>
                        </div>
                    ) : jobs.length === 0 ? (
                        <div className="empty-state" style={{ padding: '60px', textAlign: 'center', color: 'var(--text-muted)' }}>
                            <div style={{ marginBottom: '16px', color: 'var(--border-color)' }}>
                                <ThumbsUp size={48} />
                            </div>
                            <h3>No feedback yet</h3>
                            <p>User ratings will appear here once they interact with job postings.</p>
                        </div>
                    ) : (
                        <table className="admin-table feedback-table">
                            <thead>
                                <tr>
                                    <th style={{ width: '35%' }}>Job Listing</th>
                                    <th>Type</th>
                                    <th className="text-center">Feedback Ratio</th>
                                    <th className="text-center">Votes</th>
                                    <th className="text-center">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {jobs.map((job) => {
                                    const total = (job.usefulCount || 0) + (job.notUsefulCount || 0);
                                    const usefulPercent = total > 0 ? ((job.usefulCount || 0) / total) * 100 : 0;

                                    return (
                                        <tr key={job._id}>
                                            <td>
                                                <div className="job-info-cell">
                                                    <span className="job-title-text">{job.title}</span>
                                                    <span className="job-company-text">{job.company}</span>
                                                </div>
                                            </td>
                                            <td>
                                                <span className={`badge badge-${job.type}`}>
                                                    {job.type === 'internship' ? 'Internship' : 'Full Time'}
                                                </span>
                                            </td>
                                            <td>
                                                <div className="feedback-meter-container">
                                                    <div className="feedback-meter">
                                                        <div
                                                            className="meter-fill"
                                                            style={{ width: `${usefulPercent}%` }}
                                                        ></div>
                                                    </div>
                                                    <div className="feedback-labels">
                                                        <span className="positive">
                                                            <ThumbsUp size={12} /> {job.usefulCount || 0}
                                                        </span>
                                                        <span className="negative">
                                                            {job.notUsefulCount || 0} <ThumbsDown size={12} />
                                                        </span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="text-center">
                                                <span className="total-badge">
                                                    {total}
                                                </span>
                                            </td>
                                            <td className="text-center">
                                                <button
                                                    className="table-btn table-btn-delete"
                                                    onClick={() => openDeleteModal(job)}
                                                    title="Delete Job"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
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
                            This action will permanently remove the job listing and its feedback data.
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

export default FeedbackStats;
