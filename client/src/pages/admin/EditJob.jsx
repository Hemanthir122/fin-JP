import { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { X, Plus, Check, Building2, Menu } from 'lucide-react';

import api from '../../utils/api';
import roleTemplates from '../../data/roleTemplates';
import './Admin.css';

function EditJob() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [companies, setCompanies] = useState([]);
    const [showCompanyDropdown, setShowCompanyDropdown] = useState(false);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [success, setSuccess] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);


    const [formData, setFormData] = useState({
        title: '',
        company: '',
        companyLogo: '',
        location: '',
        package: '',
        experience: '',
        type: 'job',
        description: '',
        skills: [],
        responsibilities: [],
        qualifications: [],
        applyLink: '',
        endDate: ''
    });


    const [skillInput, setSkillInput] = useState('');
    const [responsibilityInput, setResponsibilityInput] = useState('');
    const [qualificationInput, setQualificationInput] = useState('');

    const roleOptions = Object.keys(roleTemplates);

    useEffect(() => {
        fetchData();
    }, [id]);

    const fetchData = async () => {
        try {
            const [jobRes, companiesRes] = await Promise.all([
                api.get(`/jobs/${id}`),
                api.get('/companies')
            ]);
            const jobData = jobRes.data;
            if (jobData.endDate) {
                jobData.endDate = new Date(jobData.endDate).toISOString().split('T')[0];
            }
            setFormData(jobData);

            setCompanies(companiesRes.data);
        } catch (error) {
            console.error('Error fetching data:', error);
            alert('Error loading job data.');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;

        let finalValue = value;
        if (name === 'company' && value.length > 0) {
            finalValue = value.charAt(0).toUpperCase() + value.slice(1);
        }

        setFormData(prev => ({ ...prev, [name]: finalValue }));

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
        setFormData(prev => ({ ...prev, title: selectedRole }));

        if (roleTemplates[selectedRole]) {
            const template = roleTemplates[selectedRole];
            setFormData(prev => ({
                ...prev,
                title: selectedRole,
                description: template.description,
                skills: template.skills,
                responsibilities: template.responsibilities
            }));
        }
    };

    const addSkill = (e) => {
        if (e.key === 'Enter' && skillInput.trim()) {
            e.preventDefault();
            if (!formData.skills.includes(skillInput.trim())) {
                setFormData(prev => ({
                    ...prev,
                    skills: [...prev.skills, skillInput.trim()]
                }));
            }
            setSkillInput('');
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
            setFormData(prev => ({
                ...prev,
                responsibilities: [...prev.responsibilities, responsibilityInput.trim()]
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
            setFormData(prev => ({
                ...prev,
                qualifications: [...prev.qualifications, qualificationInput.trim()]
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
        setSaving(true);

        try {
            const payload = { ...formData };
            if (!payload.endDate) {
                payload.endDate = null;
            }
            await api.put(`/jobs/${id}`, payload);

            setSuccess(true);
            setTimeout(() => {
                navigate('/admin/manage-jobs');
            }, 2000);
        } catch (error) {
            console.error('Error updating job:', error);
            alert('Error updating job. Please try again.');
        } finally {
            setSaving(false);
        }
    };

    const filteredCompanies = companies.filter(c =>
        c.name.toLowerCase().includes(formData.company.toLowerCase())
    );

    if (loading) {
        return (
            <div className="admin-page">
                <div className={`admin-sidebar ${isSidebarOpen ? 'show' : ''}`}>
                    <div className="admin-logo">
                        <span className="logo-text">Jobs</span>
                        <span className="logo-accent">Connect</span>
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
                    <div className="loading-container">
                        <div className="spinner"></div>
                    </div>
                </div>
            </div>
        );
    }

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
                            <h1>Edit Job</h1>
                            <p>Update job listing details</p>
                        </div>
                    </div>
                </div>


                {success ? (
                    <div className="form-card">
                        <div className="success-message">
                            <div className="success-icon">
                                <Check size={48} />
                            </div>
                            <h2>Job Updated Successfully!</h2>
                            <p>Redirecting to manage jobs...</p>
                        </div>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit}>
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
                                </div>
                            </div>
                        </div>

                        {/* Job Information */}
                        <div className="form-card">
                            <h2>Job Information</h2>
                            <div className="form-row">
                                <div className="form-group">
                                    <label className="label">Job Title/Role *</label>
                                    <select
                                        value={roleOptions.includes(formData.title) ? formData.title : ''}
                                        onChange={handleRoleSelect}
                                        className="select"
                                    >
                                        <option value="">Select a role or use custom...</option>
                                        {roleOptions.map((role) => (
                                            <option key={role} value={role}>{role}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label className="label">Custom Title</label>
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
                                    <label className="label">Package/Salary *</label>
                                    <input
                                        type="text"
                                        name="package"
                                        value={formData.package}
                                        onChange={handleChange}
                                        className="input"
                                        placeholder="e.g., 8-12 LPA"
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="label">Experience *</label>
                                    <input
                                        type="text"
                                        name="experience"
                                        value={formData.experience}
                                        onChange={handleChange}
                                        className="input"
                                        placeholder="e.g., 2-4 years"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="form-row">
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
                                        <option value="walkin">Walk-in Interview</option>
                                    </select>
                                </div>
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

                        {/* Description */}
                        <div className="form-card">
                            <h2>Job Description</h2>
                            <div className="form-group">
                                <label className="label">Description *</label>
                                <textarea
                                    name="description"
                                    value={formData.description}
                                    onChange={handleChange}
                                    className="textarea"
                                    rows="10"
                                    placeholder="Enter job description..."
                                    required
                                ></textarea>
                            </div>
                        </div>

                        {/* Skills */}
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
                                    <input
                                        type="text"
                                        value={skillInput}
                                        onChange={(e) => setSkillInput(e.target.value)}
                                        onKeyPress={addSkill}
                                        placeholder="Type skill and press Enter..."
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Responsibilities */}
                        <div className="form-card">
                            <h2>Roles & Responsibilities</h2>
                            <div className="form-group">
                                <label className="label">Add Responsibility</label>
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        value={responsibilityInput}
                                        onChange={(e) => setResponsibilityInput(e.target.value)}
                                        className="input"
                                        placeholder="Enter responsibility..."
                                        style={{ flex: 1 }}
                                    />
                                    <button type="button" className="btn btn-secondary" onClick={addResponsibility}>
                                        <Plus size={18} />
                                    </button>
                                </div>
                            </div>
                            {formData.responsibilities && formData.responsibilities.length > 0 && (
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

                        {/* Qualifications */}
                        <div className="form-card">
                            <h2>Qualifications</h2>
                            <div className="form-group">
                                <label className="label">Add Qualification</label>
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        value={qualificationInput}
                                        onChange={(e) => setQualificationInput(e.target.value)}
                                        className="input"
                                        placeholder="Enter qualification..."
                                        style={{ flex: 1 }}
                                    />
                                    <button type="button" className="btn btn-secondary" onClick={addQualification}>
                                        <Plus size={18} />
                                    </button>
                                </div>
                            </div>
                            {formData.qualifications && formData.qualifications.length > 0 && (
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

                        {/* Submit */}
                        <div className="form-actions">
                            <button type="submit" className="btn btn-primary" disabled={saving}>
                                {saving ? 'Saving...' : 'Update Job'}
                            </button>
                            <Link to="/admin/manage-jobs" className="btn btn-secondary">
                                Cancel
                            </Link>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
}

export default EditJob;
