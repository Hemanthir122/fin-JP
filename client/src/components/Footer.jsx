import { Link } from 'react-router-dom';
import { MessageCircle, Instagram, Send } from 'lucide-react';
import './Footer.css';

function Footer() {
    const currentYear = new Date().getFullYear();

    const quickLinks = [
        { path: '/', label: 'Home' },
        { path: '/jobs', label: 'Jobs' },
        { path: '/internships', label: 'Internships' },
        { path: '/walkins', label: 'Walk-ins' },
    ];

    const legalLinks = [
        { path: '/about', label: 'About Us' },
        { path: '/contact', label: 'Contact' },
        { path: '/terms', label: 'Terms & Conditions' },
        { path: '/privacy', label: 'Privacy Policy' },
    ];

    const socialLinks = [
        { href: 'https://whatsapp.com/channel/0029Vb7UYwn5fM5aKOdsPI1D', icon: MessageCircle, label: 'WhatsApp Channel' },
        { href: 'https://www.instagram.com/jobsconnect28?igsh=Y3RobnA1Zndmb242', icon: Instagram, label: 'Instagram' },
        { href: 'https://t.me/jobsconnect28', icon: Send, label: 'Telegram' },
    ];

    return (
        <footer className="footer">
            <div className="footer-container container">
                <div className="footer-grid">
                    {/* Brand Section */}
                    <div className="footer-brand">
                        {/* <Link to="/" className="footer-logo">
                            <img src="/src/assets/logo-v2.png" alt="JobsConnect" className="logo-image" />
                        </Link> */}
                        <p className="footer-description">
                            Your trusted platform for finding the best jobs, internships, and walk-in
                            opportunities. Connect with top companies and take the next step in your career.
                        </p>
                        <div className="footer-social">
                            {socialLinks.map((social, index) => (
                                <a
                                    key={index}
                                    href={social.href}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="social-link"
                                    aria-label={social.label}
                                >
                                    <social.icon size={20} />
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Quick Links */}
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

                    {/* Legal Links */}
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

                    {/* Contact Info */}
                    <div className="footer-section">
                        <h4 className="footer-title">Get in Touch</h4>
                        <ul className="footer-contact">
                            <li>
                                <span className="contact-label">Email:</span>
                                <a href="mailto:contact@jobsconnect.com">technifyz@technifyz.online</a>
                            </li>
                            <li>
                                <span className="contact-label">Support:</span>
                                <a href="mailto:support@jobsconnect.com">technifyz@technifyz.online</a>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="footer-bottom">
                    <p>&copy; {currentYear} JobsConnect. All rights reserved.</p>
                    <p className="footer-disclaimer">
                        JobsConnect is a job listing platform. We are not responsible for the
                        accuracy of job postings or the actions of employers.
                    </p>
                </div>
            </div>
        </footer>
    );
}

export default Footer;
