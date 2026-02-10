import { useState, useEffect } from 'react';
import { Moon, Sun } from 'lucide-react';
import './AdminThemeToggle.css';

function AdminThemeToggle() {
    const [isDark, setIsDark] = useState(true); // Default to dark theme

    useEffect(() => {
        // Check localStorage for saved admin theme preference
        const savedTheme = localStorage.getItem('adminTheme');
        if (savedTheme) {
            setIsDark(savedTheme === 'dark');
            applyAdminTheme(savedTheme === 'dark');
        } else {
            // Default to dark theme
            applyAdminTheme(true);
        }
    }, []);

    const applyAdminTheme = (dark) => {
        const root = document.documentElement;
        
        if (dark) {
            // Dark theme (Midnight Blue Shine)
            root.style.setProperty('--primary', '#4DA3FF');
            root.style.setProperty('--primary-light', '#6BB5FF');
            root.style.setProperty('--primary-dark', '#3B8FE8');
            
            root.style.setProperty('--bg-dark', '#0B132B');
            root.style.setProperty('--bg-card', '#111B3C');
            root.style.setProperty('--bg-card-hover', '#1A2547');
            root.style.setProperty('--bg-glass', 'rgba(17, 27, 60, 0.85)');
            
            root.style.setProperty('--text-primary', '#FFFFFF');
            root.style.setProperty('--text-secondary', '#C7D2FE');
            root.style.setProperty('--text-muted', '#8B9DC3');
            
            root.style.setProperty('--gradient-primary', 'linear-gradient(135deg, #4DA3FF 0%, #3B8FE8 100%)');
            root.style.setProperty('--gradient-hero', 'linear-gradient(135deg, #0B132B 0%, #111B3C 50%, #1A2547 100%)');
            root.style.setProperty('--gradient-card', 'linear-gradient(145deg, #111B3C 0%, #0B132B 100%)');
            
            root.style.setProperty('--border-color', 'rgba(255, 255, 255, 0.08)');
            root.style.setProperty('--shadow-glow-hover', '0 0 12px rgba(77, 163, 255, 0.35)');
        } else {
            // Light theme (Orange & White - Attractive)
            root.style.setProperty('--primary', '#f97316');
            root.style.setProperty('--primary-light', '#fb923c');
            root.style.setProperty('--primary-dark', '#ea580c');
            
            root.style.setProperty('--bg-dark', '#ffffff');
            root.style.setProperty('--bg-card', '#ffffff');
            root.style.setProperty('--bg-card-hover', '#fff7ed');
            root.style.setProperty('--bg-glass', 'rgba(255, 255, 255, 0.95)');
            
            root.style.setProperty('--text-primary', '#1a1a1a');
            root.style.setProperty('--text-secondary', '#4a5568');
            root.style.setProperty('--text-muted', '#718096');
            
            root.style.setProperty('--gradient-primary', 'linear-gradient(135deg, #f97316 0%, #fb923c 100%)');
            root.style.setProperty('--gradient-hero', 'linear-gradient(135deg, #ffffff 0%, #fff7ed 50%, #ffedd5 100%)');
            root.style.setProperty('--gradient-card', 'linear-gradient(145deg, #ffffff 0%, #fffbf5 100%)');
            
            root.style.setProperty('--border-color', 'rgba(249, 115, 22, 0.12)');
            root.style.setProperty('--shadow-glow-hover', '0 0 12px rgba(249, 115, 22, 0.25)');
        }
    };

    const toggleTheme = () => {
        const newTheme = !isDark;
        setIsDark(newTheme);
        applyAdminTheme(newTheme);
        localStorage.setItem('adminTheme', newTheme ? 'dark' : 'light');
    };

    return (
        <button 
            className="admin-theme-toggle" 
            onClick={toggleTheme}
            aria-label="Toggle admin theme"
            title={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
        >
            <div className="admin-theme-icon">
                {isDark ? <Moon size={18} /> : <Sun size={18} />}
            </div>
            <span className="admin-theme-label">
                {isDark ? 'Dark' : 'Light'}
            </span>
        </button>
    );
}

export default AdminThemeToggle;
