import './AdsterraSmartLink.css';

/**
 * Adsterra Smart Link Ad Component
 * Placement: Between Job Description and About Company
 * Style: Soft informational card
 */
function AdsterraSmartLink() {
    const smartLinkUrl = 'https://breachuptown.com/jnv7mma2?key=d47de908fdd389381c8131eaa2a36085';

    const handleClick = (e) => {
        e.preventDefault();
        window.open(smartLinkUrl, '_blank', 'noopener,noreferrer');
    };

    return (
        <div className="ad-smart-link-wrapper">
            <div className="ad-label-small">Sponsored</div>
            <a 
                href={smartLinkUrl}
                onClick={handleClick}
                className="ad-smart-link-card"
                rel="noopener noreferrer nofollow"
                target="_blank"
            >
                <div className="ad-smart-link-content">
                    <div className="ad-smart-link-icon">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M13 2L3 14h8l-1 8 10-12h-8l1-8z" fill="currentColor"/>
                        </svg>
                    </div>
                    <div className="ad-smart-link-text">
                        <h4>Explore More Opportunities</h4>
                        <p>Discover additional career resources and job listings</p>
                    </div>
                    <div className="ad-smart-link-arrow">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                    </div>
                </div>
            </a>
        </div>
    );
}

export default AdsterraSmartLink;
