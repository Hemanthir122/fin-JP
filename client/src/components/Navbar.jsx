import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, ChevronDown } from 'lucide-react';
import './Navbar.css';

function Navbar() {
    const [isOpen, setIsOpen] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);
    const location = useLocation();

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    useEffect(() => {
        setIsOpen(false);
    }, [location]);

    const navLinks = [
        { path: '/jobs', label: 'Jobs' },
        { path: '/internships', label: 'Internships' },
        { path: '/walkins', label: 'Walk-in/Email' },
        // { path: '/resume-builder', label: 'Resume Builder' },
    ];

    return (
        <nav className={`navbar ${isScrolled ? 'navbar-scrolled' : ''}`}>
            <div className="navbar-container container">
                <Link to="/" className="navbar-logo">
                    {/* <img src="/src/assets/Logos.png" alt="JobConnects" className="logo-image" /> */}
                    <span className="logo-text">Job</span>
                    <span className="logo-accent">Connects</span>
                </Link>

                {/* Desktop Navigation */}
                <div className="navbar-links">
                    {navLinks.map((link) => (
                        <Link
                            key={link.path}
                            to={link.path}
                            className={`navbar-link ${location.pathname === link.path ? 'active' : ''}`}
                        >
                            {link.label}
                        </Link>
                    ))}
                    <a
                        href="https://whatsapp.com/channel/0029Vb7UYwn5fM5aKOdsPI1D"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="navbar-link whatsapp-link"
                        title="Join WhatsApp Channel"
                        style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                    >
                        <svg
                            viewBox="0 0 24 24"
                            width="20"
                            height="20"
                            stroke="#25D366"
                            strokeWidth="2"
                            fill="none"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        >
                            <path d="M3 21l1.65-3.8C3.3 15.4 2.8 13.2 2.8 11c0-5 4-9 9-9s9 4 9 9-4 9-9 9c-2.1 0-4.1-.6-5.8-1.7L3 21z" />
                        </svg>
                    </a>
                </div>

                {/* Mobile Menu Button */}
                <button
                    className="navbar-toggle"
                    onClick={() => setIsOpen(!isOpen)}
                    aria-label="Toggle menu"
                >
                    {isOpen ? <X size={24} /> : <Menu size={24} />}
                </button>

                {/* Mobile Navigation */}
                <div className={`navbar-mobile ${isOpen ? 'open' : ''}`}>
                    <div className="navbar-mobile-content">
                        {navLinks.map((link) => (
                            <Link
                                key={link.path}
                                to={link.path}
                                className={`navbar-mobile-link ${location.pathname === link.path ? 'active' : ''}`}
                            >
                                {link.label}
                            </Link>
                        ))}
                        <a
                            href="https://whatsapp.com/channel/0029Vb7UYwn5fM5aKOdsPI1D"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="navbar-mobile-link whatsapp-link"
                            style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#25D366' }}
                        >
                            <svg
                                viewBox="0 0 24 24"
                                width="20"
                                height="20"
                                stroke="currentColor"
                                strokeWidth="2"
                                fill="none"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            >
                                <path d="M3 21l1.65-3.8C3.3 15.4 2.8 13.2 2.8 11c0-5 4-9 9-9s9 4 9 9-4 9-9 9c-2.1 0-4.1-.6-5.8-1.7L3 21z" />
                            </svg>
                            WhatsApp Channel
                        </a>
                    </div>
                </div>
            </div>
        </nav>
    );
}

export default Navbar;
