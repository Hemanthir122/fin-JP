import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import './index.css'
import App from './App.jsx'

// Apply light theme permanently
const applyLightTheme = () => {
  const root = document.documentElement;
  
  // Light theme (Orange & White)
  root.style.setProperty('--primary', '#f97316');
  root.style.setProperty('--primary-light', '#fb923c');
  root.style.setProperty('--primary-dark', '#ea580c');
  
  root.style.setProperty('--bg-dark', '#ffffff');
  root.style.setProperty('--bg-card', '#ffffff');
  root.style.setProperty('--bg-card-hover', '#fff7ed');
  root.style.setProperty('--bg-glass', 'rgba(255, 255, 255, 0.95)');
  
  root.style.setProperty('--text-primary', '#000000');
  root.style.setProperty('--text-secondary', '#1a1a1a');
  root.style.setProperty('--text-muted', '#4a5568');
  
  root.style.setProperty('--gradient-primary', 'linear-gradient(135deg, #f97316 0%, #fb923c 100%)');
  root.style.setProperty('--gradient-hero', 'linear-gradient(135deg, #ffffff 0%, #fff7ed 50%, #ffedd5 100%)');
  root.style.setProperty('--gradient-card', 'linear-gradient(145deg, #ffffff 0%, #fffbf5 100%)');
  
  root.style.setProperty('--border-color', 'rgba(249, 115, 22, 0.12)');
  root.style.setProperty('--shadow-glow-hover', '0 0 12px rgba(249, 115, 22, 0.25)');
  
  // Remove any saved theme preference
  localStorage.removeItem('theme');
};

// Apply light theme immediately
applyLightTheme();

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      gcTime: 30 * 60 * 1000,
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
})

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </StrictMode>,
)
