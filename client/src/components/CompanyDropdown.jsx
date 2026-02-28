import { useState, useRef, useEffect } from 'react';
import { Building2, ChevronDown, X } from 'lucide-react';
import './CompanyDropdown.css';

function CompanyDropdown({ companies = [], value, onChange }) {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const dropdownRef = useRef(null);

    // Convert value to array for multi-select
    const selectedCompanies = Array.isArray(value) ? value : (value ? [value] : []);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Filter companies based on search
    const filteredCompanies = companies.filter(comp =>
        comp.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleToggleCompany = (companyName) => {
        let newSelection;
        if (selectedCompanies.includes(companyName)) {
            // Remove company
            newSelection = selectedCompanies.filter(c => c !== companyName);
        } else {
            // Add company
            newSelection = [...selectedCompanies, companyName];
        }
        onChange(newSelection);
    };

    const handleClearAll = () => {
        onChange([]);
    };

    const getDisplayText = () => {
        if (selectedCompanies.length === 0) {
            return 'All Companies';
        } else if (selectedCompanies.length === 1) {
            return selectedCompanies[0];
        } else {
            return `${selectedCompanies.length} Companies Selected`;
        }
    };

    const getSelectedCompanyLogos = () => {
        if (selectedCompanies.length === 0) return null;
        
        const logos = selectedCompanies
            .slice(0, 3)
            .map(name => companies.find(c => c.name === name))
            .filter(c => c && c.logo);
        
        return logos;
    };

    const selectedLogos = getSelectedCompanyLogos();

    return (
        <div className="company-dropdown" ref={dropdownRef}>
            <div 
                className="company-dropdown-trigger"
                onClick={() => setIsOpen(!isOpen)}
            >
                <Building2 size={20} className="filter-icon" />
                
                <div className="selected-display">
                    {selectedLogos && selectedLogos.length > 0 && (
                        <div className="selected-logos-stack">
                            {selectedLogos.map((company, idx) => (
                                <img 
                                    key={idx}
                                    src={company.logo} 
                                    alt={company.name}
                                    className="company-logo-stacked"
                                    style={{ zIndex: selectedLogos.length - idx }}
                                />
                            ))}
                        </div>
                    )}
                    <span className={selectedCompanies.length === 0 ? 'placeholder' : ''}>
                        {getDisplayText()}
                    </span>
                </div>

                {selectedCompanies.length > 0 && (
                    <button
                        className="clear-selection-btn"
                        onClick={(e) => {
                            e.stopPropagation();
                            handleClearAll();
                        }}
                    >
                        <X size={16} />
                    </button>
                )}
                
                <ChevronDown 
                    size={20} 
                    className={`dropdown-arrow ${isOpen ? 'open' : ''}`}
                />
            </div>

            {isOpen && (
                <div className="company-dropdown-menu">
                    <div className="dropdown-header">
                        <div className="dropdown-search">
                            <input
                                type="text"
                                placeholder="Search companies..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="dropdown-search-input"
                                autoFocus
                            />
                        </div>
                        {selectedCompanies.length > 0 && (
                            <div className="selection-info">
                                <span>{selectedCompanies.length} selected</span>
                                <button 
                                    className="clear-all-btn"
                                    onClick={handleClearAll}
                                >
                                    Clear All
                                </button>
                            </div>
                        )}
                    </div>

                    <div className="dropdown-options">
                        {filteredCompanies.map((company, index) => {
                            const isSelected = selectedCompanies.includes(company.name);
                            
                            return (
                                <div
                                    key={index}
                                    className={`dropdown-option ${isSelected ? 'selected' : ''}`}
                                    onClick={() => handleToggleCompany(company.name)}
                                >
                                    <input
                                        type="checkbox"
                                        checked={isSelected}
                                        onChange={() => {}}
                                        className="company-checkbox"
                                    />
                                    
                                    {company.logo ? (
                                        <img 
                                            src={company.logo} 
                                            alt={company.name}
                                            className="company-logo-option"
                                        />
                                    ) : (
                                        <Building2 size={18} className="option-icon" />
                                    )}
                                    <span>{company.name}</span>
                                </div>
                            );
                        })}

                        {filteredCompanies.length === 0 && (
                            <div className="dropdown-empty">
                                No companies found
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

export default CompanyDropdown;
