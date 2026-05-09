import { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import CountryToast from './CountryToast';
import './CountryBar.css';

const STORAGE_KEY = 'jobconnects_filters';

// iso2 = 2-letter ISO code used by flagcdn.com
export const COUNTRY_LIST = [
    { value: '',              iso2: null,  label: 'All' },
    // Asia
    { value: 'India',         iso2: 'in',  label: 'India' },
    { value: 'Singapore',     iso2: 'sg',  label: 'Singapore' },
    { value: 'Japan',         iso2: 'jp',  label: 'Japan' },
    { value: 'South Korea',   iso2: 'kr',  label: 'Korea' },
    { value: 'UAE',           iso2: 'ae',  label: 'UAE' },
    { value: 'Saudi Arabia',  iso2: 'sa',  label: 'Saudi Arabia' },
    { value: 'Israel',        iso2: 'il',  label: 'Israel' },
    // Americas
    { value: 'United States', iso2: 'us',  label: 'USA' },
    { value: 'Canada',        iso2: 'ca',  label: 'Canada' },
    { value: 'Brazil',        iso2: 'br',  label: 'Brazil' },
    { value: 'Mexico',        iso2: 'mx',  label: 'Mexico' },
    // Oceania
    { value: 'Australia',     iso2: 'au',  label: 'Australia' },
    { value: 'New Zealand',   iso2: 'nz',  label: 'New Zealand' },
    // Europe — Western
    { value: 'United Kingdom',iso2: 'gb',  label: 'UK' },
    { value: 'Germany',       iso2: 'de',  label: 'Germany' },
    { value: 'France',        iso2: 'fr',  label: 'France' },
    { value: 'Netherlands',   iso2: 'nl',  label: 'Netherlands' },
    { value: 'Switzerland',   iso2: 'ch',  label: 'Switzerland' },
    { value: 'Sweden',        iso2: 'se',  label: 'Sweden' },
    { value: 'Norway',        iso2: 'no',  label: 'Norway' },
    { value: 'Denmark',       iso2: 'dk',  label: 'Denmark' },
    { value: 'Finland',       iso2: 'fi',  label: 'Finland' },
    { value: 'Ireland',       iso2: 'ie',  label: 'Ireland' },
    { value: 'Belgium',       iso2: 'be',  label: 'Belgium' },
    { value: 'Austria',       iso2: 'at',  label: 'Austria' },
    { value: 'Spain',         iso2: 'es',  label: 'Spain' },
    { value: 'Portugal',      iso2: 'pt',  label: 'Portugal' },
    { value: 'Italy',         iso2: 'it',  label: 'Italy' },
    { value: 'Luxembourg',    iso2: 'lu',  label: 'Luxembourg' },
    // Europe — Eastern & Central
    { value: 'Poland',        iso2: 'pl',  label: 'Poland' },
    { value: 'Czech Republic',iso2: 'cz',  label: 'Czechia' },
    { value: 'Romania',       iso2: 'ro',  label: 'Romania' },
    { value: 'Hungary',       iso2: 'hu',  label: 'Hungary' },
    { value: 'Ukraine',       iso2: 'ua',  label: 'Ukraine' },
    { value: 'Slovakia',      iso2: 'sk',  label: 'Slovakia' },
    { value: 'Bulgaria',      iso2: 'bg',  label: 'Bulgaria' },
    { value: 'Croatia',       iso2: 'hr',  label: 'Croatia' },
    { value: 'Serbia',        iso2: 'rs',  label: 'Serbia' },
    { value: 'Greece',        iso2: 'gr',  label: 'Greece' },
    { value: 'Estonia',       iso2: 'ee',  label: 'Estonia' },
    { value: 'Latvia',        iso2: 'lv',  label: 'Latvia' },
    { value: 'Lithuania',     iso2: 'lt',  label: 'Lithuania' },
    // Remote
    { value: 'Remote',        iso2: null,  label: 'Remote' },
];

// Returns the flag image URL or null for special entries
function flagUrl(iso2) {
    if (!iso2) return null;
    return `https://flagcdn.com/w40/${iso2}.png`;
}

// Render flag: real image for countries, SVG icon for All/Remote
function FlagImg({ iso2, label }) {
    if (iso2) {
        return (
            <img
                src={flagUrl(iso2)}
                alt={label}
                className="country-flag-img"
                loading="lazy"
                onError={(e) => { e.target.style.display = 'none'; }}
            />
        );
    }
    // "All" → globe icon, "Remote" → laptop icon (inline SVG, always works)
    if (label === 'All') {
        return (
            <svg className="country-flag-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/>
                <line x1="2" y1="12" x2="22" y2="12"/>
                <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
            </svg>
        );
    }
    // Remote
    return (
        <svg className="country-flag-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="2" y="3" width="20" height="14" rx="2"/>
            <line x1="8" y1="21" x2="16" y2="21"/>
            <line x1="12" y1="17" x2="12" y2="21"/>
        </svg>
    );
}

function loadCountry() {
    try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
            const parsed = JSON.parse(saved);
            if ('country' in parsed) return parsed.country;
        }
    } catch (e) { /* ignore */ }
    return ''; // default: All Countries
}

function saveCountry(country) {
    try {
        const saved = localStorage.getItem(STORAGE_KEY);
        const existing = saved ? JSON.parse(saved) : {};
        localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...existing, country }));
    } catch (e) { /* ignore */ }
}

function CountryBar({ onCountryChange }) {
    const [selected, setSelected] = useState(loadCountry);
    const [toast, setToast] = useState({ country: '', iso2: null, key: 0 });
    const scrollRef = useRef(null);
    const [canScrollLeft, setCanScrollLeft] = useState(false);
    const [canScrollRight, setCanScrollRight] = useState(true);
    const isFirstMount = useRef(true);

    useEffect(() => {
        const el = scrollRef.current;
        if (!el) return;
        const activeBtn = el.querySelector('.country-btn.active');
        if (activeBtn) {
            activeBtn.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
        }
        checkScroll();
        isFirstMount.current = false;
    }, []);

    const checkScroll = () => {
        const el = scrollRef.current;
        if (!el) return;
        setCanScrollLeft(el.scrollLeft > 8);
        setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 8);
    };

    const scroll = (dir) => {
        const el = scrollRef.current;
        if (!el) return;
        el.scrollBy({ left: dir * 200, behavior: 'smooth' });
    };

    const handleSelect = (value) => {
        setSelected(value);
        saveCountry(value);
        if (onCountryChange) onCountryChange(value);

        if (!isFirstMount.current) {
            const found = COUNTRY_LIST.find(c => c.value === value);
            if (found && found.value) {
                setToast(prev => ({
                    country: found.label,
                    iso2: found.iso2,
                    key: prev.key + 1,
                }));
            }
        }
    };

    return (
        <>
            <div className="country-bar-wrapper">
                {canScrollLeft && (
                    <button className="country-scroll-btn" onClick={() => scroll(-1)} aria-label="Scroll left">
                        <ChevronLeft size={16} />
                    </button>
                )}

                <div className="country-bar-track" ref={scrollRef} onScroll={checkScroll}>
                    {COUNTRY_LIST.map((c) => (
                        <button
                            key={c.value || 'all'}
                            className={`country-btn ${selected === c.value ? 'active' : ''}`}
                            onClick={() => handleSelect(c.value)}
                            title={c.value || 'All Countries'}
                        >
                            <FlagImg iso2={c.iso2} label={c.label} />
                            <span className="country-label">{c.label}</span>
                        </button>
                    ))}
                </div>

                {canScrollRight && (
                    <button className="country-scroll-btn" onClick={() => scroll(1)} aria-label="Scroll right">
                        <ChevronRight size={16} />
                    </button>
                )}
            </div>

            <CountryToast key={toast.key} country={toast.country} iso2={toast.iso2} />
        </>
    );
}

export default CountryBar;
