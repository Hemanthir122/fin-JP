import { useState, useEffect, useRef } from 'react';
import { Search, Briefcase, X, Filter, Globe, ChevronDown } from 'lucide-react';
import CompanyDropdown from './CompanyDropdown';
import CityFilter from './CityFilter';
import { getCountryForCity } from '../data/cityData';
import './JobFilter.css';

// Major countries with focus on tech job markets — using ISO codes for display
export const MAJOR_COUNTRIES = [
    { value: 'India',          iso2: 'in',  label: 'India' },
    { value: 'Singapore',      iso2: 'sg',  label: 'Singapore' },
    { value: 'Japan',          iso2: 'jp',  label: 'Japan' },
    { value: 'South Korea',    iso2: 'kr',  label: 'South Korea' },
    { value: 'UAE',            iso2: 'ae',  label: 'UAE' },
    { value: 'Saudi Arabia',   iso2: 'sa',  label: 'Saudi Arabia' },
    { value: 'Israel',         iso2: 'il',  label: 'Israel' },
    { value: 'United States',  iso2: 'us',  label: 'United States' },
    { value: 'Canada',         iso2: 'ca',  label: 'Canada' },
    { value: 'Brazil',         iso2: 'br',  label: 'Brazil' },
    { value: 'Mexico',         iso2: 'mx',  label: 'Mexico' },
    { value: 'Australia',      iso2: 'au',  label: 'Australia' },
    { value: 'New Zealand',    iso2: 'nz',  label: 'New Zealand' },
    { value: 'United Kingdom', iso2: 'gb',  label: 'United Kingdom' },
    { value: 'Germany',        iso2: 'de',  label: 'Germany' },
    { value: 'France',         iso2: 'fr',  label: 'France' },
    { value: 'Netherlands',    iso2: 'nl',  label: 'Netherlands' },
    { value: 'Switzerland',    iso2: 'ch',  label: 'Switzerland' },
    { value: 'Sweden',         iso2: 'se',  label: 'Sweden' },
    { value: 'Norway',         iso2: 'no',  label: 'Norway' },
    { value: 'Denmark',        iso2: 'dk',  label: 'Denmark' },
    { value: 'Finland',        iso2: 'fi',  label: 'Finland' },
    { value: 'Ireland',        iso2: 'ie',  label: 'Ireland' },
    { value: 'Belgium',        iso2: 'be',  label: 'Belgium' },
    { value: 'Austria',        iso2: 'at',  label: 'Austria' },
    { value: 'Spain',          iso2: 'es',  label: 'Spain' },
    { value: 'Portugal',       iso2: 'pt',  label: 'Portugal' },
    { value: 'Italy',          iso2: 'it',  label: 'Italy' },
    { value: 'Luxembourg',     iso2: 'lu',  label: 'Luxembourg' },
    { value: 'Poland',         iso2: 'pl',  label: 'Poland' },
    { value: 'Czech Republic', iso2: 'cz',  label: 'Czech Republic' },
    { value: 'Romania',        iso2: 'ro',  label: 'Romania' },
    { value: 'Hungary',        iso2: 'hu',  label: 'Hungary' },
    { value: 'Ukraine',        iso2: 'ua',  label: 'Ukraine' },
    { value: 'Slovakia',       iso2: 'sk',  label: 'Slovakia' },
    { value: 'Bulgaria',       iso2: 'bg',  label: 'Bulgaria' },
    { value: 'Croatia',        iso2: 'hr',  label: 'Croatia' },
    { value: 'Serbia',         iso2: 'rs',  label: 'Serbia' },
    { value: 'Greece',         iso2: 'gr',  label: 'Greece' },
    { value: 'Estonia',        iso2: 'ee',  label: 'Estonia' },
    { value: 'Latvia',         iso2: 'lv',  label: 'Latvia' },
    { value: 'Lithuania',      iso2: 'lt',  label: 'Lithuania' },
    { value: 'Remote',         iso2: null,  label: 'Remote / Worldwide' },
];

const STORAGE_KEY = 'jobconnects_filters';

function loadSavedFilters() {
    try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) return JSON.parse(saved);
    } catch (e) { /* ignore */ }
    return null;
}

function saveFilters(filters) {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(filters));
    } catch (e) { /* ignore */ }
}

function CountrySelect({ value, onChange }) {
    const [open, setOpen] = useState(false);
    const ref = useRef(null);

    const selected = MAJOR_COUNTRIES.find(c => c.value === value);

    useEffect(() => {
        const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    return (
        <div className="country-select-wrap" ref={ref}>
            <button
                type="button"
                className="country-select-trigger filter-input"
                onClick={() => setOpen(o => !o)}
            >
                <Globe size={18} className="cs-globe" />
                {selected?.iso2
                    ? <img src={`https://flagcdn.com/w20/${selected.iso2}.png`} alt={selected.label} className="cs-flag" />
                    : null
                }
                <span className="cs-label">{selected ? selected.label : 'All Countries'}</span>
                <ChevronDown size={16} className={`cs-chevron ${open ? 'open' : ''}`} />
            </button>

            {open && (
                <div className="country-select-dropdown">
                    <button
                        type="button"
                        className={`cs-option ${!value ? 'active' : ''}`}
                        onClick={() => { onChange(''); setOpen(false); }}
                    >
                        <Globe size={14} className="cs-option-globe" />
                        <span>All Countries</span>
                    </button>
                    {MAJOR_COUNTRIES.map(c => (
                        <button
                            key={c.value}
                            type="button"
                            className={`cs-option ${value === c.value ? 'active' : ''}`}
                            onClick={() => { onChange(c.value); setOpen(false); }}
                        >
                            {c.iso2
                                ? <img src={`https://flagcdn.com/w20/${c.iso2}.png`} alt={c.label} className="cs-flag" />
                                : <span className="cs-flag-placeholder">🌐</span>
                            }
                            <span>{c.label}</span>
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}

const JOB_TYPES = [
    { value: 'job',        label: 'Full Time',  emoji: '💼' },
    { value: 'internship', label: 'Internship', emoji: '🎓' },
];

function TypeSelect({ value, onChange }) {
    const [open, setOpen] = useState(false);
    const ref = useRef(null);

    useEffect(() => {
        const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const toggle = (val) => {
        if (value.includes(val)) onChange(value.filter(v => v !== val));
        else onChange([...value, val]);
    };

    const label = value.length === 0
        ? 'All Types'
        : value.length === 1
            ? JOB_TYPES.find(t => t.value === value[0])?.label
            : `${value.length} types`;

    return (
        <div className="country-select-wrap" ref={ref}>
            <button
                type="button"
                className="country-select-trigger filter-input"
                onClick={() => setOpen(o => !o)}
            >
                <Briefcase size={18} className="cs-globe" />
                <span className="cs-label">{label}</span>
                {value.length > 0 && (
                    <span className="ts-count">{value.length}</span>
                )}
                <ChevronDown size={16} className={`cs-chevron ${open ? 'open' : ''}`} />
            </button>

            {open && (
                <div className="country-select-dropdown">
                    {JOB_TYPES.map(t => {
                        const checked = value.includes(t.value);
                        return (
                            <button
                                key={t.value}
                                type="button"
                                className={`cs-option ${checked ? 'active' : ''}`}
                                onClick={() => toggle(t.value)}
                            >
                                <span className="ts-checkbox">{checked ? '✓' : ''}</span>
                                <span>{t.emoji} {t.label}</span>
                            </button>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

function JobFilter({ onFilter, companies = [], locations = [], roles = [] }) {
    const saved = loadSavedFilters();

    const [search,   setSearch]   = useState(saved?.search   || '');
    const [types,    setTypes]    = useState(Array.isArray(saved?.types) ? saved.types : (saved?.type ? [saved.type] : []));
    const [company,  setCompany]  = useState(saved?.company  || []);
    const [country,  setCountry]  = useState(saved?.country  ?? '');
    const [cities,   setCities]   = useState(saved?.cities   || []);
    const [isMobileOpen, setIsMobileOpen] = useState(false);

    // Lock body scroll and hide CountryBar when filter is open
    useEffect(() => {
        if (isMobileOpen) {
            document.body.classList.add('filter-open');
            document.body.style.overflow = 'hidden';
        } else {
            document.body.classList.remove('filter-open');
            document.body.style.overflow = '';
        }
        return () => {
            document.body.classList.remove('filter-open');
            document.body.style.overflow = '';
        };
    }, [isMobileOpen]);

    // Emit filters on any change
    useEffect(() => {
        const filters = { search, types, company, country, cities };        saveFilters(filters);
        const timer = setTimeout(() => onFilter(filters), 300);
        return () => clearTimeout(timer);
    }, [search, types, company, country, cities, onFilter]);

    // When country changes, clear city selection
    const handleCountryChange = (val) => {
        setCountry(val);
        setCities([]);
    };

    // When cities change — if a city is selected and no country set, auto-detect country
    const handleCitiesChange = (newCities) => {
        setCities(newCities);
        if (!country && newCities.length > 0) {
            const detected = getCountryForCity(newCities[0]);
            if (detected) setCountry(detected);
        }
    };

    const clearFilters = () => {
        setSearch('');
        setTypes([]);
        setCompany([]);
        setCountry('');
        setCities([]);
    };

    const hasAnyFilter = search || types.length > 0 || company.length > 0 || country || cities.length > 0;
    return (
        <div className="job-filter-container">
            {/* Mobile Filter Toggle */}
            <button
                className="mobile-filter-toggle btn btn-secondary"
                onClick={() => setIsMobileOpen(!isMobileOpen)}
            >
                <Filter size={20} />
                <span>Filters</span>
                {hasAnyFilter && <span className="filter-badge" />}
            </button>

            <div className={`job-filter glass ${isMobileOpen ? 'mobile-open' : ''}`}>
                <div className="filter-container container">
                    <div className="filter-header-mobile">
                        <span className="filter-header-title">
                            <Filter size={18} /> Filters
                        </span>
                        <button className="close-filter-mobile" onClick={() => setIsMobileOpen(false)}>
                            <X size={20} /> Cancel
                        </button>
                    </div>

                    <div className="filter-grid">
                        {/* Search */}
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

                        {/* Country */}
                        <div className="filter-item">
                            <CountrySelect value={country} onChange={handleCountryChange} />
                        </div>

                        {/* City multiselect — only shown when country is selected */}
                        <div className="filter-item">
                            <CityFilter
                                country={country}
                                selected={cities}
                                onChange={handleCitiesChange}
                            />
                        </div>

                        {/* Job Type — multiselect */}
                        <div className="filter-item">
                            <TypeSelect value={types} onChange={setTypes} />
                        </div>

                        {/* Company */}
                        <div className="filter-item filter-item-company">
                            <CompanyDropdown
                                companies={companies}
                                value={company}
                                onChange={setCompany}
                            />
                        </div>
                    </div>

                    {/* Active filter chips */}
                    {hasAnyFilter && (
                        <div className="active-filters-row">
                            {country && (
                                <span className="filter-chip">
                                    {(() => {
                                        const found = MAJOR_COUNTRIES.find(c => c.value === country);
                                        return found?.iso2
                                            ? <img src={`https://flagcdn.com/w20/${found.iso2}.png`} alt={country} style={{ width: 16, height: 11, borderRadius: 2, objectFit: 'cover', marginRight: 4 }} />
                                            : null;
                                    })()}
                                    {MAJOR_COUNTRIES.find(c => c.value === country)?.label || country}
                                    <button onClick={() => handleCountryChange('')}><X size={12} /></button>
                                </span>
                            )}
                            {cities.map(city => (
                                <span key={city} className="filter-chip filter-chip-city">
                                    📍 {city}
                                    <button onClick={() => handleCitiesChange(cities.filter(c => c !== city))}><X size={12} /></button>
                                </span>
                            ))}
                            {types.map(t => {
                                const found = JOB_TYPES.find(jt => jt.value === t);
                                return (
                                    <span key={t} className="filter-chip">
                                        {found?.emoji} {found?.label}
                                        <button onClick={() => setTypes(types.filter(v => v !== t))}><X size={12} /></button>
                                    </span>
                                );
                            })}
                            {search && (
                                <span className="filter-chip">
                                    🔍 "{search}"
                                    <button onClick={() => setSearch('')}><X size={12} /></button>
                                </span>
                            )}
                            {company.length > 0 && (
                                <span className="filter-chip">
                                    🏢 {company.length} {company.length === 1 ? 'company' : 'companies'}
                                    <button onClick={() => setCompany([])}><X size={12} /></button>
                                </span>
                            )}                            {company.length > 0 && (
                                <span className="filter-chip">
                                    🏢 {company.length} {company.length === 1 ? 'company' : 'companies'}
                                    <button onClick={() => setCompany([])}><X size={12} /></button>
                                </span>
                            )}
                            <button className="clear-filters-inline" onClick={clearFilters}>
                                <X size={14} /> Clear all
                            </button>
                        </div>
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
