import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu } from 'lucide-react';
import AdminThemeToggle from './AdminThemeToggle';
import '../pages/admin/Admin.css';

function AdminLayout({ children }) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const location = useLocation();

    const navItems = [
        { path: '/admin', label: 'Dashboard' },
        { path: '/admin/post-job', label: 'Post New Job' },
        { path: '/admin/manage-jobs', label: 'Manage Jobs' },
        { path: '/admin/update-company-logo', label: 'Update Company Logo' },
        { path: '/admin/feedback-stats', label: 'Feedback Stats' }
    ];

    return (
        <div className="admin-page">
            <div className={`admin-sidebar ${isSidebarOpen ? 'show' : ''}`}>
                <div className="admin-logo">
                    <span className="logo-text">Jobs</span>
                    <span className="logo-accent">Connect</span>
                </div>

                <nav className="admin-nav">
                    {navItems.map((item) => (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={`nav-item ${location.pathname === item.path ? 'active' : ''}`}
                        >
                            {item.label}
                        </Link>
                    ))}
                </nav>

                <div className="admin-sidebar-footer">
                    <AdminThemeToggle />
                    <Link to="/" className="nav-item back-link">
                        ← Back to Site
                    </Link>
                </div>
            </div>

            {/* Overlay for mobile sidebar */}
            {isSidebarOpen && (
                <div
                    className="sidebar-overlay"
                    onClick={() => setIsSidebarOpen(false)}
                ></div>
            )}

            <div className="admin-content">
                <button
                    className="mobile-menu-btn"
                    onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                    style={{ marginBottom: '16px' }}
                >
                    <Menu size={24} />
                </button>
                {children}
            </div>
        </div>
    );
}

export default AdminLayout;
