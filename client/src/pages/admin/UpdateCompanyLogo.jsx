import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { X, Check, Building2, Menu, Upload, AlertCircle } from 'lucide-react';
import api from '../../utils/api';
import './Admin.css';

function UpdateCompanyLogo() {
    const navigate = useNavigate();
    const [companies, setCompanies] = useState([]);
    const [showCompanyDropdown, setShowCompanyDropdown] = useState(false);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCompany, setSelectedCompany] = useState(null);
    const [previewUrl, setPreviewUrl] = useState('');

    const [formData, setFormData] = useState({
        company: '',
        logoUrl: '',
        aboutCompany: ''
    });

    useEffect(() => {
        fetchCompanies();
    }, []);

    const fetchCompanies = async () => {
        try {
            const response = await api.get('/companies');
            setCompanies(response.data);
        } catch (error) {
            console.error('Error fetching companies:', error);
            setError('Failed to load companies');
        }
    };

    const handleSearchChange = (e) => {
        const value = e.target.value;
        setSearchQuery(value);
        setShowCompanyDropdown(value.length > 0);
        
        if (value.length === 0) {
            setFormData(prev => ({ ...prev, company: '' }));
            setSelectedCompany(null);
        }
    };

    const selectCompany = (company) => {
        setFormData(prev => ({
            ...prev,
            company: company.name,
            logoUrl: company.logo || '',
            aboutCompany: company.aboutCompany || ''
        }));
        setSelectedCompany(company);
        setSearchQuery('');
        setShowCompanyDropdown(false);
        setPreviewUrl(company.logo || '');
        setSuccess(false);
        setError('');
    };

    const filteredCompanies = companies.filter(c =>
        c.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleLogoUrlChange = (e) => {
        const url = e.target.value;
        setFormData(prev => ({ ...prev, logoUrl: url }));
        setPreviewUrl(url);
    };

    const handleAboutChange = (e) => {
        const { value } = e.target;
        setFormData(prev => ({ ...prev, aboutCompany: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.company.trim()) {
            setError('Please select a company');
            return;
        }

        if (!formData.logoUrl.trim()) {
            setError('Please enter a logo URL');
            return;
        }

        // Validate URL format
        try {
            new URL(formData.logoUrl);
        } catch {
            setError('Please enter a valid URL');
            return;
        }

        setLoading(true);
        setError('');
        setSuccess(false);

        try {
            const payload = {
                logo: formData.logoUrl,
                ...(formData.aboutCompany && { aboutCompany: formData.aboutCompany })
            };

            const response = await api.put(
                `/companies/${formData.company}`,
                payload
            );

            setSuccess(true);
            setError('');
            
            // Update the selected company with new data
            setSelectedCompany(response.data.company);
            
            // Reset form after 2 seconds
            setTimeout(() => {
                setFormData({
                    company: formData.company,
                    logoUrl: response.data.company.logo,
                    aboutCompany: response.data.company.aboutCompany || ''
                });
                setPreviewUrl(response.data.company.logo);
                setSuccess(false);
            }, 2000);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to update company logo');
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setFormData({
            company: '',
            logoUrl: '',
            aboutCompany: ''
        });
        setSelectedCompany(null);
        setSearchQuery('');
        setPreviewUrl('');
        setError('');
        setSuccess(false);
    };

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
                    <Link to="/admin/manage-jobs" className="nav-item">
                        Manage Jobs
                    </Link>
                    <Link to="/admin/update-company-logo" className="nav-item active">
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

            <div className="admin-main">
                <div className="admin-header">
                    <button
                        className="admin-menu-btn"
                        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                    >
                        <Menu size={24} />
                    </button>
                    <h1>Update Company Logo & Details</h1>
                </div>

                <div className="admin-content">
                    <form onSubmit={handleSubmit} className="update-logo-form">
                        {/* Success Message */}
                        {success && (
                            <div className="alert alert-success">
                                <Check size={20} />
                                <span>{formData.company} logo updated successfully!</span>
                            </div>
                        )}

                        {/* Error Message */}
                        {error && (
                            <div className="alert alert-error">
                                <AlertCircle size={20} />
                                <span>{error}</span>
                            </div>
                        )}

                        {/* Company Selection */}
                        <div className="form-group">
                            <label htmlFor="company-search">
                                <Building2 size={18} />
                                Select Company
                            </label>
                            <div className="search-container">
                                <input
                                    id="company-search"
                                    type="text"
                                    placeholder="Search and select a company..."
                                    value={searchQuery || formData.company}
                                    onChange={handleSearchChange}
                                    onFocus={() => searchQuery && setShowCompanyDropdown(true)}
                                    className="form-input"
                                    autoComplete="off"
                                />
                                {showCompanyDropdown && filteredCompanies.length > 0 && (
                                    <div className="dropdown-list">
                                        {filteredCompanies.map(company => (
                                            <div
                                                key={company._id}
                                                className="dropdown-item"
                                                onClick={() => selectCompany(company)}
                                            >
                                                {company.logo && (
                                                    <img
                                                        src={company.logo}
                                                        alt={company.name}
                                                        className="dropdown-logo"
                                                    />
                                                )}
                                                <span>{company.name}</span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                            {showCompanyDropdown && filteredCompanies.length === 0 && searchQuery && (
                                <p className="no-results">No companies found matching "{searchQuery}"</p>
                            )}
                        </div>

                        {/* Show content only if company is selected */}
                        {selectedCompany && (
                            <>
                                {/* Current Logo Preview */}
                                <div className="form-section">
                                    <h3>Current Logo</h3>
                                    <div className="current-logo-preview">
                                        {selectedCompany.logo ? (
                                            <img src={selectedCompany.logo} alt={formData.company} />
                                        ) : (
                                            <div className="no-logo">No logo uploaded</div>
                                        )}
                                    </div>
                                </div>

                                {/* New Logo URL Input */}
                                <div className="form-group">
                                    <label htmlFor="logo-url">
                                        <Upload size={18} />
                                        New Logo URL
                                    </label>
                                    <input
                                        id="logo-url"
                                        type="text"
                                        placeholder="Enter image URL (e.g., https://example.com/logo.png)"
                                        value={formData.logoUrl}
                                        onChange={handleLogoUrlChange}
                                        className="form-input"
                                    />
                                    <p className="field-hint">
                                        Paste the URL of the new company logo. Supported formats: PNG, JPG, SVG
                                    </p>
                                </div>

                                {/* New Logo Preview */}
                                {previewUrl && (
                                    <div className="form-section">
                                        <h3>Logo Preview (New)</h3>
                                        <div className="new-logo-preview">
                                            <img 
                                                src={previewUrl} 
                                                alt="New logo preview"
                                                onError={() => setPreviewUrl('')}
                                            />
                                        </div>
                                    </div>
                                )}

                                {/* About Company */}
                                <div className="form-group">
                                    <label htmlFor="about-company">About Company (Optional)</label>
                                    <textarea
                                        id="about-company"
                                        placeholder="Add or update company description..."
                                        value={formData.aboutCompany}
                                        onChange={handleAboutChange}
                                        rows="4"
                                        className="form-textarea"
                                    />
                                    <p className="field-hint">
                                        Update company information that will be displayed on job listings
                                    </p>
                                </div>

                                {/* Form Actions */}
                                <div className="form-actions">
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="btn btn-primary btn-submit"
                                    >
                                        {loading ? 'Updating...' : 'Update Company Logo'}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={resetForm}
                                        disabled={loading}
                                        className="btn btn-secondary"
                                    >
                                        <X size={18} />
                                        Reset
                                    </button>
                                </div>
                            </>
                        )}

                        {/* Empty State */}
                        {!selectedCompany && !searchQuery && (
                            <div className="empty-state">
                                <Building2 size={48} />
                                <h3>Select a Company</h3>
                                <p>Search and select a company to update its logo and details</p>
                            </div>
                        )}
                    </form>

                    {/* Instructions */}
                    <div className="info-section">
                        <h3>How to Update Company Logo</h3>
                        <ol>
                            <li>Use the search box above to find and select a company</li>
                            <li>View the current logo in the preview section</li>
                            <li>Paste the new logo URL in the input field</li>
                            <li>The preview will automatically update as you type</li>
                            <li>Optionally update the company description</li>
                            <li>Click "Update Company Logo" to replace the existing logo</li>
                            <li>The new logo will instantly replace the old one across all job listings</li>
                        </ol>
                    </div>
                </div>
            </div>

            <style>{`
                .update-logo-form {
                    max-width: 800px;
                    margin: 0 auto;
                }

                .search-container {
                    position: relative;
                }

                .dropdown-list {
                    position: absolute;
                    top: 100%;
                    left: 0;
                    right: 0;
                    background: white;
                    border: 1px solid #ddd;
                    border-top: none;
                    border-radius: 0 0 8px 8px;
                    max-height: 300px;
                    overflow-y: auto;
                    z-index: 10;
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
                }

                .dropdown-item {
                    display: flex;
                    align-items: center;
                    padding: 12px 16px;
                    cursor: pointer;
                    transition: background-color 0.2s;
                    gap: 12px;
                }

                .dropdown-item:hover {
                    background-color: #f5f5f5;
                }

                .dropdown-logo {
                    width: 32px;
                    height: 32px;
                    object-fit: contain;
                    border-radius: 4px;
                    background: #f0f0f0;
                }

                .no-results {
                    color: #999;
                    padding: 12px 16px;
                    font-size: 14px;
                }

                .form-section {
                    margin: 32px 0;
                    padding: 20px;
                    background: #f9f9f9;
                    border-radius: 8px;
                }

                .form-section h3 {
                    margin: 0 0 16px 0;
                    font-size: 16px;
                    color: #333;
                }

                .current-logo-preview,
                .new-logo-preview {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    width: 100%;
                    height: 200px;
                    background: white;
                    border: 2px solid #eee;
                    border-radius: 8px;
                    overflow: auto;
                    padding: 20px;
                }

                .current-logo-preview img,
                .new-logo-preview img {
                    max-width: 100%;
                    max-height: 100%;
                    object-fit: contain;
                }

                .no-logo {
                    color: #999;
                    font-size: 14px;
                }

                .new-logo-preview {
                    border: 2px dashed #4CAF50;
                    background: #f0f8f4;
                }

                .field-hint {
                    font-size: 12px;
                    color: #999;
                    margin-top: 8px;
                }

                .form-actions {
                    display: flex;
                    gap: 12px;
                    margin: 32px 0 0 0;
                }

                .btn-primary {
                    background-color: #4CAF50;
                    color: white;
                    padding: 12px 24px;
                    border: none;
                    border-radius: 6px;
                    cursor: pointer;
                    font-size: 16px;
                    font-weight: 600;
                    transition: background-color 0.3s;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 8px;
                }

                .btn-primary:hover:not(:disabled) {
                    background-color: #45a049;
                }

                .btn-primary:disabled {
                    background-color: #ccc;
                    cursor: not-allowed;
                }

                .btn-secondary {
                    background-color: #f0f0f0;
                    color: #333;
                    padding: 12px 24px;
                    border: 1px solid #ddd;
                    border-radius: 6px;
                    cursor: pointer;
                    font-size: 16px;
                    font-weight: 600;
                    transition: background-color 0.3s;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }

                .btn-secondary:hover:not(:disabled) {
                    background-color: #e0e0e0;
                }

                .btn-secondary:disabled {
                    cursor: not-allowed;
                    opacity: 0.5;
                }

                .alert {
                    padding: 16px;
                    border-radius: 6px;
                    margin-bottom: 20px;
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    font-weight: 500;
                }

                .alert-success {
                    background-color: #d4edda;
                    color: #155724;
                    border: 1px solid #c3e6cb;
                }

                .alert-error {
                    background-color: #f8d7da;
                    color: #721c24;
                    border: 1px solid #f5c6cb;
                }

                .empty-state {
                    text-align: center;
                    padding: 60px 20px;
                    color: #999;
                }

                .empty-state svg {
                    color: #ddd;
                    margin-bottom: 16px;
                }

                .empty-state h3 {
                    margin: 16px 0 8px 0;
                    color: #666;
                }

                .empty-state p {
                    font-size: 14px;
                }

                .info-section {
                    margin-top: 40px;
                    padding: 20px;
                    background: #e3f2fd;
                    border-radius: 8px;
                    border-left: 4px solid #2196F3;
                }

                .info-section h3 {
                    margin-top: 0;
                    color: #1976D2;
                }

                .info-section ol {
                    margin: 12px 0;
                    padding-left: 20px;
                }

                .info-section li {
                    margin: 8px 0;
                    color: #333;
                }
            `}</style>
        </div>
    );
}

export default UpdateCompanyLogo;
