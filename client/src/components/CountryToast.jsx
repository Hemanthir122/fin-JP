import { useEffect, useState } from 'react';
import './CountryToast.css';

function CountryToast({ country, iso2 }) {
    const [visible, setVisible] = useState(false);
    const [show, setShow] = useState(false);

    useEffect(() => {
        if (!country) return;
        setShow(true);
        setVisible(true);
        const exitTimer   = setTimeout(() => setVisible(false), 3000);
        const removeTimer = setTimeout(() => setShow(false),    3400);
        return () => { clearTimeout(exitTimer); clearTimeout(removeTimer); };
    }, [country, iso2]);

    if (!show || !country) return null;

    return (
        <div className={`country-toast ${visible ? 'country-toast-in' : 'country-toast-out'}`}>
            {iso2 ? (
                <img
                    src={`https://flagcdn.com/w80/${iso2}.png`}
                    alt={country}
                    className="country-toast-flag-img"
                />
            ) : (
                <svg className="country-toast-flag-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="2" y="3" width="20" height="14" rx="2"/>
                    <line x1="8" y1="21" x2="16" y2="21"/>
                    <line x1="12" y1="17" x2="12" y2="21"/>
                </svg>
            )}
            <div className="country-toast-text">
                <span className="country-toast-title">Showing jobs in</span>
                <span className="country-toast-country">{country}</span>
            </div>
            <span className="country-toast-dot" />
        </div>
    );
}

export default CountryToast;
