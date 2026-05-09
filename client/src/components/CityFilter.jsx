import { useState, useRef, useEffect } from 'react';
import { MapPin, X, ChevronDown } from 'lucide-react';
import { CITY_DATA } from '../data/cityData';
import './CityFilter.css';

/**
 * CityFilter — multiselect city picker for a given country.
 * Props:
 *   country      — currently selected country name
 *   selected     — array of selected city names
 *   onChange     — (cities: string[]) => void
 */
function CityFilter({ country, selected = [], onChange }) {
    const [open, setOpen] = useState(false);
    const ref = useRef(null);

    const countryData = country ? CITY_DATA[country] : null;
    const cities = countryData?.cities || [];

    // Close on outside click
    useEffect(() => {
        const handler = (e) => {
            if (ref.current && !ref.current.contains(e.target)) setOpen(false);
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    if (!country || cities.length === 0) return null;

    const toggle = (cityName) => {
        const next = selected.includes(cityName)
            ? selected.filter(c => c !== cityName)
            : [...selected, cityName];
        onChange(next);
    };

    const clearAll = (e) => {
        e.stopPropagation();
        onChange([]);
    };

    const label = selected.length === 0
        ? 'All Cities'
        : selected.length === 1
            ? selected[0]
            : `${selected.length} cities`;

    return (
        <div className="city-filter" ref={ref}>
            <button
                className={`city-filter-trigger ${open ? 'open' : ''} ${selected.length > 0 ? 'has-selection' : ''}`}
                onClick={() => setOpen(o => !o)}
                type="button"
            >
                <MapPin size={16} className="city-filter-icon" />
                <span className="city-filter-label">{label}</span>
                {selected.length > 0 && (
                    <span className="city-filter-count">{selected.length}</span>
                )}
                {selected.length > 0
                    ? <X size={14} className="city-filter-clear" onClick={clearAll} />
                    : <ChevronDown size={14} className={`city-filter-chevron ${open ? 'rotated' : ''}`} />
                }
            </button>

            {open && (
                <div className="city-filter-dropdown">
                    <div className="city-filter-header">
                        <span>Select cities in {country}</span>
                        {selected.length > 0 && (
                            <button className="city-filter-clear-all" onClick={() => onChange([])}>
                                Clear all
                            </button>
                        )}
                    </div>
                    <div className="city-filter-list">
                        {cities.map((city) => {
                            const isSelected = selected.includes(city.name);
                            return (
                                <button
                                    key={city.name}
                                    className={`city-option ${isSelected ? 'selected' : ''}`}
                                    onClick={() => toggle(city.name)}
                                    type="button"
                                >
                                    <span className="city-option-check">
                                        {isSelected && (
                                            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                                                <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                            </svg>
                                        )}
                                    </span>
                                    <span className="city-option-name">{city.name}</span>
                                    {city.aliases.length > 1 && (
                                        <span className="city-option-alias">
                                            {city.aliases.filter(a => a !== city.name)[0]}
                                        </span>
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
}

export default CityFilter;
