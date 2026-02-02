import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, Edit, Trash2, Eye, Menu } from 'lucide-react';

import api from '../../utils/api';
import './Admin.css';

function ManageJobs() {
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [typeFilter, setTypeFilter] = useState('');
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    // Add selection and bulk loading state
    const [selectedKeys, setSelectedKeys] = useState(new Set());
    const [bulkLoading, setBulkLoading] = useState(false);


    useEffect(() => {
        fetchJobs();
    }, []);

    const fetchJobs = async () => {
        try {
            const [jobsRes, walkinsRes] = await Promise.all([
                api.get('/jobs', { params: { limit: 100, status: 'all' } }),
                api.get('/walkins', { params: { limit: 100, status: 'all' } })
            ]);

            const jobsList = jobsRes.data.jobs.map(j => ({ ...j, model: 'job' }));
            const walkinsList = walkinsRes.data.walkins.map(w => ({ ...w, type: 'walkin', model: 'walkin' }));

            // Sort by createdAt desc
            const allJobs = [...jobsList, ...walkinsList].sort((a, b) =>
                new Date(b.createdAt) - new Date(a.createdAt)
            );

            setJobs(allJobs);
        } catch (error) {
            console.error('Error fetching jobs:', error);
        } finally {
            setLoading(false);
        }
    };

    // Helpers for selection
    const keyFor = (item) => `${item.model}:${item._id}`;
    const isSelected = (item) => selectedKeys.has(keyFor(item));
    const toggleSelect = (item) => {
        setSelectedKeys(prev => {
            const next = new Set(prev);
            const key = keyFor(item);
            if (next.has(key)) {
                next.delete(key);
            } else {
                next.add(key);
            }
            return next;
        });
    };

    const clearSelection = () => setSelectedKeys(new Set());

    // Bulk actions
    const performBulkStatusUpdate = async (newStatus) => {
        const items = jobs.filter(j => selectedKeys.has(keyFor(j)));
        if (items.length === 0) return;
        setBulkLoading(true);
        try {
            await Promise.all(items.map(item => {
                const endpoint = item.model === 'walkin' ? `/walkins/${item._id}` : `/jobs/${item._id}`;
                return api.put(endpoint, { status: newStatus });
            }));
            await fetchJobs();
            clearSelection();
            alert(`${newStatus === 'published' ? 'Published' : 'Moved to draft'} ${items.length} item(s)`);
        } catch (e) {
            console.error('Bulk status update error:', e);
            alert('Error performing bulk status update. Some items may not be updated.');
        } finally {
            setBulkLoading(false);
        }
    };

    const bulkPublish = () => performBulkStatusUpdate('published');
    const bulkDraft = () => performBulkStatusUpdate('draft');

    const bulkDelete = async () => {
        const items = jobs.filter(j => selectedKeys.has(keyFor(j)));
        if (items.length === 0) return;
        if (!window.confirm(`Delete ${items.length} selected item(s)? This action cannot be undone.`)) return;
        setBulkLoading(true);
        try {
            await Promise.all(items.map(item => {
                const endpoint = item.model === 'walkin' ? `/walkins/${item._id}` : `/jobs/${item._id}`;
                return api.delete(endpoint);
            }));
            await fetchJobs();
            clearSelection();
            alert(`Deleted ${items.length} item(s)`);
        } catch (e) {
            console.error('Bulk delete error:', e);
            alert('Error deleting selected items. Some items may not be deleted.');
        } finally {
            setBulkLoading(false);
        }
    };

    const [deleteModal, setDeleteModal] = useState({ show: false, id: null, type: null });

    const openDeleteModal = (id, type) => {
        setDeleteModal({ show: true, id, type });
    };

    const closeDeleteModal = () => {
        setDeleteModal({ show: false, id: null, type: null });
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

    const formatDate = (date) => {
        return new Date(date).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    };

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

    const filteredJobs = jobs.filter(job => {
        const titleMatch = (job.title || '').toLowerCase().includes(search.toLowerCase());
        const companyMatch = (job.company || '').toLowerCase().includes(search.toLowerCase());
        const matchesSearch = titleMatch || companyMatch;
        const matchesType = !typeFilter || job.type === typeFilter;
        return matchesSearch && matchesType;
    });

    const allSelected = filteredJobs.length > 0 && filteredJobs.every(isSelected);

    return (
        <div className="admin-page">
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
                    <Link to="/admin/manage-jobs" className="nav-item active">
                        Manage Jobs
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
                            <h1>Manage Jobs</h1>
                            <p>View, edit, and delete job listings</p>
                        </div>
                    </div>

                    <Link to="/admin/post-job" className="btn btn-primary">
                        Post New Job
                    </Link>
                </div>

                <div className="admin-card">
                    <div className="card-header" style={{ borderBottom: 'none', paddingBottom: 0 }}>
                        <div className="flex gap-2" style={{ flex: 1 }}>
                            <div style={{ position: 'relative', flex: 1, maxWidth: '400px' }}>
                                <Search size={18} style={{
                                    position: 'absolute',
                                    left: '14px',
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    color: 'var(--text-muted)'
                                }} />
                                <input
                                    type="text"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    placeholder="Search jobs..."
                                    className="input"
                                    style={{ paddingLeft: '42px' }}
                                />
                            </div>
                            <select
                                value={typeFilter}
                                onChange={(e) => setTypeFilter(e.target.value)}
                                className="select"
                                style={{ width: '180px' }}
                            >
                                <option value="">All Types</option>
                                <option value="job">Full Time Jobs</option>
                                <option value="internship">Internships</option>
                                <option value="walkin">Walk-in/Email</option>
                            </select>
                        </div>
                    </div>

                    {/* Bulk Actions Bar */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', borderTop: '1px solid #eee' }}>
                        <div style={{ color: 'var(--text-muted)' }}>
                            Selected: {selectedKeys.size}
                        </div>
                        <div style={{ display: 'flex', gap: '8px' }}>
                            <button
                                className="btn"
                                disabled={selectedKeys.size === 0 || bulkLoading}
                                onClick={bulkPublish}
                                style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid #ddd', background: '#fff', cursor: selectedKeys.size === 0 || bulkLoading ? 'not-allowed' : 'pointer' }}
                            >
                                Publish
                            </button>
                            <button
                                className="btn"
                                disabled={selectedKeys.size === 0 || bulkLoading}
                                onClick={bulkDraft}
                                style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid #ddd', background: '#fff', cursor: selectedKeys.size === 0 || bulkLoading ? 'not-allowed' : 'pointer' }}
                            >
                                Move to Draft
                            </button>
                            <button
                                className="btn"
                                disabled={selectedKeys.size === 0 || bulkLoading}
                                onClick={bulkDelete}
                                style={{ padding: '8px 12px', borderRadius: '6px', border: 'none', background: '#ef4444', color: '#fff', cursor: selectedKeys.size === 0 || bulkLoading ? 'not-allowed' : 'pointer' }}
                            >
                                Delete
                            </button>
                        </div>
                    </div>

                    {loading ? (
                        <div className="loading-container">
                            <div className="spinner"></div>
                        </div>
                    ) : filteredJobs.length > 0 ? (
                        <div className="jobs-table-container">
                            <table className="jobs-table">
                                <thead>
                                    <tr>
                                        <th style={{ width: '40px' }}>
                                            <input
                                                type="checkbox"
                                                checked={allSelected}
                                                onChange={(e) => {
                                                    const checked = e.target.checked;
                                                    setSelectedKeys(prev => {
                                                        const next = new Set(prev);
                                                        if (checked) {
                                                            filteredJobs.forEach(item => next.add(keyFor(item)));
                                                        } else {
                                                            filteredJobs.forEach(item => next.delete(keyFor(item)));
                                                        }
                                                        return next;
                                                    });
                                                }}
                                            />
                                        </th>
                                        <th>Job Title</th>
                                        <th>Company</th>
                                        <th>Location</th>
                                        <th>Type</th>
                                        <th>Status</th>
                                        <th>Posted</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredJobs.map((job) => (
                                        <tr key={job._id}>
                                            <td>
                                                <input
                                                    type="checkbox"
                                                    checked={isSelected(job)}
                                                    onChange={() => toggleSelect(job)}
                                                />
                                            </td>
                                            <td>
                                                <strong>{job.type === 'walkin' ? (job.title || job.company) : job.title}</strong>
                                            </td>
                                            <td>{job.company}</td>
                                            <td>{job.location || (job.type === 'walkin' ? 'N/A' : '-')}</td>
                                            <td>
                                                <span className={`badge badge-${job.type}`}>
                                                    {getTypeLabel(job.type)}
                                                </span>
                                            </td>
                                            <td>
                                                <span
                                                    className="badge"
                                                    style={{
                                                        background: job.status === 'draft' ? '#e0e0e0' : 'var(--accent-green)',
                                                        color: job.status === 'draft' ? '#333' : '#fff',
                                                        padding: '4px 8px',
                                                        borderRadius: '4px',
                                                        fontSize: '12px'
                                                    }}
                                                >
                                                    {job.status === 'draft' ? 'Draft' : 'Published'}
                                                </span>
                                            </td>
                                            <td>{formatDate(job.createdAt)}</td>
                                            <td>
                                                <div className="table-actions">
                                                    <Link
                                                        to={`/job/${job._id}?type=${job.type}&view=admin`}
                                                        target="_blank"
                                                        className="table-btn table-btn-edit"
                                                    >
                                                        <Eye size={14} />
                                                    </Link>
                                                    <Link
                                                        to={`/admin/edit-job/${job._id}?type=${job.type}`}
                                                        className="table-btn table-btn-edit"
                                                    >
                                                        <Edit size={14} />
                                                    </Link>
                                                    <button
                                                        className="table-btn table-btn-delete"
                                                        onClick={() => openDeleteModal(job._id, job.type)}
                                                    >
                                                        <Trash2 size={14} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="no-data" style={{ padding: '60px' }}>
                            <p>No jobs found</p>
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
                        borderRadius: '8px',
                        width: '100%',
                        maxWidth: '400px',
                        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
                    }}>
                        <h3 style={{ marginTop: 0, marginBottom: '16px' }}>Confirm Delete</h3>
                        <p style={{ marginBottom: '24px', color: '#666' }}>
                            Are you sure you want to delete this job listing? This action cannot be undone.
                        </p>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                            <button
                                onClick={closeDeleteModal}
                                style={{
                                    padding: '8px 16px',
                                    border: '1px solid #ddd',
                                    borderRadius: '4px',
                                    background: 'white',
                                    cursor: 'pointer'
                                }}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmDelete}
                                style={{
                                    padding: '8px 16px',
                                    border: 'none',
                                    borderRadius: '4px',
                                    background: '#ef4444',
                                    color: 'white',
                                    cursor: 'pointer'
                                }}
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default ManageJobs;
