import { Link } from 'react-router-dom';
import { Target, Users, Shield, Zap, Award, Heart } from 'lucide-react';
import './About.css';

function About() {
    const values = [
        {
            icon: Target,
            title: 'Our Mission',
            description:
                'To help students, freshers, and professionals discover relevant job opportunities easily through a simple and transparent platform.'
        },
        {
            icon: Users,
            title: 'Community First',
            description:
                'We aim to support job seekers by sharing verified job-related information and helping them stay updated with opportunities.'
        },
        {
            icon: Shield,
            title: 'Transparency',
            description:
                'We clearly inform users that job availability depends on employers and positions may be filled at any time.'
        },
        {
            icon: Zap,
            title: 'Daily Updates',
            description:
                'New job listings are added regularly to keep users informed about the latest opportunities.'
        },
        {
            icon: Award,
            title: 'Free Access',
            description:
                'JobConnects is completely free for job seekers and is built to support students and early-career professionals.'
        },
        {
            icon: Heart,
            title: 'User Respect',
            description:
                'We respect user privacy and do not sell or misuse personal information.'
        }
    ];

    return (
        <div className="about-page">
            <div className="page-header">
                <div className="container">
                    <h1 className="page-title">About JobConnects</h1>
                    <p className="page-subtitle">
                        A free job discovery platform built to help students and job seekers find opportunities.
                    </p>
                </div>
            </div>

            <div className="container">

                {/* Story Section */}
                <section className="about-section">
                    <div className="story-content">
                        <div className="story-text">
                            <h2>Who We Are</h2>
                            <p>
                                JobConnects is an online job listing and job discovery platform created to help
                                students, fresh graduates, and professionals stay informed about job openings,
                                internships, and walk-in opportunities.
                            </p>

                            <p>
                                We collect and organize job-related information from publicly available sources
                                and employer submissions. Job listings on our platform are provided for
                                informational purposes only.
                            </p>

                            <p>
                                To keep information relevant and updated, job listings are automatically removed
                                after <strong>30 days</strong>. Positions may also be filled or closed by employers
                                at any time without prior notice.
                            </p>

                            <p>
                                JobConnects is completely <strong>free to use</strong>. We do not charge job seekers
                                for accessing job listings, and our goal is to help users discover opportunities
                                easily and efficiently.
                            </p>
                        </div>

                        <div className="story-stats">
                            <div className="stat-box">
                                <span className="stat-number">Daily</span>
                                <span className="stat-label">New Jobs Added</span>
                            </div>
                            <div className="stat-box">
                                <span className="stat-number">100%</span>
                                <span className="stat-label">Free for Job Seekers</span>
                            </div>
                            <div className="stat-box">
                                <span className="stat-number">30 Days</span>
                                <span className="stat-label">Auto Job Expiry</span>
                            </div>
                            <div className="stat-box">
                                <span className="stat-number">Student</span>
                                <span className="stat-label">Focused Platform</span>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Values Section */}
                <section className="about-section values-section">
                    <h2 className="section-title text-center">What We Stand For</h2>
                    <p className="section-subtitle text-center">
                        Honest information, transparency, and user-first experience
                    </p>

                    <div className="values-grid">
                        {values.map((value, index) => (
                            <div key={index} className="value-card card">
                                <div className="value-icon">
                                    <value.icon size={28} />
                                </div>
                                <h3>{value.title}</h3>
                                <p>{value.description}</p>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Data & Privacy Notice */}
                <section className="about-section">
                    <h2>Data & Privacy</h2>
                    <p>
                        We respect user privacy. JobConnects does not sell user data to third parties.
                        Any information collected is used only to improve platform functionality
                        and user experience, as described in our Privacy Policy.
                    </p>
                </section>

                {/* CTA Section */}
                <section className="about-cta glass">
                    <h2>Looking for Job Opportunities?</h2>
                    <p>
                        Explore daily job updates and find opportunities that match your skills and interests.
                    </p>
                    <div className="cta-buttons">
                        <Link to="/jobs" className="btn btn-primary btn-lg">
                            Browse Jobs
                        </Link>
                        <Link to="/contact" className="btn btn-secondary btn-lg">
                            Contact Us
                        </Link>
                    </div>
                </section>

            </div>
        </div>
    );
}

export default About;
