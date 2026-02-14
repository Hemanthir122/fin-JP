import { Building2, Clock, Lock, Eye, Share2 } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import './WalkinCard.css';

function WalkinCard({ job }) {
    const [isContactRevealed, setIsContactRevealed] = useState(false);
    const [isAdLoading, setIsAdLoading] = useState(false);
    const [showScrollIndicator, setShowScrollIndicator] = useState(true);
    const contentRef = useRef(null);

    // Scroll to bottom on mount
    useEffect(() => {
        if (contentRef.current) {
            // Scroll to bottom after a short delay to ensure content is rendered
            setTimeout(() => {
                if (contentRef.current) {
                    contentRef.current.scrollTop = contentRef.current.scrollHeight;
                }
            }, 100);
        }
    }, []);

    // Handle scroll to show/hide indicator
    const handleScroll = () => {
        if (contentRef.current) {
            const { scrollTop, scrollHeight, clientHeight } = contentRef.current;
            // Show indicator when not at the top (scrolled down)
            // Hide indicator when scrolled to top
            if (scrollTop < 20) {
                setShowScrollIndicator(false);
            } else {
                setShowScrollIndicator(true);
            }
        }
    };

    const getTimeAgo = (date) => {
        const now = new Date();
        const displayDate = job.publishedAt ? new Date(job.publishedAt) : new Date(date);
        const diffMs = now - displayDate;
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
        const diffMinutes = Math.floor(diffMs / (1000 * 60));

        if (diffMinutes < 60) {
            return `${diffMinutes}m ago`;
        } else if (diffHours < 24) {
            return `${diffHours}h ago`;
        } else if (diffDays === 1) {
            return 'Yesterday';
        } else if (diffDays < 7) {
            return `${diffDays}d ago`;
        } else if (diffDays < 30) {
            return `${Math.floor(diffDays / 7)}w ago`;
        } else {
            return `${Math.floor(diffDays / 30)}mo ago`;
        }
    };

    const handleShare = async () => {
        const platformLink = `${window.location.origin}/job/${job._id}?type=walkin`;

        const shareText = `🏢 Company: ${job.company}
💼 Walk-in / Email Opportunity
📍 ${job.location || 'Location not specified'}
${job.experience ? `👔 Experience: ${job.experience}` : ''}
${job.package ? `💰 Package: ${job.package}` : ''}
Apply now and grab this opportunity! 🚀
🔗 Apply Link:
${platformLink}`;

        try {
            if (navigator.share) {
                await navigator.share({
                    title: `Walk-in Opportunity at ${job.company}`,
                    text: shareText
                });
            } else {
                navigator.clipboard.writeText(shareText);
                alert('Walk-in details copied to clipboard!');
            }
        } catch (error) {
            console.error('Failed to share:', error);
            if (error.name !== 'AbortError') {
                navigator.clipboard.writeText(shareText);
                alert('Walk-in details copied to clipboard!');
            }
        }
    };

    // Handle contact reveal with ad
    const handleRevealContact = () => {
        if (isContactRevealed) return;
        
        // TODO: Integrate advertisement here before revealing contacts
        // Uncomment below code when ad integration is ready
        
        /*
        setIsAdLoading(true);
        
        // Trigger Google AdSense or your ad network here
        // Example: Show interstitial ad
        console.log('Showing advertisement...');
        
        // Simulate ad completion
        setTimeout(() => {
            // Only reveal if ad was completed successfully
            // In production, this should be triggered by ad completion callback
            setIsContactRevealed(true);
            setIsAdLoading(false);
            console.log('Ad completed - Contact revealed');
        }, 3000);
        
        // If you're using Google AdSense, you would do something like:
        // window.adsbygoogle = window.adsbygoogle || [];
        // window.adsbygoogle.push({});
        */
        
        // For now, reveal contacts immediately without ad
        setIsContactRevealed(true);
        console.log('Contact revealed (ad integration disabled)');
    };

    const renderDescription = () => {
        if (!job.description) return '';

        // Combined regex for URLs, emails, and phone numbers
        const urlRegex = /(https?:\/\/[^\s]+)/gi;
        const emailRegex = /([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9._-]+)/gi;
        const phoneRegex = /(\+?\d{1,4}[\s-]?\(?\d{1,4}\)?[\s-]?\d{1,4}[\s-]?\d{1,4}[\s-]?\d{1,9})/g;

        // First, split by URLs
        const urlParts = job.description.split(urlRegex);

        return urlParts.map((part, index) => {
            // Check if part is a URL
            if (part && part.match(/^https?:\/\//i)) {
                if (!isContactRevealed) {
                    return (
                        <span
                            key={index}
                            className="walkin-url-link blurred"
                            onClick={handleRevealContact}
                        >
                            <Lock size={14} className="lock-icon" />
                            <span className="blur-text">Click to reveal</span>
                        </span>
                    );
                }
                return (
                    <a
                        key={index}
                        href={part}
                        className="walkin-url-link"
                        onClick={(e) => e.stopPropagation()}
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        {part}
                    </a>
                );
            }

            // Then check for emails and phone numbers in remaining text
            if (!part) return null;

            const emailParts = part.split(emailRegex);
            return emailParts.map((emailPart, emailIndex) => {
                if (emailPart && emailPart.match(emailRegex)) {
                    if (!isContactRevealed) {
                        return (
                            <span
                                key={`${index}-${emailIndex}`}
                                className="walkin-email-link blurred"
                                onClick={handleRevealContact}
                            >
                                <Lock size={14} className="lock-icon" />
                                <span className="blur-text">Click to reveal email</span>
                            </span>
                        );
                    }
                    return (
                        <a
                            key={`${index}-${emailIndex}`}
                            href={`mailto:${emailPart}`}
                            className="walkin-email-link"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {emailPart}
                        </a>
                    );
                }

                // Check for phone numbers in remaining text
                const phoneParts = emailPart.split(phoneRegex);
                return phoneParts.map((phonePart, phoneIndex) => {
                    if (phonePart && phonePart.match(phoneRegex) && phonePart.replace(/[\s-()]/g, '').length >= 10) {
                        if (!isContactRevealed) {
                            return (
                                <span
                                    key={`${index}-${emailIndex}-${phoneIndex}`}
                                    className="walkin-phone-link blurred"
                                    onClick={handleRevealContact}
                                >
                                    <Lock size={14} className="lock-icon" />
                                    <span className="blur-text">Click to reveal phone</span>
                                </span>
                            );
                        }
                        return (
                            <a
                                key={`${index}-${emailIndex}-${phoneIndex}`}
                                href={`tel:${phonePart.replace(/[\s-()]/g, '')}`}
                                className="walkin-phone-link"
                                onClick={(e) => e.stopPropagation()}
                            >
                                {phonePart}
                            </a>
                        );
                    }
                    return phonePart;
                });
            });
        });
    };

    return (
        <div className="walkin-card card">
            {/* Ad Loading Overlay */}
            {isAdLoading && (
                <div className="ad-loading-overlay">
                    <div className="ad-loading-content">
                        <div className="spinner-large"></div>
                        <p>Loading advertisement...</p>
                        <small>Please wait to reveal contact details</small>
                    </div>
                </div>
            )}

            <div className="walkin-card-header">
                {/* Company Logo */}
                <div className="walkin-company-logo">
                    {job.companyLogo ? (
                        <img src={job.companyLogo} alt={job.company} />
                    ) : (
                        <Building2 size={24} />
                    )}
                </div>

                {/* Company Name & Time */}
                <div className="walkin-card-info">
                    <div className="walkin-header-top">
                        <h3 className="walkin-company-name">{job.company}</h3>
                        <div className="walkin-time">
                            <Clock size={14} />
                            <span>{getTimeAgo(job.createdAt)}</span>
                        </div>
                    </div>
                </div>

                {/* Share Button */}
                <button 
                    className="walkin-share-btn" 
                    onClick={handleShare}
                    title="Share this opportunity"
                >
                    <Share2 size={16} />
                </button>
            </div>

            {/* Contact Reveal Badge */}
            {/* {!isContactRevealed && (
                <div className="contact-reveal-badge">
                    <Eye size={14} />
                    <span>Click on blurred contacts to reveal</span>
                </div>
            )} */}

            {/* Scrollable Content Container */}
            <div 
                className="walkin-content-wrapper scrollable" 
                ref={contentRef}
                onScroll={handleScroll}
            >
                {/* Scroll Up Indicator */}
                {showScrollIndicator && (
                    <div className="scroll-indicator">
                        <span>↑ Scroll up for more details</span>
                    </div>
                )}
                {/* Description */}
                <div className="walkin-description">
                    <p className="walkin-full-description">
                        {renderDescription()}
                    </p>
                </div>

                {/* Qualifications */}
                {job.qualifications && job.qualifications.length > 0 && (
                    <div className="walkin-section">
                        <h4 className="walkin-section-title">Qualifications</h4>
                        <ul className="walkin-list">
                            {job.qualifications.map((qual, index) => (
                                <li key={index} className="walkin-list-item">{qual}</li>
                            ))}
                        </ul>
                    </div>
                )}

                {/* Responsibilities */}
                {job.responsibilities && job.responsibilities.length > 0 && (
                    <div className="walkin-section">
                        <h4 className="walkin-section-title">Responsibilities</h4>
                        <ul className="walkin-list">
                            {job.responsibilities.map((resp, index) => (
                                <li key={index} className="walkin-list-item">{resp}</li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>
        </div>
    );
}

export default WalkinCard;
