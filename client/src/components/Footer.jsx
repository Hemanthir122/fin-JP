import { Link } from 'react-router-dom';
import './Footer.css';

function Footer() {
    const currentYear = new Date().getFullYear();

    const quickLinks = [
        { path: '/',            label: 'Home' },
        { path: '/jobs',        label: 'Jobs' },
        { path: '/internships', label: 'Internships' },
    ];

    const legalLinks = [
        { path: '/about',   label: 'About Us' },
        { path: '/contact', label: 'Contact' },
        { path: '/terms',   label: 'Terms & Conditions' },
        { path: '/privacy', label: 'Privacy Policy' },
    ];

    return (
        <footer className="footer">
            <div className="footer-container container">
                <div className="footer-grid">

                    {/* ── Brand ── */}
                    <div className="footer-brand">
                        <Link to="/" className="footer-logo">
                            <img src="/logo.png" alt="JobConnects" className="footer-logo-img"
                                onError={(e) => { e.target.style.display='none'; e.target.nextSibling.style.display='flex'; }}
                            />
                            <span className="footer-logo-text" style={{display:'none'}}>
                                <span className="logo-text">Job</span>
                                <span className="logo-accent">Connects</span>
                            </span>
                        </Link>
                        <p className="footer-description">
                            Your trusted platform for finding the best jobs, internships, and walk-in
                            opportunities. Connect with top companies and take the next step in your career.
                        </p>
                        <div className="footer-social">
                            {/* WhatsApp */}
                            <a href="https://whatsapp.com/channel/0029Vb7UYwn5fM5aKOdsPI1D"
                                target="_blank" rel="noopener noreferrer"
                                className="social-link social-wa" aria-label="WhatsApp">
                                <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                                </svg>
                            </a>
                            {/* Instagram */}
                            <a href="https://www.instagram.com/jobsconnect28"
                                target="_blank" rel="noopener noreferrer"
                                className="social-link social-ig" aria-label="Instagram">
                                <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                                </svg>
                            </a>
                            {/* Telegram */}
                            <a href="https://t.me/jobsconnect28"
                                target="_blank" rel="noopener noreferrer"
                                className="social-link social-tg" aria-label="Telegram">
                                <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                                    <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
                                </svg>
                            </a>
                            {/* LinkedIn */}
                            <a href="https://linkedin.com/company/jobconnects"
                                target="_blank" rel="noopener noreferrer"
                                className="social-link social-li" aria-label="LinkedIn">
                                <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                                </svg>
                            </a>
                        </div>
                    </div>

                    {/* ── Quick Links ── */}
                    <div className="footer-section">
                        <h4 className="footer-title">Quick Links</h4>
                        <ul className="footer-links">
                            {quickLinks.map((link) => (
                                <li key={link.path}>
                                    <Link to={link.path}>{link.label}</Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* ── Legal ── */}
                    <div className="footer-section">
                        <h4 className="footer-title">Legal</h4>
                        <ul className="footer-links">
                            {legalLinks.map((link) => (
                                <li key={link.path}>
                                    <Link to={link.path}>{link.label}</Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* ── Contact ── */}
                    <div className="footer-section">
                        <h4 className="footer-title">Get in Touch</h4>
                        <ul className="footer-contact">
                            <li>
                                <span className="contact-label">EMAIL:</span>
                                <a href="mailto:technifyz@technifyz.online">technifyz@technifyz.online</a>
                            </li>
                            <li>
                                <span className="contact-label">SUPPORT:</span>
                                <a href="mailto:technifyz@technifyz.online">technifyz@technifyz.online</a>
                            </li>
                        </ul>
                    </div>

                    {/* ── Globe Illustration ── */}
                    <div className="footer-globe-wrap">
                        <svg viewBox="0 0 220 200" className="footer-globe-svg" xmlns="http://www.w3.org/2000/svg">
                            <defs>
                                <radialGradient id="fg1" cx="40%" cy="35%">
                                    <stop offset="0%" stopColor="#dbeafe"/>
                                    <stop offset="100%" stopColor="#c7d2fe"/>
                                </radialGradient>
                            </defs>
                            <circle cx="110" cy="95" r="80" fill="url(#fg1)" opacity="0.7"/>
                            {[30,55,80,105,130,155].map((y,i) => (
                                <ellipse key={i} cx="110" cy={y} rx="80" ry={Math.abs(y-95)*0.35+8}
                                    fill="none" stroke="#93c5fd" strokeWidth="0.7" opacity="0.5"/>
                            ))}
                            {[0,36,72,108,144].map((a,i) => (
                                <ellipse key={i} cx="110" cy="95" rx={Math.sin(a*Math.PI/180)*80+4} ry="80"
                                    fill="none" stroke="#93c5fd" strokeWidth="0.7" opacity="0.5"/>
                            ))}
                            <circle cx="85"  cy="70"  r="5" fill="#2563eb" opacity="0.9"/>
                            <circle cx="140" cy="85"  r="5" fill="#7c3aed" opacity="0.9"/>
                            <circle cx="110" cy="120" r="5" fill="#ea580c" opacity="0.9"/>
                            {/* Briefcase */}
                            <rect x="88" y="155" width="44" height="32" rx="5" fill="#2563eb" opacity="0.85"/>
                            <rect x="98" y="150" width="24" height="10" rx="3" fill="#1d4ed8" opacity="0.85"/>
                            <line x1="110" y1="155" x2="110" y2="187" stroke="white" strokeWidth="1.5" opacity="0.6"/>
                            <line x1="88" y1="168" x2="132" y2="168" stroke="white" strokeWidth="1.5" opacity="0.6"/>
                            {/* Plant */}
                            <rect x="155" y="170" width="14" height="20" rx="3" fill="#16a34a" opacity="0.7"/>
                            <ellipse cx="162" cy="162" rx="12" ry="14" fill="#22c55e" opacity="0.7"/>
                            <ellipse cx="152" cy="168" rx="9" ry="10" fill="#16a34a" opacity="0.6"/>
                        </svg>
                    </div>
                </div>

                {/* ── Bottom Bar ── */}
                <div className="footer-bottom">
                    <p>&copy; {currentYear} JobConnects. All rights reserved.</p>
                    <p className="footer-disclaimer">
                        JobConnects is a job listing platform. We are not responsible for the
                        accuracy of job postings or the actions of employers.
                    </p>
                </div>
            </div>
        </footer>
    );
}

export default Footer;
