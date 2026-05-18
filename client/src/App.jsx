import { Suspense, lazy, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Analytics } from '@vercel/analytics/react';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ScrollToTop from './components/ScrollToTop';

// Lazy load pages for better performance
const Home = lazy(() => import('./pages/Home'));
const Jobs = lazy(() => import('./pages/Jobs'));
const JobDetails = lazy(() => import('./pages/JobDetails'));
const CompanyJobs = lazy(() => import('./pages/CompanyJobs'));
const Companies = lazy(() => import('./pages/Companies'));
const Contact = lazy(() => import('./pages/Contact'));
const Terms = lazy(() => import('./pages/Terms'));
const Privacy = lazy(() => import('./pages/Privacy'));
const About = lazy(() => import('./pages/About'));
const AdminLogin = lazy(() => import('./pages/admin/AdminLogin'));
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));
const PostJob = lazy(() => import('./pages/admin/PostJob'));
const ManageJobs = lazy(() => import('./pages/admin/ManageJobs'));
const EditJob = lazy(() => import('./pages/admin/EditJob'));
const UpdateCompanyLogo = lazy(() => import('./pages/admin/UpdateCompanyLogo'));
const FeedbackStats = lazy(() => import('./pages/admin/FeedbackStats'));
const ExternalJobs = lazy(() => import('./pages/admin/ExternalJobs'));
const ExternalJobsHistory = lazy(() => import('./pages/admin/ExternalJobsHistory'));
const ApprovedExternalJobs = lazy(() => import('./pages/admin/ApprovedExternalJobs'));
const ManageCompanyLogos = lazy(() => import('./pages/admin/ManageCompanyLogos'));
const NotFound = lazy(() => import('./pages/NotFound'));
const ResumeBuilder = lazy(() => import('./pages/ResumeBuilder'));
const AIAnalysis = lazy(() => import('./pages/admin/AIAnalysis'));

import './App.css';

// Loading component
const Loading = () => (
  <div className="loading-container" style={{ height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
    <div className="spinner"></div>
  </div>
);

// Protected Route component
function ProtectedRoute({ children }) {
  const adminEmail = localStorage.getItem('adminEmail');
  if (!adminEmail) {
    return <Navigate to="/admin/login" replace />;
  }
  return children;
}

import { HelmetProvider } from 'react-helmet-async';

function App() {
  useEffect(() => {
    // Social bar — 1 iframe just below navbar (top: 64px)
    // Page content pushed down via paddingTop so nothing is hidden
    const src = 'https://breachuptown.com/53/e5/58/53e55836ee891aa30b1843270191bee1.js';
    const SOCIAL_BAR_HEIGHT = 56;

    const iframe = document.createElement('iframe');
    iframe.id = 'adsterra-social-bar';
    iframe.style.cssText = [
        'position:fixed',
        'top:64px',
        'left:0',
        'width:100%',
        `height:${SOCIAL_BAR_HEIGHT}px`,
        'border:none',
        'z-index:998',   // below navbar drawer (1001) and navbar (1000)
        'pointer-events:auto',
        'background:transparent',
    ].join(';');
    iframe.setAttribute('scrolling', 'no');
    iframe.setAttribute('frameborder', '0');
    document.body.appendChild(iframe);

    // Push page content down so it isn't hidden behind the bar
    const mainContent = document.querySelector('.main-content');
    if (mainContent) mainContent.style.paddingTop = `${SOCIAL_BAR_HEIGHT}px`;

    setTimeout(() => {
        const doc = iframe.contentDocument || iframe.contentWindow?.document;
        if (!doc) return;
        doc.open();
        doc.write(`<!DOCTYPE html><html><head><style>*{margin:0;padding:0;}body{overflow:hidden;background:transparent;}</style></head><body><script src="${src}"><\/script></body></html>`);
        doc.close();
    }, 300);

    return () => {
        if (iframe.parentNode) iframe.parentNode.removeChild(iframe);
        if (mainContent) mainContent.style.paddingTop = '';
    };
  }, []);

  useEffect(() => {
    // Popunder — fires once per session after user spends 15 seconds on site
    if (sessionStorage.getItem('popunder_fired')) return;

    const timer = setTimeout(() => {
        if (sessionStorage.getItem('popunder_fired')) return;
        sessionStorage.setItem('popunder_fired', '1');

        const script = document.createElement('script');
        script.src = 'https://breachuptown.com/31/2d/00/312d000878fa23ff92459a4fb1eac311.js';
        script.async = true;
        document.body.appendChild(script);
    }, 15000); // 15 seconds

    return () => clearTimeout(timer);
  }, []);

  return (
    <HelmetProvider>
      <Router>
        <ScrollToTop />
        <div className="app">
          <Suspense fallback={<Loading />}>
            <Routes>
              {/* Admin Login - No protection */}
              <Route path="/admin/login" element={<AdminLogin />} />

              {/* Protected Admin Routes */}
              <Route path="/admin" element={
                <ProtectedRoute>
                  <AdminDashboard />
                </ProtectedRoute>
              } />
              <Route path="/admin/post-job" element={
                <ProtectedRoute>
                  <PostJob />
                </ProtectedRoute>
              } />
              <Route path="/admin/manage-jobs" element={
                <ProtectedRoute>
                  <ManageJobs />
                </ProtectedRoute>
              } />
              <Route path="/admin/edit-job/:id" element={
                <ProtectedRoute>
                  <EditJob />
                </ProtectedRoute>
              } />
              <Route path="/admin/update-company-logo" element={
                <ProtectedRoute>
                  <UpdateCompanyLogo />
                </ProtectedRoute>
              } />
              <Route path="/admin/external-jobs" element={
                <ProtectedRoute>
                  <ExternalJobs />
                </ProtectedRoute>
              } />
              <Route path="/admin/external-jobs-history" element={
                <ProtectedRoute>
                  <ExternalJobsHistory />
                </ProtectedRoute>
              } />
              <Route path="/admin/feedback-stats" element={
                <ProtectedRoute>
                  <FeedbackStats />
                </ProtectedRoute>
              } />
              <Route path="/admin/approved-external-jobs" element={
                <ProtectedRoute>
                  <ApprovedExternalJobs />
                </ProtectedRoute>
              } />
              <Route path="/admin/manage-company-logos" element={
                <ProtectedRoute>
                  <ManageCompanyLogos />
                </ProtectedRoute>
              } />
              <Route path="/admin/ai" element={
                <ProtectedRoute>
                  <AIAnalysis />
                </ProtectedRoute>
              } />

              {/* Public Routes with Navbar/Footer */}
              <Route path="/*" element={
                <>
                  <Navbar />
                  <main className="main-content">
                    <Routes>
                      <Route path="/" element={<Home />} />
                      <Route path="/jobs" element={<Jobs />} />
                      <Route path="/internships" element={<Jobs type="internship" />} />
                      <Route path="/companies" element={<Companies />} />
                      <Route path="/job/:id" element={<JobDetails />} />
                      <Route path="/company/:companyName" element={<CompanyJobs />} />
                      <Route path="/contact" element={<Contact />} />
                      <Route path="/terms" element={<Terms />} />
                      <Route path="/privacy" element={<Privacy />} />
                      <Route path="/about" element={<About />} />
                      <Route path="/resume-builder" element={<ResumeBuilder />} />
                      <Route path="*" element={<NotFound />} />
                    </Routes>
                  </main>
                  <Footer />
                </>
              } />
            </Routes>
          </Suspense>
        </div>
        <Analytics />
      </Router>
    </HelmetProvider>
  );
}

export default App;
