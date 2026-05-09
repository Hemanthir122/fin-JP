import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Briefcase, Users, Calendar, Plus, List, TrendingUp, Clock, Menu, ThumbsUp, Search, Filter, Eye, Check, X } from 'lucide-react';

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
    const [activeTab, setActiveTab] = useState('dashboard');
    const [searchQuery, setSearchQuery] = useState('');


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
            title: 'Companies',
            value: stats.totalInternships,
            icon: Users,
            color: 'green',
            description: 'Registered companies'
        },
        {
            title: 'Showing',
            value: stats.totalWalkins,
            icon: Eye,
            color: 'orange',
            description: 'Currently visible listings'
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
                    <Link to="/admin/external-jobs" className="nav-item">
                        External Jobs Database
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
                            <h1>External Job Database</h1>
                            <p>Welcome back! Here's an overview of your job portal.</p>
                        </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <Link to="/admin/post-job" className="btn btn-primary">
                            <Plus size={18} />
                            Post a Job
                        </Link>
                    </div>
                </div>

                {/* Navigation Tabs */}
                <div className="dashboard-tabs">
                    <button 
                        className={`tab-item ${activeTab === 'dashboard' ? 'active' : ''}`}
                        onClick={() => setActiveTab('dashboard')}
                    >
                        Dashboard
                    </button>
                    <button 
                        className={`tab-item ${activeTab === 'postings' ? 'active' : ''}`}
                        onClick={() => setActiveTab('postings')}
                    >
                        Postings
                    </button>
                    <button 
                        className={`tab-item ${activeTab === 'candidates' ? 'active' : ''}`}
                        onClick={() => setActiveTab('candidates')}
                    >
                        Candidates
                    </button>
                    <button 
                        className={`tab-item ${activeTab === 'talent' ? 'active' : ''}`}
                        onClick={() => setActiveTab('talent')}
                    >
                        Talent Pool
                    </button>
                </div>

                {loading ? (
                    <div className="loading-container">
                        <div className="spinner"></div>
                    </div>
                ) : (
                    <>
                        {/* Stats Cards */}
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

                        {/* Search and Filter */}
                        <div className="search-filter-bar">
                            <div className="search-container">
                                <Search size={18} />
                                <input 
                                    type="text" 
                                    placeholder="Search by job title, company, or keywords..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                            <button className="filter-btn">
                                <Filter size={18} />
                                Filter
                            </button>
                            <button className="sort-btn">
                                Newest First
                                <span>▼</span>
                            </button>
                        </div>

                        {/* Jobs List */}
                        <div className="jobs-list-container">
                            {stats.recentJobs.length > 0 ? (
                                stats.recentJobs.map((job) => (
                                    <div key={job._id} className="job-list-item">
                                        <div className="job-icon">
                                            <Briefcase size={24} />
                                        </div>
                                        <div className="job-details">
                                            <h3 className="job-title">{job.title}</h3>
                                            <div className="job-meta-info">
                                                <span className="meta-item">
                                                    📍 {job.location || 'Location not specified'}
                                                </span>
                                                <span className="meta-item">
                                                    💼 {job.experience || 'Experience not specified'}
                                                </span>
                                                <span className="meta-item">
                                                    ⏱️ {job.type || 'Full-Time'}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="job-actions">
                                            <button className="action-btn reject">
                                                <X size={18} />
                                            </button>
                                            <button className="action-btn approve">
                                                <Check size={18} />
                                            </button>
                                            <Link to={`/admin/manage-jobs`} className="action-btn view">
                                                View and Apply
                                            </Link>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="no-jobs-message">
                                    <p>No jobs posted yet</p>
                                </div>
                            )}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}

export default AdminDashboard;
