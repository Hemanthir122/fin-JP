import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Menu, Upload, Save, X, Building2, Search } from 'lucide-react';
import api from '../../utils/api';
import './Admin.css';

function ManageCompanyLogos() {
    const [companies, setCompanies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [editingId, setEditingId] = useState(null);
    const [logoUrl, setLogoUrl] = useState('');
    const [saving, setSaving] = useState({});

    useEffect(() => {
        fetchCompanies();
    }, []);

    const fetchCompanies = async () => {
        try {
            setLoading(true);
            const res = await api.get('/external-jobs/filters/options');
            const uniqueCompanies = res.data.companies || [];
            
            // Fetch all logos from external DB
            const logosRes = await api.get('/external-jobs/company-logos/all');
            const logosMap = logosRes.data || {};
            
            // Map companies with their logos
            setCompanies(uniqueCompanies.map(name => ({ 
                name, 
                logo: logosMap[name] || '' 
            })));
        } catch (e) {
            console.error('Error fetching companies:', e);
        } finally {
            setLoading(false);
        }
    };

    const filteredCompanies = companies.filter(c =>
        c.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleEditLogo = (company) => {
        setEditingId(company.name);
        setLogoUrl(company.logo || '');
    };

    const handleSaveLogo = async (companyName) => {
        setSaving(p => ({ ...p, [companyName]: true }));
        try {
            // Save to external DB
            await api.post('/external-jobs/company-logos', {
                company: companyName,
                logo: logoUrl
            });
            
            // Update local state
            setCompanies(prev => prev.map(c =>
                c.name === companyName ? { ...c, logo: logoUrl } : c
            ));
            
            setEditingId(null);
            setLogoUrl('');
            alert('Logo saved successfully!');
        } catch (e) {
            console.error('Error saving logo:', e);
            alert('Error saving logo: ' + (e.response?.data?.message || e.message));
        } finally {
            setSaving(p => ({ ...p, [companyName]: false }));
        }
    };

    const handleCancel = () => {
        setEditingId(null);
        setLogoUrl('');
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
                    <Link to="/admin/external-jobs-history" className="nav-item">
                        External Jobs History
                    </Link>
                    <Link to="/admin/manage-company-logos" className="nav-item active">
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
                            <h1>Manage Company Logos</h1>
                            <p>Add or update logos for companies in the external jobs database</p>
                        </div>
                    </div>
                </div>

                {/* Search Bar */}
                <div style={{ marginBottom: '24px' }}>
                    <div style={{ position: 'relative' }}>
                        <Search size={18} style={{
                            position: 'absolute',
                            left: '12px',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            color: '#94a3b8',
                            pointerEvents: 'none'
                        }} />
                        <input
                            type="text"
                            placeholder="Search companies..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            style={{
                                width: '100%',
                                padding: '12px 12px 12px 40px',
                                border: '1.5px solid #e2e8f0',
                                borderRadius: '10px',
                                fontSize: '0.875rem',
                                outline: 'none'
                            }}
                        />
                    </div>
                </div>

                {/* Companies Grid */}
                {loading ? (
                    <div style={{ textAlign: 'center', padding: '60px 20px', color: '#94a3b8' }}>
                        <div style={{
                            width: '40px',
                            height: '40px',
                            border: '3px solid #e2e8f0',
                            borderTopColor: '#3b82f6',
                            borderRadius: '50%',
                            animation: 'spin 0.7s linear infinite',
                            margin: '0 auto 16px'
                        }} />
                        <p>Loading companies...</p>
                    </div>
                ) : filteredCompanies.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '60px 20px', color: '#94a3b8' }}>
                        <Building2 size={48} style={{ margin: '0 auto 16px', opacity: 0.3 }} />
                        <h3 style={{ color: '#374151', margin: '0 0 8px' }}>No companies found</h3>
                        <p style={{ margin: 0 }}>Try adjusting your search</p>
                    </div>
                ) : (
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                        gap: '20px'
                    }}>
                        {filteredCompanies.map((company) => (
                            <div key={company.name} style={{
                                background: 'white',
                                border: '1px solid #e5e7eb',
                                borderRadius: '12px',
                                padding: '20px',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '16px'
                            }}>
                                {/* Company Name */}
                                <div>
                                    <h3 style={{
                                        fontSize: '1rem',
                                        fontWeight: '700',
                                        color: '#1f2937',
                                        margin: '0 0 8px'
                                    }}>
                                        {company.name}
                                    </h3>
                                </div>

                                {/* Logo Preview */}
                                <div style={{
                                    width: '100%',
                                    height: '120px',
                                    background: '#f9fafb',
                                    border: '2px dashed #e5e7eb',
                                    borderRadius: '8px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    overflow: 'hidden'
                                }}>
                                    {editingId === company.name ? (
                                        <input
                                            type="text"
                                            placeholder="Enter logo URL"
                                            value={logoUrl}
                                            onChange={(e) => setLogoUrl(e.target.value)}
                                            style={{
                                                width: '100%',
                                                height: '100%',
                                                border: 'none',
                                                padding: '12px',
                                                fontSize: '0.875rem',
                                                outline: 'none'
                                            }}
                                        />
                                    ) : company.logo ? (
                                        <img
                                            src={company.logo}
                                            alt={company.name}
                                            style={{
                                                maxWidth: '100%',
                                                maxHeight: '100%',
                                                objectFit: 'contain'
                                            }}
                                        />
                                    ) : (
                                        <div style={{
                                            textAlign: 'center',
                                            color: '#9ca3af'
                                        }}>
                                            <Building2 size={32} style={{ margin: '0 auto 8px' }} />
                                            <p style={{ margin: 0, fontSize: '0.875rem' }}>No logo</p>
                                        </div>
                                    )}
                                </div>

                                {/* Actions */}
                                <div style={{
                                    display: 'flex',
                                    gap: '10px'
                                }}>
                                    {editingId === company.name ? (
                                        <>
                                            <button
                                                onClick={() => handleSaveLogo(company.name)}
                                                disabled={saving[company.name]}
                                                style={{
                                                    flex: 1,
                                                    padding: '10px 16px',
                                                    background: '#10b981',
                                                    color: 'white',
                                                    border: 'none',
                                                    borderRadius: '8px',
                                                    fontSize: '0.85rem',
                                                    fontWeight: '600',
                                                    cursor: 'pointer',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    gap: '6px',
                                                    opacity: saving[company.name] ? 0.6 : 1
                                                }}
                                            >
                                                <Save size={16} />
                                                {saving[company.name] ? 'Saving...' : 'Save'}
                                            </button>
                                            <button
                                                onClick={handleCancel}
                                                style={{
                                                    flex: 1,
                                                    padding: '10px 16px',
                                                    background: '#f3f4f6',
                                                    color: '#6b7280',
                                                    border: '1px solid #d1d5db',
                                                    borderRadius: '8px',
                                                    fontSize: '0.85rem',
                                                    fontWeight: '600',
                                                    cursor: 'pointer',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    gap: '6px'
                                                }}
                                            >
                                                <X size={16} />
                                                Cancel
                                            </button>
                                        </>
                                    ) : (
                                        <button
                                            onClick={() => handleEditLogo(company)}
                                            style={{
                                                width: '100%',
                                                padding: '10px 16px',
                                                background: '#eff6ff',
                                                color: '#2563eb',
                                                border: '1.5px solid #bfdbfe',
                                                borderRadius: '8px',
                                                fontSize: '0.85rem',
                                                fontWeight: '600',
                                                cursor: 'pointer',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                gap: '6px'
                                            }}
                                        >
                                            <Upload size={16} />
                                            {company.logo ? 'Update Logo' : 'Add Logo'}
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <style>{`
                @keyframes spin {
                    to { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
}

export default ManageCompanyLogos;
