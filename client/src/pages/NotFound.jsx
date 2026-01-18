import { Link } from 'react-router-dom';
import { Home } from 'lucide-react';
import './About.css'; // Reusing about styles for simplicity

function NotFound() {
    return (
        <div className="about-page" style={{ textAlign: 'center', padding: '100px 20px' }}>
            <div className="container">
                <h1 style={{ fontSize: '4rem', marginBottom: '20px', color: 'var(--primary-color)' }}>404</h1>
                <h2 style={{ fontSize: '2rem', marginBottom: '20px' }}>Page Not Found</h2>
                <p style={{ marginBottom: '40px', fontSize: '1.2rem', color: 'var(--text-muted)' }}>
                    The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
                </p>
                <Link to="/" className="btn btn-primary btn-lg">
                    <Home size={20} style={{ marginRight: '8px' }} />
                    Back to Home
                </Link>
            </div>
        </div>
    );
}

export default NotFound;
