import { useEffect } from 'react';
import './WalkinSmartLink.css';

function WalkinSmartLink() {
    useEffect(() => {
        // Load smart link script
        const script = document.createElement('script');
        script.src = 'https://breachuptown.com/jnv7mma2?key=d47de908fdd389381c8131eaa2a36085';
        script.async = true;
        script.setAttribute('data-cfasync', 'false');
        
        document.body.appendChild(script);

        // Cleanup
        return () => {
            if (script.parentNode) {
                script.parentNode.removeChild(script);
            }
        };
    }, []);

    return null; // Smart link doesn't need visible UI
}

export default WalkinSmartLink;
