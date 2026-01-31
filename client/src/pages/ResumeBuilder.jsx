import { useState, useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import { 
    FileText, Briefcase, Target, CheckCircle, AlertCircle, 
    TrendingUp, Award, Lightbulb, RefreshCw, Copy, Download,
    ChevronDown, ChevronUp, Sparkles, Shield, BarChart3
} from 'lucide-react';
import './ResumeBuilder.css';

// Keyword extraction utility
const extractKeywords = (text) => {
    if (!text) return [];
    const stopWords = new Set(['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'from', 'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might', 'must', 'shall', 'can', 'need', 'dare', 'ought', 'used', 'as', 'if', 'when', 'than', 'because', 'while', 'although', 'though', 'after', 'before', 'until', 'unless', 'since', 'so', 'that', 'this', 'these', 'those', 'am', 'it', 'its', 'we', 'you', 'your', 'our', 'their', 'his', 'her', 'my', 'who', 'which', 'what', 'where', 'how', 'all', 'each', 'every', 'both', 'few', 'more', 'most', 'other', 'some', 'such', 'no', 'nor', 'not', 'only', 'own', 'same', 'too', 'very', 'just', 'also', 'now', 'here', 'there', 'then', 'once', 'any', 'about', 'into', 'through', 'during', 'out', 'over', 'under', 'again', 'further', 'up', 'down', 'off', 'above', 'below', 'between', 'among']);
    
    const words = text.toLowerCase()
        .replace(/[^a-zA-Z0-9\s+#.-]/g, ' ')
        .split(/\s+/)
        .filter(word => word.length > 2 && !stopWords.has(word));
    
    // Count frequency
    const freq = {};
    words.forEach(word => {
        freq[word] = (freq[word] || 0) + 1;
    });
    
    return Object.entries(freq)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 50)
        .map(([word]) => word);
};

// Common tech skills database
const techSkillsDB = [
    'javascript', 'typescript', 'python', 'java', 'c++', 'c#', 'ruby', 'php', 'go', 'rust', 'swift', 'kotlin',
    'react', 'angular', 'vue', 'node.js', 'express', 'django', 'flask', 'spring', 'laravel', 'rails',
    'html', 'css', 'sass', 'tailwind', 'bootstrap', 'jquery', 'webpack', 'vite', 'babel',
    'sql', 'mysql', 'postgresql', 'mongodb', 'redis', 'elasticsearch', 'firebase', 'dynamodb',
    'aws', 'azure', 'gcp', 'docker', 'kubernetes', 'jenkins', 'terraform', 'ansible', 'ci/cd',
    'git', 'github', 'gitlab', 'bitbucket', 'jira', 'confluence', 'agile', 'scrum',
    'api', 'rest', 'graphql', 'microservices', 'serverless', 'oauth', 'jwt',
    'machine learning', 'deep learning', 'tensorflow', 'pytorch', 'nlp', 'computer vision',
    'figma', 'sketch', 'adobe', 'photoshop', 'illustrator', 'ui/ux', 'design',
    'excel', 'powerpoint', 'word', 'salesforce', 'sap', 'oracle', 'erp', 'crm',
    'communication', 'leadership', 'teamwork', 'problem-solving', 'analytical', 'project management'
];

// Analyze resume against job description
const analyzeResume = (resumeText, jobDescription) => {
    if (!resumeText || !jobDescription) {
        return null;
    }

    const resumeLower = resumeText.toLowerCase();
    const jdLower = jobDescription.toLowerCase();
    
    // Extract keywords from JD
    const jdKeywords = extractKeywords(jobDescription);
    const resumeKeywords = extractKeywords(resumeText);
    
    // Find matched and missing keywords
    const matchedKeywords = jdKeywords.filter(keyword => 
        resumeLower.includes(keyword)
    );
    const missingKeywords = jdKeywords.filter(keyword => 
        !resumeLower.includes(keyword)
    );
    
    // Extract skills from JD
    const jdSkills = techSkillsDB.filter(skill => 
        jdLower.includes(skill.toLowerCase())
    );
    const matchedSkills = jdSkills.filter(skill => 
        resumeLower.includes(skill.toLowerCase())
    );
    const missingSkills = jdSkills.filter(skill => 
        !resumeLower.includes(skill.toLowerCase())
    );
    
    // Calculate scores
    const keywordScore = jdKeywords.length > 0 
        ? Math.round((matchedKeywords.length / jdKeywords.length) * 100)
        : 0;
    const skillScore = jdSkills.length > 0 
        ? Math.round((matchedSkills.length / jdSkills.length) * 100)
        : 0;
    
    // Section completeness check
    const sections = {
        contact: /email|phone|linkedin|address/i.test(resumeText),
        summary: /summary|objective|profile|about/i.test(resumeText),
        experience: /experience|work|employment|job/i.test(resumeText),
        education: /education|degree|university|college|bachelor|master/i.test(resumeText),
        skills: /skills|technologies|tools|proficient/i.test(resumeText),
        projects: /projects|portfolio|achievements/i.test(resumeText)
    };
    const completedSections = Object.values(sections).filter(Boolean).length;
    const sectionScore = Math.round((completedSections / 6) * 100);
    
    // Overall ATS score (weighted average)
    const atsScore = Math.round(
        (keywordScore * 0.4) + (skillScore * 0.35) + (sectionScore * 0.25)
    );
    
    // Match level
    let matchLevel = 'Low';
    if (atsScore >= 70) matchLevel = 'High';
    else if (atsScore >= 45) matchLevel = 'Medium';
    
    // Generate suggestions
    const suggestions = [];
    
    if (missingSkills.length > 0) {
        suggestions.push({
            section: 'Skills',
            type: 'warning',
            message: `Consider adding these relevant skills if you have them: ${missingSkills.slice(0, 5).join(', ')}`,
            priority: 'high'
        });
    }
    
    if (missingKeywords.length > 5) {
        suggestions.push({
            section: 'Keywords',
            type: 'info',
            message: `Your resume could benefit from including more job-relevant terms like: ${missingKeywords.slice(0, 5).join(', ')}`,
            priority: 'medium'
        });
    }
    
    if (!sections.summary) {
        suggestions.push({
            section: 'Summary',
            type: 'warning',
            message: 'Add a professional summary at the top to highlight your key qualifications',
            priority: 'high'
        });
    }
    
    if (!sections.skills) {
        suggestions.push({
            section: 'Skills',
            type: 'warning',
            message: 'Include a dedicated skills section to improve ATS scanning',
            priority: 'high'
        });
    }
    
    if (!sections.projects && jdLower.includes('project')) {
        suggestions.push({
            section: 'Projects',
            type: 'info',
            message: 'Consider adding a projects section to showcase relevant work',
            priority: 'medium'
        });
    }
    
    // Action verbs check
    const actionVerbs = ['led', 'managed', 'developed', 'created', 'implemented', 'designed', 'built', 'achieved', 'improved', 'increased', 'reduced', 'launched'];
    const hasActionVerbs = actionVerbs.some(verb => resumeLower.includes(verb));
    if (!hasActionVerbs) {
        suggestions.push({
            section: 'Experience',
            type: 'info',
            message: 'Use strong action verbs (led, developed, implemented) to describe your achievements',
            priority: 'low'
        });
    }
    
    // Quantification check
    const hasNumbers = /\d+%|\d+\+|\$\d+|\d+ (years?|months?|projects?|users?|clients?)/i.test(resumeText);
    if (!hasNumbers) {
        suggestions.push({
            section: 'Experience',
            type: 'info',
            message: 'Add quantifiable achievements (e.g., "increased sales by 25%", "managed 5 projects")',
            priority: 'medium'
        });
    }

    return {
        atsScore,
        keywordScore,
        skillScore,
        sectionScore,
        matchLevel,
        matchedKeywords,
        missingKeywords,
        matchedSkills,
        missingSkills,
        sections,
        suggestions,
        jdKeywords,
        resumeKeywords
    };
};

function ResumeBuilder() {
    const [jobTitle, setJobTitle] = useState('');
    const [company, setCompany] = useState('');
    const [jobDescription, setJobDescription] = useState('');
    const [resumeText, setResumeText] = useState('');
    const [experienceLevel, setExperienceLevel] = useState('professional');
    const [showAnalysis, setShowAnalysis] = useState(false);
    const [expandedSections, setExpandedSections] = useState({
        skills: true,
        keywords: true,
        suggestions: true
    });

    const analysis = useMemo(() => {
        if (showAnalysis && resumeText && jobDescription) {
            return analyzeResume(resumeText, jobDescription);
        }
        return null;
    }, [showAnalysis, resumeText, jobDescription]);

    const handleAnalyze = () => {
        if (resumeText.trim() && jobDescription.trim()) {
            setShowAnalysis(true);
        }
    };

    const handleReset = () => {
        setShowAnalysis(false);
    };

    const toggleSection = (section) => {
        setExpandedSections(prev => ({
            ...prev,
            [section]: !prev[section]
        }));
    };

    const getScoreColor = (score) => {
        if (score >= 70) return 'score-high';
        if (score >= 45) return 'score-medium';
        return 'score-low';
    };

    const getScoreGradient = (score) => {
        if (score >= 70) return 'linear-gradient(135deg, #22c55e, #16a34a)';
        if (score >= 45) return 'linear-gradient(135deg, #f97316, #ea580c)';
        return 'linear-gradient(135deg, #ef4444, #dc2626)';
    };

    return (
        <>
            <Helmet>
                <title>Resume Builder & ATS Optimizer | JobConnects</title>
                <meta name="description" content="Optimize your resume for ATS systems. Get instant feedback on keyword matching, skill gaps, and actionable suggestions to improve your job application success rate." />
            </Helmet>

            <div className="resume-builder-page">
                {/* Hero Section */}
                <section className="rb-hero">
                    <div className="container">
                        <div className="rb-hero-content">
                            <div className="rb-hero-badge">
                                <Shield size={16} />
                                <span>Ethical AI-Powered Analysis</span>
                            </div>
                            <h1 className="rb-hero-title">
                                Resume Builder & <span className="gradient-text">ATS Optimizer</span>
                            </h1>
                            <p className="rb-hero-subtitle">
                                Analyze your resume against any job description. Get instant ATS compatibility scores, 
                                skill gap analysis, and ethical improvement suggestions.
                            </p>
                            <div className="rb-hero-features">
                                <div className="rb-feature-chip">
                                    <CheckCircle size={14} />
                                    <span>No Data Fabrication</span>
                                </div>
                                <div className="rb-feature-chip">
                                    <Target size={14} />
                                    <span>ATS Optimized</span>
                                </div>
                                <div className="rb-feature-chip">
                                    <Sparkles size={14} />
                                    <span>Instant Analysis</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Main Content */}
                <section className="rb-main section">
                    <div className="container">
                        <div className="rb-grid">
                            {/* Input Panel */}
                            <div className="rb-input-panel">
                                {/* Job Context Card */}
                                <div className="rb-card">
                                    <div className="rb-card-header">
                                        <div className="rb-card-icon">
                                            <Briefcase size={20} />
                                        </div>
                                        <div>
                                            <h3 className="rb-card-title">Job Context</h3>
                                            <p className="rb-card-desc">Paste the job details you're targeting</p>
                                        </div>
                                    </div>
                                    <div className="rb-card-body">
                                        <div className="rb-form-row">
                                            <div className="form-group">
                                                <label className="label">Job Title</label>
                                                <input
                                                    type="text"
                                                    className="input"
                                                    placeholder="e.g., Senior Software Engineer"
                                                    value={jobTitle}
                                                    onChange={(e) => setJobTitle(e.target.value)}
                                                />
                                            </div>
                                            <div className="form-group">
                                                <label className="label">Company (Optional)</label>
                                                <input
                                                    type="text"
                                                    className="input"
                                                    placeholder="e.g., Google"
                                                    value={company}
                                                    onChange={(e) => setCompany(e.target.value)}
                                                />
                                            </div>
                                        </div>
                                        <div className="form-group">
                                            <label className="label">Job Description *</label>
                                            <textarea
                                                className="textarea"
                                                placeholder="Paste the complete job description here including responsibilities, requirements, and qualifications..."
                                                value={jobDescription}
                                                onChange={(e) => setJobDescription(e.target.value)}
                                                rows={8}
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label className="label">Experience Level</label>
                                            <select
                                                className="select"
                                                value={experienceLevel}
                                                onChange={(e) => setExperienceLevel(e.target.value)}
                                            >
                                                <option value="fresher">Fresher / Entry Level</option>
                                                <option value="professional">Professional / Mid Level</option>
                                                <option value="senior">Senior / Lead</option>
                                                <option value="switcher">Career Switcher</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>

                                {/* Resume Input Card */}
                                <div className="rb-card">
                                    <div className="rb-card-header">
                                        <div className="rb-card-icon">
                                            <FileText size={20} />
                                        </div>
                                        <div>
                                            <h3 className="rb-card-title">Your Resume</h3>
                                            <p className="rb-card-desc">Paste your resume content for analysis</p>
                                        </div>
                                    </div>
                                    <div className="rb-card-body">
                                        <div className="form-group">
                                            <label className="label">Resume Content *</label>
                                            <textarea
                                                className="textarea resume-textarea"
                                                placeholder="Paste your complete resume text here...

Include:
• Contact information
• Professional summary
• Work experience
• Education
• Skills
• Projects (if any)"
                                                value={resumeText}
                                                onChange={(e) => setResumeText(e.target.value)}
                                                rows={12}
                                            />
                                        </div>
                                        <div className="rb-word-count">
                                            {resumeText.split(/\s+/).filter(Boolean).length} words
                                        </div>
                                    </div>
                                </div>

                                {/* Action Buttons */}
                                <div className="rb-actions">
                                    {!showAnalysis ? (
                                        <button 
                                            className="btn btn-primary rb-analyze-btn"
                                            onClick={handleAnalyze}
                                            disabled={!resumeText.trim() || !jobDescription.trim()}
                                        >
                                            <BarChart3 size={18} />
                                            Analyze Resume
                                        </button>
                                    ) : (
                                        <button 
                                            className="btn btn-secondary"
                                            onClick={handleReset}
                                        >
                                            <RefreshCw size={18} />
                                            Reset Analysis
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* Results Panel */}
                            <div className="rb-results-panel">
                                {!showAnalysis ? (
                                    <div className="rb-placeholder">
                                        <div className="rb-placeholder-icon">
                                            <Target size={48} />
                                        </div>
                                        <h3>Ready to Optimize</h3>
                                        <p>Enter your job description and resume, then click "Analyze Resume" to get your ATS compatibility score and improvement suggestions.</p>
                                        <div className="rb-placeholder-features">
                                            <div className="rb-placeholder-feature">
                                                <CheckCircle size={16} />
                                                <span>Keyword Analysis</span>
                                            </div>
                                            <div className="rb-placeholder-feature">
                                                <CheckCircle size={16} />
                                                <span>Skill Gap Detection</span>
                                            </div>
                                            <div className="rb-placeholder-feature">
                                                <CheckCircle size={16} />
                                                <span>Section Review</span>
                                            </div>
                                            <div className="rb-placeholder-feature">
                                                <CheckCircle size={16} />
                                                <span>Actionable Tips</span>
                                            </div>
                                        </div>
                                    </div>
                                ) : analysis ? (
                                    <div className="rb-analysis-results animate-fadeIn">
                                        {/* ATS Score Card */}
                                        <div className="rb-score-card">
                                            <div className="rb-score-header">
                                                <h3>ATS Match Summary</h3>
                                                <span className={`rb-match-badge ${analysis.matchLevel.toLowerCase()}`}>
                                                    {analysis.matchLevel} Match
                                                </span>
                                            </div>
                                            <div className="rb-score-main">
                                                <div 
                                                    className="rb-score-circle"
                                                    style={{ background: getScoreGradient(analysis.atsScore) }}
                                                >
                                                    <span className="rb-score-value">{analysis.atsScore}</span>
                                                    <span className="rb-score-label">ATS Score</span>
                                                </div>
                                            </div>
                                            <div className="rb-score-details">
                                                <div className="rb-score-item">
                                                    <div className="rb-score-item-header">
                                                        <span>Skill Match</span>
                                                        <span className={getScoreColor(analysis.skillScore)}>
                                                            {analysis.skillScore}%
                                                        </span>
                                                    </div>
                                                    <div className="rb-progress-bar">
                                                        <div 
                                                            className={`rb-progress-fill ${getScoreColor(analysis.skillScore)}`}
                                                            style={{ width: `${analysis.skillScore}%` }}
                                                        />
                                                    </div>
                                                </div>
                                                <div className="rb-score-item">
                                                    <div className="rb-score-item-header">
                                                        <span>Keyword Coverage</span>
                                                        <span className={getScoreColor(analysis.keywordScore)}>
                                                            {analysis.keywordScore}%
                                                        </span>
                                                    </div>
                                                    <div className="rb-progress-bar">
                                                        <div 
                                                            className={`rb-progress-fill ${getScoreColor(analysis.keywordScore)}`}
                                                            style={{ width: `${analysis.keywordScore}%` }}
                                                        />
                                                    </div>
                                                </div>
                                                <div className="rb-score-item">
                                                    <div className="rb-score-item-header">
                                                        <span>Section Completeness</span>
                                                        <span className={getScoreColor(analysis.sectionScore)}>
                                                            {analysis.sectionScore}%
                                                        </span>
                                                    </div>
                                                    <div className="rb-progress-bar">
                                                        <div 
                                                            className={`rb-progress-fill ${getScoreColor(analysis.sectionScore)}`}
                                                            style={{ width: `${analysis.sectionScore}%` }}
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Skill Gap Analysis */}
                                        <div className="rb-analysis-section">
                                            <button 
                                                className="rb-section-toggle"
                                                onClick={() => toggleSection('skills')}
                                            >
                                                <div className="rb-section-title">
                                                    <Award size={18} />
                                                    <span>Skill Gap Analysis</span>
                                                </div>
                                                {expandedSections.skills ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                                            </button>
                                            {expandedSections.skills && (
                                                <div className="rb-section-content animate-fadeIn">
                                                    {analysis.matchedSkills.length > 0 && (
                                                        <div className="rb-skill-group">
                                                            <h4 className="rb-skill-group-title matched">
                                                                <CheckCircle size={14} />
                                                                Matched Skills ({analysis.matchedSkills.length})
                                                            </h4>
                                                            <div className="rb-tags">
                                                                {analysis.matchedSkills.map((skill, i) => (
                                                                    <span key={i} className="rb-tag matched">{skill}</span>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )}
                                                    {analysis.missingSkills.length > 0 && (
                                                        <div className="rb-skill-group">
                                                            <h4 className="rb-skill-group-title missing">
                                                                <AlertCircle size={14} />
                                                                Missing Skills ({analysis.missingSkills.length})
                                                            </h4>
                                                            <div className="rb-tags">
                                                                {analysis.missingSkills.map((skill, i) => (
                                                                    <span key={i} className="rb-tag missing">{skill}</span>
                                                                ))}
                                                            </div>
                                                            <p className="rb-skill-note">
                                                                <AlertCircle size={12} />
                                                                Only add skills you actually possess
                                                            </p>
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>

                                        {/* Keyword Analysis */}
                                        <div className="rb-analysis-section">
                                            <button 
                                                className="rb-section-toggle"
                                                onClick={() => toggleSection('keywords')}
                                            >
                                                <div className="rb-section-title">
                                                    <Target size={18} />
                                                    <span>Keyword Analysis</span>
                                                </div>
                                                {expandedSections.keywords ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                                            </button>
                                            {expandedSections.keywords && (
                                                <div className="rb-section-content animate-fadeIn">
                                                    <div className="rb-keyword-stats">
                                                        <div className="rb-keyword-stat">
                                                            <span className="rb-keyword-stat-value">{analysis.matchedKeywords.length}</span>
                                                            <span className="rb-keyword-stat-label">Matched</span>
                                                        </div>
                                                        <div className="rb-keyword-stat">
                                                            <span className="rb-keyword-stat-value">{analysis.missingKeywords.length}</span>
                                                            <span className="rb-keyword-stat-label">Missing</span>
                                                        </div>
                                                        <div className="rb-keyword-stat">
                                                            <span className="rb-keyword-stat-value">{analysis.jdKeywords.length}</span>
                                                            <span className="rb-keyword-stat-label">Total in JD</span>
                                                        </div>
                                                    </div>
                                                    {analysis.missingKeywords.length > 0 && (
                                                        <div className="rb-missing-keywords">
                                                            <h4>Top Missing Keywords</h4>
                                                            <div className="rb-tags">
                                                                {analysis.missingKeywords.slice(0, 15).map((keyword, i) => (
                                                                    <span key={i} className="rb-tag keyword">{keyword}</span>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>

                                        {/* Suggestions */}
                                        <div className="rb-analysis-section">
                                            <button 
                                                className="rb-section-toggle"
                                                onClick={() => toggleSection('suggestions')}
                                            >
                                                <div className="rb-section-title">
                                                    <Lightbulb size={18} />
                                                    <span>Improvement Suggestions</span>
                                                </div>
                                                {expandedSections.suggestions ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                                            </button>
                                            {expandedSections.suggestions && (
                                                <div className="rb-section-content animate-fadeIn">
                                                    {analysis.suggestions.length > 0 ? (
                                                        <div className="rb-suggestions-list">
                                                            {analysis.suggestions.map((suggestion, i) => (
                                                                <div key={i} className={`rb-suggestion ${suggestion.type}`}>
                                                                    <div className="rb-suggestion-header">
                                                                        <span className="rb-suggestion-section">{suggestion.section}</span>
                                                                        <span className={`rb-suggestion-priority ${suggestion.priority}`}>
                                                                            {suggestion.priority}
                                                                        </span>
                                                                    </div>
                                                                    <p className="rb-suggestion-message">{suggestion.message}</p>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    ) : (
                                                        <div className="rb-no-suggestions">
                                                            <CheckCircle size={24} />
                                                            <p>Great job! Your resume is well-optimized for this role.</p>
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>

                                        {/* Section Checklist */}
                                        <div className="rb-section-checklist">
                                            <h4>Resume Sections</h4>
                                            <div className="rb-checklist-grid">
                                                {Object.entries(analysis.sections).map(([section, present]) => (
                                                    <div key={section} className={`rb-checklist-item ${present ? 'present' : 'missing'}`}>
                                                        {present ? <CheckCircle size={14} /> : <AlertCircle size={14} />}
                                                        <span>{section.charAt(0).toUpperCase() + section.slice(1)}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Ethical Statement */}
                                        <div className="rb-ethical-statement">
                                            <Shield size={16} />
                                            <p>
                                                All suggestions are based strictly on your provided information. 
                                                No experience, skill, or achievement has been added or fabricated.
                                            </p>
                                        </div>
                                    </div>
                                ) : null}
                            </div>
                        </div>
                    </div>
                </section>

                {/* Tips Section */}
                <section className="rb-tips section">
                    <div className="container">
                        <h2 className="section-title text-center">ATS Optimization Tips</h2>
                        <p className="section-subtitle text-center mb-4">
                            Maximize your chances of getting past Applicant Tracking Systems
                        </p>
                        <div className="rb-tips-grid">
                            <div className="rb-tip-card">
                                <div className="rb-tip-icon">
                                    <FileText size={24} />
                                </div>
                                <h3>Use Standard Formatting</h3>
                                <p>Stick to clean, simple formatting. Avoid tables, columns, headers/footers, and graphics that ATS can't parse.</p>
                            </div>
                            <div className="rb-tip-card">
                                <div className="rb-tip-icon">
                                    <Target size={24} />
                                </div>
                                <h3>Mirror Job Keywords</h3>
                                <p>Use exact keywords from the job description naturally throughout your resume, especially in skills and experience sections.</p>
                            </div>
                            <div className="rb-tip-card">
                                <div className="rb-tip-icon">
                                    <TrendingUp size={24} />
                                </div>
                                <h3>Quantify Achievements</h3>
                                <p>Use numbers to demonstrate impact: "Increased sales by 25%" or "Managed team of 8 engineers".</p>
                            </div>
                            <div className="rb-tip-card">
                                <div className="rb-tip-icon">
                                    <Award size={24} />
                                </div>
                                <h3>Include All Sections</h3>
                                <p>Ensure your resume has Contact, Summary, Experience, Education, and Skills sections clearly labeled.</p>
                            </div>
                        </div>
                    </div>
                </section>
            </div>
        </>
    );
}

export default ResumeBuilder;
