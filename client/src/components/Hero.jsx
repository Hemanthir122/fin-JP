import { Link } from 'react-router-dom';
import { Sparkles, ArrowRight, Briefcase, Users, Building2 } from 'lucide-react';
import './Hero.css';

function Hero() {
    const stats = [
        { icon: Briefcase, value: '10,000+', label: 'Active Jobs' },
        { icon: Users, value: '50,000+', label: 'Job Seekers' },
        { icon: Building2, value: '500+', label: 'Companies' },
    ];

    return (
        <section className="hero">
            <div className="hero-bg">
                <div className="hero-gradient"></div>
                <div className="hero-glow"></div>
                <div className="hero-particles">
                    {[...Array(20)].map((_, i) => (
                        <div key={i} className="particle" style={{
                            left: `${Math.random() * 100}%`,
                            top: `${Math.random() * 100}%`,
                            animationDelay: `${Math.random() * 5}s`,
                            animationDuration: `${5 + Math.random() * 10}s`
                        }}></div>
                    ))}
                </div>
            </div>

            <div className="hero-container container">
                <div className="hero-content">
                    <div className="hero-badge animate-fadeIn">
                        <Sparkles size={16} />
                        <span>Your Career Journey Starts Here</span>
                    </div>

                    <h1 className="hero-title animate-fadeIn stagger-1">
                        Find Your Dream Job with{' '}
                        <span className="gradient-text">JobConnects</span>
                    </h1>

                    <p className="hero-subtitle animate-fadeIn stagger-2">
                        Discover thousands of job opportunities from top companies.
                        Whether you're looking for full-time positions, internships,
                        or walk-in interviews, we've got you covered.
                    </p>

                    <div className="hero-buttons animate-fadeIn stagger-3">
                        <Link to="/jobs" className="btn btn-primary btn-lg">
                            Explore Jobs
                            <ArrowRight size={18} />
                        </Link>
                        <Link to="/about" className="btn btn-secondary btn-lg">
                            Learn More
                        </Link>
                    </div>

                    {/* Stats section removed as per request */}
                </div>
            </div>
        </section>
    );
}

export default Hero;
