import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Briefcase, Users, Calendar, Plus, List, TrendingUp, Clock, Menu, ThumbsUp } from 'lucide-react';

import api from '../../utils/api';
import './Admin.css';

function AdminDashboard() {
    const [stats, setStats] = useState({
        totalJobs: 0,
        totalInternships: 0,
        totalWalkins: 0,
        totalAll: 0,
        recentJobs: []
    });
    const [loading, setLoading] = useState(true);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);


    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            const response = await api.get('/stats');
            setStats(response.data);
        } catch (error) {
            console.error('Error fetching stats:', error);
        } finally {
            setLoading(false);
        }
    };

    const statCards = [
        {
            title: 'Total Jobs',
            value: stats.totalJobs,
            icon: Briefcase,
            color: 'primary',
            description: 'Active full-time positions'
        },
        {
            title: 'Internships',
            value: stats.totalInternships,
            icon: Users,
            color: 'green',
            description: 'Active internship openings'
        },
        {
            title: 'Walk-ins',
            value: stats.totalWalkins,
            icon: Calendar,
            color: 'orange',
            description: 'Active walk-in interviews'
        },
        {
            title: 'Total Listings',
            value: stats.totalAll,
            icon: TrendingUp,
            color: 'purple',
            description: 'All active job listings'
        }
    ];

    const formatDate = (date) => {
        return new Date(date).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <div className="admin-page">
            <div className={`admin-sidebar ${isSidebarOpen ? 'show' : ''}`}>
                <div className="admin-logo">
                    <span className="logo-text">Jobs</span>
                    <span className="logo-accent">Connect</span>
                </div>

                <nav className="admin-nav">
                    <Link to="/admin" className="nav-item active">
                        Dashboard
                    </Link>
                    <Link to="/admin/post-job" className="nav-item">
                        Post New Job
                    </Link>
                    <Link to="/admin/manage-jobs" className="nav-item">
                        Manage Jobs
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
                            <h1>Dashboard</h1>
                            <p>Welcome back! Here's an overview of your job portal.</p>
                        </div>
                    </div>

                    <Link to="/admin/post-job" className="btn btn-primary">
                        <Plus size={18} />
                        Post New Job
                    </Link>
                </div>

                {loading ? (
                    <div className="loading-container">
                        <div className="spinner"></div>
                    </div>
                ) : (
                    <>
                        <div className="stats-grid">
                            {statCards.map((stat, index) => (
                                <div key={index} className={`stat-card stat-${stat.color}`}>
                                    <div className="stat-icon">
                                        <stat.icon size={24} />
                                    </div>
                                    <div className="stat-info">
                                        <span className="stat-value">{stat.value}</span>
                                        <span className="stat-title">{stat.title}</span>
                                        <span className="stat-desc">{stat.description}</span>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="admin-grid">
                            <div className="admin-card">
                                <div className="card-header">
                                    <h2>
                                        <Clock size={20} />
                                        Recent Jobs
                                    </h2>
                                    <Link to="/admin/manage-jobs" className="view-all">
                                        View All
                                    </Link>
                                </div>
                                <div className="recent-jobs-list">
                                    {stats.recentJobs.length > 0 ? (
                                        stats.recentJobs.map((job) => (
                                            <div key={job._id} className="recent-job-item">
                                                <div className="job-info">
                                                    <span className="job-title">{job.title}</span>
                                                    <span className="job-company">{job.company}</span>
                                                </div>
                                                <div className="job-meta">
                                                    <span className={`badge badge-${job.type}`}>
                                                        {job.type}
                                                    </span>
                                                    <span className="job-date">{formatDate(job.createdAt)}</span>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <p className="no-data">No jobs posted yet</p>
                                    )}
                                </div>
                            </div>

                            <div className="admin-card">
                                <div className="card-header">
                                    <h2>
                                        <List size={20} />
                                        Quick Actions
                                    </h2>
                                </div>
                                <div className="quick-actions">
                                    <Link to="/admin/post-job" className="quick-action">
                                        <Plus size={20} />
                                        <span>Post a new job listing</span>
                                    </Link>
                                    <Link to="/admin/manage-jobs" className="quick-action">
                                        <List size={20} />
                                        <span>Manage existing jobs</span>
                                    </Link>
                                    <Link to="/jobs" target="_blank" className="quick-action">
                                        <Briefcase size={20} />
                                        <span>View public job page</span>
                                    </Link>
                                    <Link to="/admin/feedback-stats" className="quick-action">
                                        <ThumbsUp size={20} />
                                        <span>View feedback statistics</span>
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}

export default AdminDashboard;
