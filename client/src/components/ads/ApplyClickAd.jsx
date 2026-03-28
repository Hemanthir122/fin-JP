import { useEffect, useRef } from 'react';
import './ApplyClickAd.css';

const ApplyClickAd = () => {
    const clickCountRef = useRef(0);
    const adContainerRef = useRef(null);
    const CLICK_THRESHOLD = 5;
    const AD_SCRIPT_SRC = 'https://breachuptown.com/31/2d/00/312d000878fa23ff92459a4fb1eac311.js';

    useEffect(() => {
        const handleApplyClick = (event) => {
            // Check if the clicked element is an Apply button
            const target = event.target;
            const isApplyButton = 
                target.classList.contains('btn-primary') && 
                (target.textContent.includes('Apply') || target.textContent.includes('View Details'));

            if (isApplyButton) {
                clickCountRef.current += 1;

                // Check if we've reached the threshold
                if (clickCountRef.current >= CLICK_THRESHOLD) {
                    // Reset counter
                    clickCountRef.current = 0;

                    // Show the ad modal
                    showAdModal();
                }
            }
        };

        const showAdModal = () => {
            // Create modal overlay
            const modal = document.createElement('div');
            modal.className = 'apply-click-ad-modal';
            modal.innerHTML = `
                <div class="apply-click-ad-content">
                    <button class="apply-click-ad-close" aria-label="Close ad">×</button>
                    <div class="apply-click-ad-container" id="apply-click-ad-container"></div>
                </div>
            `;

            document.body.appendChild(modal);
            document.body.style.overflow = 'hidden';

            // Load the ad script
            const script = document.createElement('script');
            script.src = AD_SCRIPT_SRC;
            script.async = true;
            document.getElementById('apply-click-ad-container').appendChild(script);

            // Close button handler
            const closeBtn = modal.querySelector('.apply-click-ad-close');
            const closeModal = () => {
                document.body.removeChild(modal);
                document.body.style.overflow = '';
            };

            closeBtn.addEventListener('click', closeModal);
            
            // Close on overlay click
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    closeModal();
                }
            });

            // Auto close after 8 seconds
            setTimeout(closeModal, 8000);
        };

        // Add click listener to document
        document.addEventListener('click', handleApplyClick, true);

        // Cleanup
        return () => {
            document.removeEventListener('click', handleApplyClick, true);
        };
    }, []);

    return null; // This component doesn't render anything in the DOM
};

export default ApplyClickAd;
