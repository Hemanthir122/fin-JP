import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, LogIn } from 'lucide-react';
import api from '../../utils/api';
import './AdminLogin.css';

function AdminLogin() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const response = await api.post('/auth/login', formData);
            const data = response.data; // axios response has data field

            // Adjust based on actual API response structure
            // authRoutes.js returns: { success: true, message: '...', admin: {...} } OR { message: '...' } (on error? no, error throws)
            // success is implied if no error?
            // authRoutes.js:res.json({ success: true ... })

            if (data.success) {
                localStorage.setItem('adminEmail', data.admin.email);
                navigate('/admin');
            } else {
                setError(data.message || 'Login failed');
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Login failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-page">
            <div className="login-container">
                <div className="login-card">
                    <div className="login-header">
                        <div className="login-logo">
                            <span className="logo-text">Jobs</span>
                            <span className="logo-accent">Connect</span>
                        </div>
                        <h1>Admin Login</h1>
                        <p>Sign in to access the admin panel</p>
                    </div>

                    <form onSubmit={handleSubmit} className="login-form">
                        {error && <div className="error-message">{error}</div>}

                        <div className="form-group">
                            <label className="label">Email</label>
                            <div className="input-icon">
                                <Mail size={18} />
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    className="input"
                                    placeholder="admin@example.com"
                                    required
                                />
                            </div>
                        </div>

                        <div className="form-group">
                            <label className="label">Password</label>
                            <div className="input-icon">
                                <Lock size={18} />
                                <input
                                    type="password"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    className="input"
                                    placeholder="Enter password"
                                    required
                                />
                            </div>
                        </div>

                        <button type="submit" className="btn btn-primary w-full" disabled={loading}>
                            {loading ? 'Signing in...' : (
                                <>
                                    <LogIn size={18} />
                                    Sign In
                                </>
                            )}
                        </button>
                    </form>

                    <div className="login-footer">
                        <a href="/" className="back-link">← Back to Website</a>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default AdminLogin;
