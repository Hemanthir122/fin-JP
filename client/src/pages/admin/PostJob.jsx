import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { X, Plus, Check, Building2, Menu } from 'lucide-react';

import api from '../../utils/api';
import roleTemplates from '../../data/roleTemplates';
import './Admin.css';

function PostJob() {
    const navigate = useNavigate();
    const [companies, setCompanies] = useState([]);
    const [showCompanyDropdown, setShowCompanyDropdown] = useState(false);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);


    const [formData, setFormData] = useState({
        title: '',
        company: '',
        companyLogo: '',
        aboutCompany: '',
        location: '',
        package: '',
        experience: '',
        batch: '',
        type: 'job',
        description: '',
        skills: [],
        responsibilities: [],
        qualifications: [],
        applyLink: '',
        endDate: '', // Initialize as empty string
        status: 'published', // Default to published
        scheduledPublishAt: '' // For scheduled posts
    });



    const [skillInput, setSkillInput] = useState('');
    const [responsibilityInput, setResponsibilityInput] = useState('');
    const [qualificationInput, setQualificationInput] = useState('');

    const roleOptions = Object.keys(roleTemplates);

    useEffect(() => {
        fetchCompanies();
    }, []);

    const fetchCompanies = async () => {
        try {
            const response = await api.get('/companies');
            setCompanies(response.data);
        } catch (error) {
            console.error('Error fetching companies:', error);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;

        let finalValue = value;
        if (name === 'company' && value.length > 0) {
            finalValue = value.charAt(0).toUpperCase() + value.slice(1);
        }

        setFormData(prev => ({ ...prev, [name]: finalValue }));

        // Auto-fill company logo when company is selected
        if (name === 'company') {
            const matchingCompany = companies.find(
                c => c.name.toLowerCase() === finalValue.toLowerCase()
            );
            if (matchingCompany && matchingCompany.logo) {
                setFormData(prev => ({ ...prev, companyLogo: matchingCompany.logo }));
            }
            setShowCompanyDropdown(value.length > 0);
        }
    };

    const selectCompany = (company) => {
        setFormData(prev => ({
            ...prev,
            company: company.name,
            companyLogo: company.logo || ''
        }));
        setShowCompanyDropdown(false);
    };

    const handleRoleSelect = (e) => {
        const selectedRole = e.target.value;

        if (selectedRole === "") {
            setFormData(prev => ({
                ...prev,
                title: "",
                description: "",
                skills: [],
                responsibilities: [],
                qualifications: []
            }));
            return;
        }

        setFormData(prev => ({ ...prev, title: selectedRole }));

        if (roleTemplates[selectedRole]) {
            const template = roleTemplates[selectedRole];
            setFormData(prev => ({
                ...prev,
                title: selectedRole,
                description: template.description,
                skills: template.skills,
                responsibilities: template.responsibilities,
                qualifications: template.qualifications || []
            }));
        }
    };

    const handleAddSkill = () => {
        if (skillInput.trim()) {
            if (!formData.skills.includes(skillInput.trim())) {
                setFormData(prev => ({
                    ...prev,
                    skills: [...prev.skills, skillInput.trim()]
                }));
            }
            setSkillInput('');
        }
    };

    const addSkillKeyPress = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleAddSkill();
        }
    };

    const removeSkill = (skillToRemove) => {
        setFormData(prev => ({
            ...prev,
            skills: prev.skills.filter(skill => skill !== skillToRemove)
        }));
    };

    const addResponsibility = () => {
        if (responsibilityInput.trim()) {
            // Split by newlines, periods, or bullet points and clean up
            const points = responsibilityInput
                .split(/[\n.•\-]+/)
                .map(point => point.trim())
                .filter(point => point.length > 10); // Filter out very short fragments
            
            setFormData(prev => ({
                ...prev,
                responsibilities: [...prev.responsibilities, ...points]
            }));
            setResponsibilityInput('');
        }
    };

    const removeResponsibility = (index) => {
        setFormData(prev => ({
            ...prev,
            responsibilities: prev.responsibilities.filter((_, i) => i !== index)
        }));
    };

    const addQualification = () => {
        if (qualificationInput.trim()) {
            // Split by newlines, periods, or bullet points and clean up
            const points = qualificationInput
                .split(/[\n.•\-]+/)
                .map(point => point.trim())
                .filter(point => point.length > 10); // Filter out very short fragments
            
            setFormData(prev => ({
                ...prev,
                qualifications: [...prev.qualifications, ...points]
            }));
            setQualificationInput('');
        }
    };

    const removeQualification = (index) => {
        setFormData(prev => ({
            ...prev,
            qualifications: prev.qualifications.filter((_, i) => i !== index)
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Validation for scheduled posts
        if (formData.status === 'scheduled') {
            if (!formData.scheduledPublishAt) {
                alert('Please select a date and time for scheduled posting');
                return;
            }
            
            const scheduledDate = new Date(formData.scheduledPublishAt);
            const now = new Date();
            
            if (scheduledDate <= now) {
                alert('Scheduled date must be in the future');
                return;
            }
        }
        
        setLoading(true);

        try {
            if (formData.type === 'walkin') {
                const payload = {
                    company: formData.company,
                    description: formData.description,
                    status: formData.status
                };
                
                if (formData.status === 'scheduled' && formData.scheduledPublishAt) {
                    payload.scheduledPublishAt = new Date(formData.scheduledPublishAt).toISOString();
                }
                
                await api.post('/walkins', payload);
            } else {
                const payload = { ...formData };
                if (!payload.endDate) {
                    payload.endDate = null;
                }
                
                if (formData.status === 'scheduled' && formData.scheduledPublishAt) {
                    payload.scheduledPublishAt = new Date(formData.scheduledPublishAt).toISOString();
                }
                
                await api.post('/jobs', payload);
            }

            setSuccess(true);
            setTimeout(() => {
                navigate('/admin/manage-jobs');
            }, 2000);
        } catch (error) {
            console.error('Error posting job:', error);
            alert(error.response?.data?.message || 'Error posting job. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const filteredCompanies = companies.filter(c =>
        c.name.toLowerCase().includes(formData.company.toLowerCase())
    );

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
                    <Link to="/admin/post-job" className="nav-item active">
                        Post New Job
                    </Link>
                    <Link to="/admin/manage-jobs" className="nav-item">
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

            <div className="admin-content admin-form-page">

                <div className="admin-header">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <button
                            className="mobile-menu-btn"
                            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                        >
                            <Menu size={24} />
                        </button>
                        <div>
                            <h1>Post New Job</h1>
                            <p>Create a new job listing with auto-generated content</p>
                        </div>
                    </div>
                </div>


                {success ? (
                    <div className="form-card">
                        <div className="success-message">
                            <div className="success-icon">
                                <Check size={48} />
                            </div>
                            <h2>Job Posted Successfully!</h2>
                            <p>Redirecting to manage jobs...</p>
                        </div>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit}>
                        {/* Job Type Selection - FIRST */}
                        <div className="form-card">
                            <h2>Select Job Type</h2>
                            <div className="form-group">
                                <label className="label">Job Type *</label>
                                <select
                                    name="type"
                                    value={formData.type}
                                    onChange={handleChange}
                                    className="select"
                                    required
                                >
                                    <option value="job">Full Time Job</option>
                                    <option value="internship">Internship</option>
                                    <option value="walkin">Walk-in / Email</option>
                                </select>
                                <small style={{ color: 'var(--text-muted)', marginTop: '8px', display: 'block' }}>
                                    {formData.type === 'walkin'
                                        ? 'Walk-in/Email requires only company name and description'
                                        : 'Full job details required for this type'}
                                </small>
                            </div>
                        </div>

                        {/* Publishing Options */}
                        <div className="form-card">
                            <h2>Publishing Options</h2>
                            <div className="form-row">
                                <div className="form-group">
                                    <label className="label">Status *</label>
                                    <select
                                        name="status"
                                        value={formData.status}
                                        onChange={handleChange}
                                        className="select"
                                        required
                                    >
                                        <option value="published">Publish Now</option>
                                        <option value="scheduled">Schedule for Later</option>
                                        <option value="draft">Save as Draft</option>
                                    </select>
                                    <small style={{ color: 'var(--text-muted)', marginTop: '8px', display: 'block' }}>
                                        {formData.status === 'published' && 'Post will be visible immediately'}
                                        {formData.status === 'scheduled' && 'Post will be published at the scheduled time'}
                                        {formData.status === 'draft' && 'Post will be saved but not visible'}
                                    </small>
                                </div>
                                
                                {formData.status === 'scheduled' && (
                                    <div className="form-group">
                                        <label className="label">Schedule Date & Time *</label>
                                        <input
                                            type="datetime-local"
                                            name="scheduledPublishAt"
                                            value={formData.scheduledPublishAt}
                                            onChange={handleChange}
                                            className="input"
                                            required
                                            min={new Date().toISOString().slice(0, 16)}
                                        />
                                        <small style={{ color: 'var(--text-muted)', marginTop: '8px', display: 'block' }}>
                                            Post will be automatically published at this time
                                        </small>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Company Information */}
                        <div className="form-card">
                            <h2>Company Information</h2>
                            <div className="form-row">
                                <div className="form-group autocomplete-container">
                                    <label className="label">Company Name *</label>
                                    <input
                                        type="text"
                                        name="company"
                                        value={formData.company}
                                        onChange={handleChange}
                                        onFocus={() => setShowCompanyDropdown(formData.company.length > 0)}
                                        onBlur={() => setTimeout(() => setShowCompanyDropdown(false), 200)}
                                        className="input"
                                        placeholder="Type or select company..."
                                        required
                                    />
                                    {showCompanyDropdown && filteredCompanies.length > 0 && (
                                        <div className="autocomplete-dropdown">
                                            {filteredCompanies.map((company) => (
                                                <div
                                                    key={company._id}
                                                    className="autocomplete-item"
                                                    onClick={() => selectCompany(company)}
                                                >
                                                    {company.logo ? (
                                                        <img src={company.logo} alt={company.name} />
                                                    ) : (
                                                        <Building2 size={20} />
                                                    )}
                                                    <span>{company.name}</span>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                                {formData.type !== 'walkin' && (
                                    <div className="form-group">
                                        <label className="label">Company Logo URL</label>
                                        <input
                                            type="url"
                                            name="companyLogo"
                                            value={formData.companyLogo}
                                            onChange={handleChange}
                                            className="input"
                                            placeholder="https://example.com/logo.png"
                                        />
                                        {formData.companyLogo && (
                                            <div style={{ marginTop: '12px', padding: '12px', border: '1px solid var(--border-color)', borderRadius: '8px', backgroundColor: 'var(--bg-secondary)' }}>
                                                <small style={{ color: 'var(--text-muted)', display: 'block', marginBottom: '8px' }}>Logo Preview:</small>
                                                <img 
                                                    src={formData.companyLogo} 
                                                    alt="Company Logo Preview" 
                                                    style={{ 
                                                        maxWidth: '120px', 
                                                        maxHeight: '120px', 
                                                        objectFit: 'contain',
                                                        border: '1px solid var(--border-color)',
                                                        borderRadius: '4px',
                                                        padding: '8px',
                                                        backgroundColor: 'white'
                                                    }}
                                                    onError={(e) => {
                                                        e.target.style.display = 'none';
                                                        e.target.nextSibling.style.display = 'block';
                                                    }}
                                                />
                                                <small style={{ color: '#e74c3c', display: 'none', marginTop: '8px' }}>
                                                    Invalid image URL or failed to load
                                                </small>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* About Company Section */}
                            {formData.type !== 'walkin' && (
                                <div className="form-group">
                                    <label className="label">About Company</label>
                                    <textarea
                                        name="aboutCompany"
                                        value={formData.aboutCompany}
                                        onChange={handleChange}
                                        className="textarea"
                                        placeholder="Tell us about your company, culture, mission, and what makes it unique..."
                                        rows="4"
                                    ></textarea>
                                </div>
                            )}
                        </div>

                        {/* Job Information - Only for non-walkin types */}
                        {formData.type !== 'walkin' && (
                            <div className="form-card">
                                <h2>Job Information</h2>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label className="label">Load from Template (Optional)</label>
                                        <select
                                            onChange={handleRoleSelect}
                                            className="select"
                                            defaultValue=""
                                        >
                                            <option value="">Select a role to auto-fill...</option>
                                            {roleOptions.map((role) => (
                                                <option key={role} value={role}>{role}</option>
                                            ))}
                                        </select>
                                        <small style={{ color: 'var(--text-muted)', marginTop: '8px', display: 'block' }}>
                                            Selecting a role will auto-fill description, skills & responsibilities. You can edit them afterwards.
                                        </small>
                                    </div>
                                    <div className="form-group">
                                        <label className="label">Job Title/Role *</label>
                                        <input
                                            type="text"
                                            name="title"
                                            value={formData.title}
                                            onChange={handleChange}
                                            className="input"
                                            placeholder="e.g., Senior Software Engineer"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="form-row form-row-3">
                                    <div className="form-group">
                                        <label className="label">Location *</label>
                                        <input
                                            type="text"
                                            name="location"
                                            value={formData.location}
                                            onChange={handleChange}
                                            className="input"
                                            placeholder="e.g., Bangalore, India"
                                            required
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label className="label">
                                            {formData.type === 'internship' ? 'Stipend *' : 'Package/Salary *'}
                                        </label>
                                        <input
                                            type="text"
                                            name="package"
                                            value={formData.package}
                                            onChange={handleChange}
                                            className="input"
                                            placeholder={formData.type === 'internship' ? 'e.g., 10,000-15,000' : 'e.g., 8-12 LPA'}
                                            required
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label className="label">Experience *</label>
                                        <select
                                            name="experience"
                                            value={formData.experience}
                                            onChange={handleChange}
                                            className="select"
                                            required
                                        >
                                            <option value="">Select Experience</option>
                                            <option value="Fresher">Freshers</option>
                                            <option value="0-1 years">0-1 years</option>
                                            <option value="0-2 years">0-2 years</option>
                                            <option value="1 year">1 year</option>
                                            <option value="More than 2 years">More than 2 years</option>
                                            <option value="Above 3 years">Above 3 years</option>
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label className="label">Batch (Optional)</label>
                                        <input
                                            type="text"
                                            name="batch"
                                            value={formData.batch}
                                            onChange={handleChange}
                                            className="input"
                                            placeholder="e.g., 2024, 2025, 2026"
                                        />
                                    </div>
                                </div>

                                <div className="form-row">
                                    <div className="form-group">
                                        <label className="label">End Date (Auto-remove)</label>
                                        <input
                                            type="date"
                                            name="endDate"
                                            value={formData.endDate}
                                            onChange={handleChange}
                                            className="input"
                                        />
                                        <small style={{ color: 'var(--text-muted)', fontSize: '11px', marginTop: '4px' }}>
                                            Job will be removed automatically after this date (Optional)
                                        </small>
                                    </div>
                                    <div className="form-group">
                                        <label className="label">Apply Link</label>
                                        <input
                                            type="url"
                                            name="applyLink"
                                            value={formData.applyLink}
                                            onChange={handleChange}
                                            className="input"
                                            placeholder="https://careers.company.com/apply"
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Description */}
                        <div className="form-card">
                            <h2>{formData.type === 'walkin' ? 'Walk-in / Email Details' : 'Job Description'}</h2>
                            <div className="form-group">
                                <label className="label">Description *</label>
                                <textarea
                                    name="description"
                                    value={formData.description}
                                    onChange={handleChange}
                                    className="textarea"
                                    rows={formData.type === 'walkin' ? '15' : '10'}
                                    placeholder={formData.type === 'walkin'
                                        ? 'Enter all walk-in/email details including date, time, venue, contact info, eligibility criteria, documents required, etc...'
                                        : 'Enter job description...'}
                                    required
                                ></textarea>
                            </div>
                        </div>

                        {/* Skills - Only for non-walkin types */}
                        {formData.type !== 'walkin' && (
                            <div className="form-card">
                                <h2>Required Skills</h2>
                                <div className="form-group">
                                    <label className="label">Skills (Press Enter to add)</label>
                                    <div className="skills-input-container">
                                        {formData.skills.map((skill, index) => (
                                            <span key={index} className="skill-tag-input">
                                                {skill}
                                                <button type="button" onClick={() => removeSkill(skill)}>
                                                    <X size={14} />
                                                </button>
                                            </span>
                                        ))}
                                        <div style={{ display: 'flex', gap: '8px', width: '100%', marginTop: '8px' }}>
                                            <input
                                                type="text"
                                                value={skillInput}
                                                onChange={(e) => setSkillInput(e.target.value)}
                                                onKeyPress={addSkillKeyPress}
                                                placeholder="Type skill and press Enter..."
                                                className="input"
                                                style={{ flex: 1 }}
                                            />
                                            <button type="button" className="btn btn-secondary" onClick={handleAddSkill}>
                                                <Plus size={18} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Responsibilities - Only for non-walkin types */}
                        {formData.type !== 'walkin' && (
                            <div className="form-card">
                                <h2>Roles & Responsibilities</h2>
                                <div className="form-group">
                                    <label className="label">Add Responsibilities</label>
                                    <small style={{ color: 'var(--text-muted)', display: 'block', marginBottom: '8px' }}>
                                        Paste a paragraph or list - it will be automatically split into bullet points
                                    </small>
                                    <div className="flex gap-2">
                                        <textarea
                                            value={responsibilityInput}
                                            onChange={(e) => setResponsibilityInput(e.target.value)}
                                            className="textarea"
                                            rows="5"
                                            placeholder="Paste paragraph or enter responsibilities (separated by lines or periods)..."
                                            style={{ flex: 1 }}
                                        />
                                    </div>
                                    <button 
                                        type="button" 
                                        className="btn btn-secondary" 
                                        onClick={addResponsibility}
                                        style={{ marginTop: '8px' }}
                                    >
                                        <Plus size={18} /> Add Points
                                    </button>
                                </div>
                                {formData.responsibilities.length > 0 && (
                                    <ul className="responsibilities-list" style={{ marginTop: '16px' }}>
                                        {formData.responsibilities.map((item, index) => (
                                            <li key={index} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                                <span style={{ display: 'flex', gap: '12px', flex: 1 }}>
                                                    <Check size={18} style={{ color: 'var(--accent-green)', flexShrink: 0, marginTop: '3px' }} />
                                                    {item}
                                                </span>
                                                <button
                                                    type="button"
                                                    onClick={() => removeResponsibility(index)}
                                                    style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
                                                >
                                                    <X size={16} />
                                                </button>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                        )}

                        {/* Qualifications - Only for non-walkin types */}
                        {formData.type !== 'walkin' && (
                            <div className="form-card">
                                <h2>Qualifications</h2>
                                <div className="form-group">
                                    <label className="label">Add Qualifications</label>
                                    <small style={{ color: 'var(--text-muted)', display: 'block', marginBottom: '8px' }}>
                                        Paste a paragraph or list - it will be automatically split into bullet points
                                    </small>
                                    <div className="flex gap-2">
                                        <textarea
                                            value={qualificationInput}
                                            onChange={(e) => setQualificationInput(e.target.value)}
                                            className="textarea"
                                            rows="5"
                                            placeholder="Paste paragraph or enter qualifications (separated by lines or periods)..."
                                            style={{ flex: 1 }}
                                        />
                                    </div>
                                    <button 
                                        type="button" 
                                        className="btn btn-secondary" 
                                        onClick={addQualification}
                                        style={{ marginTop: '8px' }}
                                    >
                                        <Plus size={18} /> Add Points
                                    </button>
                                </div>
                                {formData.qualifications.length > 0 && (
                                    <ul className="responsibilities-list" style={{ marginTop: '16px' }}>
                                        {formData.qualifications.map((item, index) => (
                                            <li key={index} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                                <span style={{ display: 'flex', gap: '12px', flex: 1 }}>
                                                    <Check size={18} style={{ color: 'var(--accent-green)', flexShrink: 0, marginTop: '3px' }} />
                                                    {item}
                                                </span>
                                                <button
                                                    type="button"
                                                    onClick={() => removeQualification(index)}
                                                    style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
                                                >
                                                    <X size={16} />
                                                </button>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                        )}

                        {/* Submit */}
                        <div className="form-actions">
                            <button
                                type="submit"
                                onClick={handleSubmit}
                                className="btn btn-primary"
                                disabled={loading}
                            >
                                {loading ? 'Saving...' : 
                                 formData.status === 'published' ? (formData.type === 'walkin' ? 'Publish Walk-in' : 'Publish Job') :
                                 formData.status === 'scheduled' ? 'Schedule Post' :
                                 'Save as Draft'}
                            </button>
                            <Link to="/admin" className="btn btn-secondary">
                                Cancel
                            </Link>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
}

export default PostJob;