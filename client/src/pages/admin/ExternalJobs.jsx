import { useState, useEffect, useCallback } from 'react';
import { Search, Filter, ExternalLink, Database, Users, TrendingUp, CheckCircle, XCircle, MapPin, Briefcase, Building2, Clock, ChevronLeft, ChevronRight, RotateCcw, Layers, Menu, Plus, Eye, Check, X, Globe } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../../utils/api';
import { COUNTRY_LIST } from '../../components/CountryBar';
import { CITY_DATA } from '../../data/cityData';
import './ExternalJobs.css';
import '../admin/Admin.css';

function ExternalJobs() {
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({});
    const [filterOptions, setFilterOptions] = useState({});
    const [filters, setFilters] = useState({
        company: '', location: '', department: '', jobType: '', experience: '', search: '', page: 1
    });
    const [pagination, setPagination] = useState({});
    const [approving, setApproving] = useState({});
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [selectedJobs, setSelectedJobs] = useState(new Set());
    const [bulkAction, setBulkAction] = useState(null);
    const [companyLogos, setCompanyLogos] = useState({});
    // Country / city filter state
    const [selectedCountry, setSelectedCountry] = useState('');
    const [selectedCities, setSelectedCities] = useState([]);
    const [cityDropdownOpen, setCityDropdownOpen] = useState(false);

    useEffect(() => { fetchFilterOptions(); fetchStats(); fetchCompanyLogos(); }, []);
    useEffect(() => { fetchJobs(); }, [filters, selectedCountry, selectedCities]);

    const fetchJobs = async () => {
        try {
            setLoading(true);
            // Build location param: cities take priority over country
            const locationParam = selectedCities.length > 0
                ? selectedCities[0]   // use first selected city for backend regex
                : selectedCountry || filters.location;

            const activeFilters = { ...filters };
            if (locationParam) activeFilters.location = locationParam;

            const params = new URLSearchParams(
                Object.fromEntries(Object.entries(activeFilters).filter(([, v]) => v !== ''))
            );
            const res = await api.get(`/external-jobs?${params}`);
            setJobs(res.data.jobs || []);
            setPagination({ totalPages: res.data.totalPages, currentPage: res.data.currentPage, total: res.data.total });
            setSelectedJobs(new Set());
            setApproving({});
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    };

    const fetchStats = async () => {
        try {
            const res = await api.get('/external-jobs/stats');
            setStats(res.data);
        } catch (e) { console.error(e); }
    };

    const fetchFilterOptions = async () => {
        try {
            const res = await api.get('/external-jobs/filters/options');
            setFilterOptions(res.data);
        } catch (e) { console.error(e); }
    };

    const fetchCompanyLogos = async () => {
        try {
            const res = await api.get('/external-jobs/company-logos/all');
            setCompanyLogos(res.data || {});
        } catch (e) { console.error('Error fetching company logos:', e); }
    };

    const toggleJobSelection = (jobId) => {
        const newSelected = new Set(selectedJobs);
        if (newSelected.has(jobId)) {
            newSelected.delete(jobId);
        } else {
            newSelected.add(jobId);
        }
        setSelectedJobs(newSelected);
    };

    const toggleSelectAll = () => {
        if (selectedJobs.size === jobs.length) {
            setSelectedJobs(new Set());
        } else {
            setSelectedJobs(new Set(jobs.map(j => j._id)));
        }
    };

    const handleBulkApprove = async () => {
        if (selectedJobs.size === 0) return;
        
        setBulkAction('approving');
        let approved = 0;
        let failed = 0;

        for (const jobId of selectedJobs) {
            try {
                await api.patch(`/external-jobs/${jobId}/status`, { status: 'approved', approvedBy: 'Admin' });
                approved++;
            } catch (e) {
                console.error('Error approving job:', e);
                failed++;
            }
        }

        setBulkAction(null);
        setSelectedJobs(new Set());
        fetchJobs();
        alert(`Approved: ${approved}, Failed: ${failed}`);
    };

    const handleBulkDelete = async () => {
        if (selectedJobs.size === 0) return;
        
        if (!window.confirm(`Delete ${selectedJobs.size} jobs? This action cannot be undone.`)) return;

        setBulkAction('deleting');
        let deleted = 0;
        let failed = 0;

        for (const jobId of selectedJobs) {
            try {
                await api.delete(`/jobs/${jobId}`);
                deleted++;
            } catch (e) {
                console.error('Error deleting job:', e);
                failed++;
            }
        }

        setBulkAction(null);
        setSelectedJobs(new Set());
        fetchJobs();
        alert(`Deleted: ${deleted}, Failed: ${failed}`);
    };

    const handleDraft = async (jobId) => {
        setApproving(p => ({ ...p, [jobId]: 'drafting' }));
        try {
            console.log('Drafting job:', jobId);
            const response = await api.patch(`/external-jobs/${jobId}/status`, { status: 'draft', approvedBy: 'Admin' });
            console.log('Draft response:', response.data);
            setApproving(p => ({ ...p, [jobId]: 'drafted' }));
        } catch (e) {
            console.error('Error drafting job:', e);
            alert('Error saving draft: ' + (e.response?.data?.message || e.message));
            setApproving(p => ({ ...p, [jobId]: null }));
        }
    };

    const handleApprove = async (jobId) => {
        setApproving(p => ({ ...p, [jobId]: 'approving' }));
        try {
            console.log('Approving job:', jobId);
            const response = await api.patch(`/external-jobs/${jobId}/status`, { status: 'approved', approvedBy: 'Admin' });
            console.log('Approve response:', response.data);
            setApproving(p => ({ ...p, [jobId]: 'approved' }));
        } catch (e) { 
            console.error('Error approving job:', e);
            alert('Error approving job: ' + (e.response?.data?.message || e.message));
            setApproving(p => ({ ...p, [jobId]: null })); 
        }
    };

    const handleReject = async (jobId) => {
        setApproving(p => ({ ...p, [jobId]: 'rejecting' }));
        try {
            console.log('Rejecting job:', jobId);
            const response = await api.patch(`/external-jobs/${jobId}/status`, { status: 'rejected', approvedBy: 'Admin' });
            console.log('Reject response:', response.data);
            setApproving(p => ({ ...p, [jobId]: 'rejected' }));
        } catch (e) { 
            console.error('Error rejecting job:', e);
            alert('Error rejecting job: ' + (e.response?.data?.message || e.message));
            setApproving(p => ({ ...p, [jobId]: null })); 
        }
    };

    const handleUndo = async (jobId) => {
        setApproving(p => ({ ...p, [jobId]: 'reverting' }));
        try {
            console.log('Reverting job to pending:', jobId);
            await api.patch(`/external-jobs/${jobId}/status`, { status: 'pending' });
            console.log('Job reverted to pending');
            // Refresh the jobs list to show the reverted job (this will also clear approving state)
            await fetchJobs();
        } catch (e) {
            console.error('Error reverting job:', e);
            alert('Error reverting job: ' + (e.response?.data?.message || e.message));
            setApproving(p => ({ ...p, [jobId]: null }));
        }
    };

    const handleDelete = async (jobId) => {
        if (!window.confirm('Delete this job? It will move to the deleted section.')) return;
        
        setApproving(p => ({ ...p, [jobId]: 'deleting' }));
        try {
            console.log('Deleting job:', jobId);
            await api.patch(`/external-jobs/${jobId}/status`, { status: 'rejected' });
            console.log('Job deleted');
            // Refresh the jobs list
            await fetchJobs();
        } catch (e) {
            console.error('Error deleting job:', e);
            alert('Error deleting job: ' + (e.response?.data?.message || e.message));
            setApproving(p => ({ ...p, [jobId]: null }));
        }
    };

    const setFilter = (key, val) => setFilters(f => ({ ...f, [key]: val, page: 1 }));
    const resetFilters = () => {
        setFilters({ company: '', location: '', department: '', jobType: '', experience: '', search: '', page: 1 });
        setSelectedCountry('');
        setSelectedCities([]);
    };
    const activeFiltersCount = Object.entries(filters).filter(([k, v]) => k !== 'page' && v !== '').length
        + (selectedCountry ? 1 : 0)
        + (selectedCities.length > 0 ? 1 : 0);

    // Country selection handler
    const handleCountrySelect = (countryValue) => {
        setSelectedCountry(countryValue);
        setSelectedCities([]);
        setFilters(f => ({ ...f, location: '', page: 1 }));
    };

    // City toggle handler
    const toggleCity = (cityName) => {
        setSelectedCities(prev =>
            prev.includes(cityName) ? prev.filter(c => c !== cityName) : [...prev, cityName]
        );
        setFilters(f => ({ ...f, page: 1 }));
    };

    const availableCities = selectedCountry ? (CITY_DATA[selectedCountry]?.cities || []) : [];

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
                    <Link to="/admin/external-jobs" className="nav-item active">
                        External Jobs Database
                    </Link>
                    <Link to="/admin/external-jobs-history" className="nav-item">
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

            <div className="admin-content">
                {/* Header */}
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
                            <p>Browse, filter and approve jobs from the scraper database</p>
                        </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <Link to="/admin/post-job" className="btn btn-primary">
                            <Plus size={18} />
                            Post a Job
                        </Link>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="stats-grid">
                    <div className="stat-card stat-primary">
                        <div className="stat-icon">
                            <Database size={24} />
                        </div>
                        <div className="stat-info">
                            <span className="stat-value">{stats.totalJobs || 0}</span>
                            <span className="stat-title">Total Jobs</span>
                            <span className="stat-desc">In database</span>
                        </div>
                    </div>
                    <div className="stat-card stat-green">
                        <div className="stat-icon">
                            <Building2 size={24} />
                        </div>
                        <div className="stat-info">
                            <span className="stat-value">{stats.companiesCount || 0}</span>
                            <span className="stat-title">Companies</span>
                            <span className="stat-desc">Registered</span>
                        </div>
                    </div>
                    <div className="stat-card stat-orange">
                        <div className="stat-icon">
                            <Eye size={24} />
                        </div>
                        <div className="stat-info">
                            <span className="stat-value">{pagination.total || 0}</span>
                            <span className="stat-title">Showing</span>
                            <span className="stat-desc">Currently visible</span>
                        </div>
                    </div>
                </div>

                {/* Country Flag Bar */}
                <div className="ej-country-bar">
                    {COUNTRY_LIST.map((c) => (
                        <button
                            key={c.value || 'all'}
                            className={`ej-country-btn ${selectedCountry === c.value ? 'active' : ''}`}
                            onClick={() => handleCountrySelect(c.value)}
                            title={c.value || 'All Countries'}
                        >
                            {c.iso2 ? (
                                <img
                                    src={`https://flagcdn.com/w40/${c.iso2}.png`}
                                    alt={c.label}
                                    className="ej-country-flag-img"
                                    onError={(e) => { e.target.style.display = 'none'; }}
                                />
                            ) : (
                                <Globe size={16} className="ej-country-flag-svg" />
                            )}
                            <span>{c.label}</span>
                        </button>
                    ))}
                </div>

                {/* City multiselect — shown when country selected */}
                {selectedCountry && availableCities.length > 0 && (
                    <div className="ej-city-bar">
                        <div className="ej-city-bar-label">
                            <MapPin size={13} />
                            <span>Cities in {selectedCountry}:</span>
                            {selectedCities.length > 0 && (
                                <button className="ej-city-clear" onClick={() => setSelectedCities([])}>
                                    Clear cities
                                </button>
                            )}
                        </div>
                        <div className="ej-city-list">
                            {availableCities.map(city => (
                                <button
                                    key={city.name}
                                    className={`ej-city-chip ${selectedCities.includes(city.name) ? 'active' : ''}`}
                                    onClick={() => toggleCity(city.name)}
                                >
                                    {selectedCities.includes(city.name) && <Check size={11} />}
                                    {city.name}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Filters */}
                <div className="ej-filters">
                    <div className="ej-filters-top">
                        <div className="ej-filters-title">
                            <Filter size={16} />
                            <span>Filters</span>
                            {activeFiltersCount > 0 && <span className="ej-filter-badge">{activeFiltersCount}</span>}
                        </div>
                        {activeFiltersCount > 0 && (
                            <button className="ej-reset-btn" onClick={resetFilters}>
                                <RotateCcw size={14} /> Reset all
                            </button>
                        )}
                    </div>

                    <div className="ej-filters-grid">
                        <div className="ej-filter-item">
                            <label><Building2 size={13} /> Company</label>
                            <select value={filters.company} onChange={e => setFilter('company', e.target.value)}>
                                <option value="">All Companies</option>
                                {filterOptions.companies?.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                        </div>
                        <div className="ej-filter-item">
                            <label><Layers size={13} /> Department</label>
                            <select value={filters.department} onChange={e => setFilter('department', e.target.value)}>
                                <option value="">All Departments</option>
                                {filterOptions.departments?.map(d => <option key={d} value={d}>{d}</option>)}
                            </select>
                        </div>
                        <div className="ej-filter-item">
                            <label><Briefcase size={13} /> Job Type</label>
                            <select value={filters.jobType} onChange={e => setFilter('jobType', e.target.value)}>
                                <option value="">All Types</option>
                                {filterOptions.jobTypes?.map(t => <option key={t} value={t}>{t}</option>)}
                            </select>
                        </div>
                        <div className="ej-filter-item">
                            <label><Clock size={13} /> Experience</label>
                            <select value={filters.experience} onChange={e => setFilter('experience', e.target.value)}>
                                <option value="">All Experience</option>
                                {filterOptions.experiences?.map(e => <option key={e} value={e}>{e}</option>)}
                            </select>
                        </div>
                        <div className="ej-filter-item ej-filter-search">
                            <label><Search size={13} /> Search</label>
                            <div className="ej-search-wrap">
                                <Search size={15} className="ej-search-icon" />
                                <input
                                    type="text"
                                    placeholder="Search roles, companies..."
                                    value={filters.search}
                                    onChange={e => setFilter('search', e.target.value)}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Results bar */}
                <div className="ej-results-bar">
                    <span><strong>{pagination.total || 0}</strong> jobs found</span>
                    <span>Page {pagination.currentPage || 1} of {pagination.totalPages || 1}</span>
                </div>

                {/* Bulk Actions Bar */}
                {selectedJobs.size > 0 && (
                    <div className="ej-bulk-actions-bar">
                        <div className="ej-bulk-info">
                            <input 
                                type="checkbox" 
                                checked={selectedJobs.size === jobs.length && jobs.length > 0}
                                onChange={toggleSelectAll}
                                className="ej-select-all-checkbox"
                            />
                            <span>{selectedJobs.size} job{selectedJobs.size !== 1 ? 's' : ''} selected</span>
                        </div>
                        <div className="ej-bulk-buttons">
                            <button 
                                className="ej-bulk-btn ej-bulk-approve"
                                onClick={handleBulkApprove}
                                disabled={bulkAction === 'approving'}
                            >
                                <Check size={16} />
                                {bulkAction === 'approving' ? 'Approving...' : 'Approve All'}
                            </button>
                            <button 
                                className="ej-bulk-btn ej-bulk-delete"
                                onClick={handleBulkDelete}
                                disabled={bulkAction === 'deleting'}
                            >
                                <X size={16} />
                                {bulkAction === 'deleting' ? 'Deleting...' : 'Delete All'}
                            </button>
                        </div>
                    </div>
                )}

                {/* Jobs */}
                {loading ? (
                    <div className="ej-loading">
                        <div className="ej-spinner" />
                        <p>Loading jobs...</p>
                    </div>
                ) : jobs.length === 0 ? (
                    <div className="ej-empty">
                        <Database size={52} />
                        <h3>No jobs found</h3>
                        <p>Try adjusting your filters</p>
                    </div>
                ) : (
                    <div className="ej-jobs-grid">
                        {jobs.map(job => {
                            const status = approving[job._id] || job.status;
                            const isSelected = selectedJobs.has(job._id);
                            const showActionButtons = !status || status === 'pending' || status === 'approving' || status === 'rejecting' || status === 'deleting' || status === 'drafting';
                            return (
                                <div key={job._id || job.job_id} className={`ej-card-new ${status === 'approved' ? 'ej-card-approved' : status === 'rejected' ? 'ej-card-rejected' : status === 'drafted' || status === 'draft' ? 'ej-card-drafted' : ''} ${isSelected ? 'ej-card-selected' : ''}`}>
                                    {/* Checkbox */}
                                    <div className="ej-card-checkbox">
                                        <input 
                                            type="checkbox"
                                            checked={isSelected}
                                            onChange={() => toggleJobSelection(job._id)}
                                            className="ej-job-checkbox"
                                        />
                                    </div>

                                    {/* Card Header */}
                                    <div className="ej-card-header-new">
                                        <div className="ej-card-title-section">
                                            <div className="ej-company-avatar-new">
                                                {companyLogos[job.company] ? (
                                                    <img 
                                                        src={companyLogos[job.company]} 
                                                        alt={job.company}
                                                        style={{
                                                            width: '100%',
                                                            height: '100%',
                                                            objectFit: 'contain',
                                                            borderRadius: '12px'
                                                        }}
                                                    />
                                                ) : (
                                                    job.company?.charAt(0).toUpperCase()
                                                )}
                                            </div>
                                            <div className="ej-card-title-info-new">
                                                <h3>{job.role}</h3>
                                                <span className="ej-company-name-new">{job.company}</span>
                                            </div>
                                        </div>
                                        <button className="ej-card-menu">⋯</button>
                                    </div>

                                    {/* Meta Info - Only show if present */}
                                    <div className="ej-meta-info-new">
                                        {job.location && (
                                            <div className="ej-meta-item">
                                                <MapPin size={16} />
                                                <span>
                                                    {(() => {
                                                        const locationText = Array.isArray(job.location) ? job.location[0] : job.location;
                                                        return locationText.length > 40 
                                                            ? locationText.substring(0, 40) + '...' 
                                                            : locationText;
                                                    })()}
                                                </span>
                                            </div>
                                        )}
                                        {job.department && (
                                            <div className="ej-meta-item">
                                                <Layers size={16} />
                                                <span>{job.department}</span>
                                            </div>
                                        )}
                                        {job.experience && (
                                            <div className="ej-meta-item">
                                                <Clock size={16} />
                                                <span>{job.experience}</span>
                                            </div>
                                        )}
                                        {job.salary && (
                                            <div className="ej-meta-item">
                                                <span className="ej-salary-icon">💰</span>
                                                <span>{job.salary}</span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Job Type Badge */}
                                    {job.job_type && (
                                        <div className="ej-job-type-badge">
                                            <Briefcase size={14} />
                                            {job.job_type}
                                        </div>
                                    )}

                                    {/* Skills - Only show if present */}
                                    {job.skills?.length > 0 && (
                                        <div className="ej-skills-new">
                                            {job.skills.slice(0, 4).map((s, i) => <span key={i} className="ej-skill-tag">{s}</span>)}
                                            {job.skills.length > 4 && <span className="ej-skill-tag ej-skill-more">+{job.skills.length - 4}</span>}
                                        </div>
                                    )}

                                    {/* Actions */}
                                    <div className="ej-card-actions-new">
                                        {showActionButtons && (
                                            <>
                                                <button
                                                    className="ej-btn-approve-new"
                                                    onClick={() => handleApprove(job._id)}
                                                    disabled={status === 'approving' || status === 'rejecting' || status === 'deleting' || status === 'drafting'}
                                                >
                                                    <CheckCircle size={16} />
                                                    {status === 'approving' ? 'Approving...' : 'Approve'}
                                                </button>
                                                <button
                                                    className="ej-btn-draft-new"
                                                    onClick={() => handleDraft(job._id)}
                                                    disabled={status === 'approving' || status === 'rejecting' || status === 'deleting' || status === 'drafting'}
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
                                                    {status === 'drafting' ? 'Saving...' : 'Draft'}
                                                </button>
                                                <button
                                                    className="ej-btn-reject-new"
                                                    onClick={() => handleDelete(job._id)}
                                                    disabled={status === 'approving' || status === 'rejecting' || status === 'deleting' || status === 'drafting'}
                                                >
                                                    <XCircle size={16} />
                                                    {status === 'deleting' ? 'Deleting...' : 'Delete'}
                                                </button>
                                            </>
                                        )}
                                        {status === 'approved' && (
                                            <button className="ej-btn-undo-new" onClick={() => handleUndo(job._id)}>
                                                Undo
                                            </button>
                                        )}
                                        {(status === 'drafted' || status === 'draft') && (
                                            <div className="ej-drafted-state">
                                                <span className="ej-drafted-badge">
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
                                                    Saved as Draft — visible in Manage Jobs
                                                </span>
                                                <button className="ej-btn-undo-new" onClick={() => handleUndo(job._id)}>
                                                    Undo
                                                </button>
                                            </div>
                                        )}
                                        {status === 'rejected' && (
                                            <button className="ej-btn-undo-new" onClick={() => handleUndo(job._id)}>
                                                Undo
                                            </button>
                                        )}
                                        {job.apply_link && (
                                            <a href={job.apply_link} target="_blank" rel="noopener noreferrer" className="ej-btn-view-new">
                                                <ExternalLink size={16} />
                                                View and Apply
                                            </a>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* Pagination */}
                {pagination.totalPages > 1 && (
                    <div className="ej-pagination">
                        <button disabled={filters.page <= 1} onClick={() => setFilters(f => ({ ...f, page: f.page - 1 }))} className="ej-page-btn">
                            <ChevronLeft size={18} /> Prev
                        </button>
                        <div className="ej-page-numbers">
                            {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                                const p = Math.max(1, Math.min(pagination.currentPage - 2, pagination.totalPages - 4)) + i;
                                return (
                                    <button key={p} className={`ej-page-num ${p === pagination.currentPage ? 'active' : ''}`}
                                        onClick={() => setFilters(f => ({ ...f, page: p }))}>
                                        {p}
                                    </button>
                                );
                            })}
                        </div>
                        <button disabled={filters.page >= pagination.totalPages} onClick={() => setFilters(f => ({ ...f, page: f.page + 1 }))} className="ej-page-btn">
                            Next <ChevronRight size={18} />
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}

export default ExternalJobs;
