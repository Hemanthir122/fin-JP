import { Link } from 'react-router-dom';
import './CareerResources.css';

const SMARTLINK = 'https://breachuptown.com/jnv7mma2?key=d47de908fdd389381c8131eaa2a36085';

const resources = [
    {
        icon: '📄',
        title: 'Resume Builder',
        desc: 'Create a professional resume in minutes with our free builder.',
        cta: 'Build Resume',
        href: '/resume-builder',
        external: false,
        accent: '#2563eb',
        bg: '#eff6ff',
        border: '#bfdbfe',
    },
    {
        icon: '🤖',
        title: 'AI Resume Checker',
        desc: 'Get instant AI feedback to improve your resume score.',
        cta: 'Check Resume',
        href: SMARTLINK,
        external: true,
        accent: '#7c3aed',
        bg: '#f5f3ff',
        border: '#ddd6fe',
    },
    {
        icon: '✈️',
        title: 'Work Abroad Guide',
        desc: 'Step-by-step guide to landing visa-sponsored jobs globally.',
        cta: 'Work Abroad',
        href: SMARTLINK,
        external: true,
        accent: '#0891b2',
        bg: '#ecfeff',
        border: '#a5f3fc',
    },
    {
        icon: '🏠',
        title: 'Remote Work Guide',
        desc: 'Everything you need to land and thrive in remote roles.',
        cta: 'View Guide',
        href: SMARTLINK,
        external: true,
        accent: '#16a34a',
        bg: '#f0fdf4',
        border: '#bbf7d0',
    },
    {
        icon: '💰',
        title: 'Salary Insights',
        desc: 'Know your worth — compare salaries across roles and cities.',
        cta: 'Explore Salaries',
        href: SMARTLINK,
        external: true,
        accent: '#d97706',
        bg: '#fffbeb',
        border: '#fde68a',
    },
    {
        icon: '🎯',
        title: 'Interview Prep',
        desc: 'Practice with real interview questions from top companies.',
        cta: 'Start Practicing',
        href: SMARTLINK,
        external: true,
        accent: '#e11d48',
        bg: '#fff1f2',
        border: '#fecdd3',
    },
];

function CareerResources() {
    const handleExternal = (e, href) => {
        e.preventDefault();
        window.open(href, '_blank', 'noopener,noreferrer');
    };

    return (
        <section className="career-resources-section section">
            <div className="container">
                <div className="career-resources-header">
                    <div>
                        <h2 className="section-title">Career Resources</h2>
                        <p className="section-subtitle">Tools and guides to accelerate your career journey</p>
                    </div>
                </div>
                <div className="career-resources-grid">
                    {resources.map((r, i) => (
                        <a
                            key={i}
                            href={r.href}
                            className="career-resource-card"
                            style={{ '--card-accent': r.accent, '--card-bg': r.bg, '--card-border': r.border }}
                            onClick={r.external ? (e) => handleExternal(e, r.href) : undefined}
                            target={r.external ? '_blank' : '_self'}
                            rel={r.external ? 'noopener noreferrer nofollow' : undefined}
                        >
                            <div className="cr-icon-wrap">
                                <span className="cr-icon">{r.icon}</span>
                            </div>
                            <div className="cr-body">
                                <h4 className="cr-title">{r.title}</h4>
                                <p className="cr-desc">{r.desc}</p>
                            </div>
                            <span className="cr-cta">{r.cta} →</span>
                        </a>
                    ))}
                </div>
            </div>
        </section>
    );
}

export default CareerResources;
