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


    useEffect(() => {
        fetchJobs();
    }, []);

    const fetchJobs = async () => {
        try {
            const response = await api.get('/jobs', { params: { limit: 100 } });
            setJobs(response.data.jobs);
        } catch (error) {
            console.error('Error fetching jobs:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this job?')) {
            try {
                await api.delete(`/jobs/${id}`);
                setJobs(jobs.filter(job => job._id !== id));
            } catch (error) {
                console.error('Error deleting job:', error);
                alert('Error deleting job. Please try again.');
            }
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
                return 'Walk-in';
            default:
                return 'Full Time';
        }
    };

    const filteredJobs = jobs.filter(job => {
        const matchesSearch = job.title.toLowerCase().includes(search.toLowerCase()) ||
            job.company.toLowerCase().includes(search.toLowerCase());
        const matchesType = !typeFilter || job.type === typeFilter;
        return matchesSearch && matchesType;
    });

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
                                <option value="walkin">Walk-ins</option>
                            </select>
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
                                        <th>Job Title</th>
                                        <th>Company</th>
                                        <th>Location</th>
                                        <th>Type</th>
                                        <th>Posted</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredJobs.map((job) => (
                                        <tr key={job._id}>
                                            <td>
                                                <strong>{job.title}</strong>
                                            </td>
                                            <td>{job.company}</td>
                                            <td>{job.location}</td>
                                            <td>
                                                <span className={`badge badge-${job.type}`}>
                                                    {getTypeLabel(job.type)}
                                                </span>
                                            </td>
                                            <td>{formatDate(job.createdAt)}</td>
                                            <td>
                                                <div className="table-actions">
                                                    <Link
                                                        to={`/job/${job._id}`}
                                                        target="_blank"
                                                        className="table-btn table-btn-edit"
                                                    >
                                                        <Eye size={14} />
                                                    </Link>
                                                    <Link
                                                        to={`/admin/edit-job/${job._id}`}
                                                        className="table-btn table-btn-edit"
                                                    >
                                                        <Edit size={14} />
                                                    </Link>
                                                    <button
                                                        className="table-btn table-btn-delete"
                                                        onClick={() => handleDelete(job._id)}
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
        </div>
    );
}

export default ManageJobs;
