import { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ScrollToTop from './components/ScrollToTop';

// Lazy load pages for better performance
const Home = lazy(() => import('./pages/Home'));
const Jobs = lazy(() => import('./pages/Jobs'));
const JobDetails = lazy(() => import('./pages/JobDetails'));
const CompanyJobs = lazy(() => import('./pages/CompanyJobs'));
const Contact = lazy(() => import('./pages/Contact'));
const Terms = lazy(() => import('./pages/Terms'));
const Privacy = lazy(() => import('./pages/Privacy'));
const About = lazy(() => import('./pages/About'));
const AdminLogin = lazy(() => import('./pages/admin/AdminLogin'));
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));
const PostJob = lazy(() => import('./pages/admin/PostJob'));
const ManageJobs = lazy(() => import('./pages/admin/ManageJobs'));
const EditJob = lazy(() => import('./pages/admin/EditJob'));
const FeedbackStats = lazy(() => import('./pages/admin/FeedbackStats'));
const NotFound = lazy(() => import('./pages/NotFound'));

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
              <Route path="/admin/feedback-stats" element={
                <ProtectedRoute>
                  <FeedbackStats />
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
                      <Route path="/walkins" element={<Jobs type="walkin" />} />
                      <Route path="/job/:id" element={<JobDetails />} />
                      <Route path="/company/:companyName" element={<CompanyJobs />} />
                      <Route path="/contact" element={<Contact />} />
                      <Route path="/terms" element={<Terms />} />
                      <Route path="/privacy" element={<Privacy />} />
                      <Route path="/about" element={<About />} />
                      <Route path="*" element={<NotFound />} />
                    </Routes>
                  </main>
                  <Footer />
                </>
              } />
            </Routes>
          </Suspense>
        </div>
      </Router>
    </HelmetProvider>
  );
}

export default App;
