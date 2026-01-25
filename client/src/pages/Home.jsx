import { useState, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Target, Zap, Shield, Users } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import Hero from '../components/Hero';
import JobCard from '../components/JobCard';
import JobFilter from '../components/JobFilter';
import { useLatestJobs, useCompanies, useLocations } from '../hooks/useJobs';
import './Home.css';

function Home() {
    const [filters, setFilters] = useState({});

    // React Query hooks - cached and deduplicated
    const { data: jobs = [], isLoading: jobsLoading } = useLatestJobs();
    const { data: companies = [] } = useCompanies();
    const { data: locations = [] } = useLocations();

    const loading = jobsLoading;

    // Client-side filtering on already fetched data
    const filteredJobs = useMemo(() => {
        let result = [...jobs];
        const { search, location, type, company } = filters;

        if (search) {
            const searchLower = search.toLowerCase();
            result = result.filter(job =>
                job.title.toLowerCase().includes(searchLower) ||
                job.company.toLowerCase().includes(searchLower) ||
                job.location.toLowerCase().includes(searchLower)
            );
        }

        if (location) {
            result = result.filter(job =>
                job.location.toLowerCase().includes(location.toLowerCase())
            );
        }

        if (type) {
            result = result.filter(job => job.type === type);
        }

        if (company) {
            result = result.filter(job =>
                job.company.toLowerCase().includes(company.toLowerCase())
            );
        }

        return result;
    }, [jobs, filters]);

    const handleFilter = useCallback((newFilters) => {
        setFilters(newFilters);
    }, []);

    const features = [
        {
            icon: Target,
            title: 'Curated Opportunities',
            description: 'Hand-picked jobs from verified companies across industries'
        },
        {
            icon: Zap,
            title: 'Quick Apply',
            description: 'Apply to multiple jobs instantly with your profile'
        },
        {
            icon: Shield,
            title: 'Verified Listings',
            description: 'All job postings are verified for authenticity'
        },
        {
            icon: Users,
            title: 'Career Support',
            description: 'Get guidance and support throughout your job search'
        }
    ];

    return (
        <div className="home-page">
            <Helmet>
                <title>JobConnects - Find Best Jobs, Internships & Walk-ins in India</title>
                <meta name="description" content="Find the latest jobs, internships, and walk-in drive opportunities in India. Connect with top recruitng companies like TCS, Infosys, Wipro, and more." />
                <link rel="canonical" href="https://jobconnects.online/" />
            </Helmet>
            <Hero />

            {/* About Section */}
            <section className="section about-section">
                <div className="container">
                    <div className="about-content">
                        <h2 className="section-title">Why Choose JobConnects?</h2>
                        <p className="section-subtitle">
                            We connect talented individuals with their dream careers. Our platform
                            makes job hunting simple, efficient, and effective.
                        </p>
                    </div>

                    <div className="features-grid">
                        {features.map((feature, index) => (
                            <div key={index} className="feature-card card">
                                <div className="feature-icon">
                                    <feature.icon size={28} />
                                </div>
                                <h3 className="feature-title">{feature.title}</h3>
                                <p className="feature-description">{feature.description}</p>
                            </div>
                        ))}
                    </div>

                    {/* Features Navigation Dots */}
                    <div className="features-navigation">
                        <span className="dot active"></span>
                        <span className="dot"></span>
                        <span className="dot"></span>
                    </div>
                </div>
            </section>

            {/* Jobs Section */}
            <section className="section jobs-section">
                <div className="container">
                    <div className="jobs-header">
                        <div>
                            <h2 className="section-title">Latest Opportunities</h2>
                            <p className="section-subtitle">
                                Explore the newest job openings from top companies
                            </p>
                        </div>
                    </div>

                    <JobFilter
                        onFilter={handleFilter}
                        companies={companies}
                        locations={locations}
                    />

                    {loading ? (
                        <div className="loading-container">
                            <div className="spinner"></div>
                        </div>
                    ) : filteredJobs.length > 0 ? (
                        <>
                            <div className="jobs-grid grid grid-3">
                                {filteredJobs.map((job, index) => (
                                    <div key={job._id} className={`animate-fadeIn stagger-${(index % 5) + 1}`}>
                                        <JobCard job={job} />
                                    </div>
                                ))}
                            </div>

                            <div className="view-all-container">
                                <Link to="/jobs" className="btn btn-primary btn-lg">
                                    View All Jobs
                                    <ArrowRight size={18} />
                                </Link>
                            </div>
                        </>
                    ) : (
                        <div className="empty-state">
                            <h3>No jobs found</h3>
                            <p>Try adjusting your filters to find more opportunities</p>
                        </div>
                    )}
                </div>
            </section>

            {/* CTA Section */}
            <section className="section cta-section">
                <div className="container">
                    <div className="cta-content glass">
                        <div className="cta-text">
                            <h2>Ready to Start Your Journey?</h2>
                            <p>
                                Thousands of companies are hiring right now. Find your perfect
                                match and take the next step in your career.
                            </p>
                        </div>
                        <div className="cta-buttons">
                            <Link to="/jobs" className="btn btn-primary btn-lg">
                                Browse Jobs
                            </Link>
                            <Link to="/internships" className="btn btn-secondary btn-lg">
                                Find Internships
                            </Link>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}

export default Home;
