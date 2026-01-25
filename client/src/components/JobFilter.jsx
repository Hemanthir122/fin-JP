import { useState, useEffect } from 'react';
import { Search, MapPin, Briefcase, Building2, X, Filter } from 'lucide-react';
import './JobFilter.css';

function JobFilter({ onFilter, companies = [], locations = [], roles = [] }) {
    const [search, setSearch] = useState('');
    const [location, setLocation] = useState('');
    const [type, setType] = useState('');
    const [company, setCompany] = useState('');
    const [isMobileOpen, setIsMobileOpen] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => {
            onFilter({ search, location, type, company });
        }, 800);

        return () => clearTimeout(timer);
    }, [search, location, type, company, onFilter]);

    const clearFilters = () => {
        setSearch('');
        setLocation('');
        setType('');
        setCompany('');
    };

    const hasFilters = search || location || type || company;

    return (
        <div className="job-filter-container">
            {/* Mobile Filter Toggle */}
            <button
                className="mobile-filter-toggle btn btn-secondary"
                onClick={() => setIsMobileOpen(!isMobileOpen)}
            >
                <Filter size={20} />
                <span>Filters</span>
                {hasFilters && <span className="filter-badge" />}
            </button>

            <div className={`job-filter glass ${isMobileOpen ? 'mobile-open' : ''}`}>
                <div className="filter-container container">
                    <div className="filter-header-mobile">
                        {/* <h3>Filters</h3> */}
                        <button className="close-filter-mobile" onClick={() => setIsMobileOpen(false)}>
                            <X size={20} />
                        </button>
                    </div>

                    <div className="filter-grid">
                        <div className="filter-item search-item">
                            <Search size={20} className="filter-icon" />
                            <input
                                type="text"
                                placeholder="Search jobs, companies..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="filter-input"
                            />
                        </div>

                        <div className="filter-item">
                            <MapPin size={20} className="filter-icon" />
                            <select
                                value={location}
                                onChange={(e) => setLocation(e.target.value)}
                                className="filter-select"
                            >
                                <option value="">All Locations</option>
                                {locations.map((loc, index) => (
                                    <option key={index} value={loc}>{loc}</option>
                                ))}
                            </select>
                        </div>

                        <div className="filter-item">
                            <Briefcase size={20} className="filter-icon" />
                            <select
                                value={type}
                                onChange={(e) => setType(e.target.value)}
                                className="filter-select"
                            >
                                <option value="">All Types</option>
                                <option value="job">Full Time Jobs</option>
                                <option value="internship">Internships</option>
                                <option value="walkin">Walk-in/Email</option>
                            </select>
                        </div>

                        <div className="filter-item">
                            <Building2 size={20} className="filter-icon" />
                            <select
                                value={company}
                                onChange={(e) => setCompany(e.target.value)}
                                className="filter-select"
                            >
                                <option value="">All Companies</option>
                                {companies.map((comp, index) => (
                                    <option key={index} value={comp.name}>{comp.name}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {hasFilters && (
                        <button className="clear-filters" onClick={clearFilters}>
                            <X size={16} />
                            Clear Filters
                        </button>
                    )}

                    <button
                        className="apply-filters-mobile btn btn-primary"
                        onClick={() => setIsMobileOpen(false)}
                    >
                        Apply Filters
                    </button>
                </div>
            </div>
        </div>
    );
}

export default JobFilter;
