import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ScrollToTop from './components/ScrollToTop';
import Home from './pages/Home';
import Jobs from './pages/Jobs';
import JobDetails from './pages/JobDetails';
import CompanyJobs from './pages/CompanyJobs';
import Contact from './pages/Contact';
import Terms from './pages/Terms';
import Privacy from './pages/Privacy';
import About from './pages/About';
import AdminLogin from './pages/admin/AdminLogin';
import AdminDashboard from './pages/admin/AdminDashboard';
import PostJob from './pages/admin/PostJob';
import ManageJobs from './pages/admin/ManageJobs';
import EditJob from './pages/admin/EditJob';
import NotFound from './pages/NotFound';
import './App.css';

// Protected Route component
function ProtectedRoute({ children }) {
  const adminEmail = localStorage.getItem('adminEmail');
  if (!adminEmail) {
    return <Navigate to="/admin/login" replace />;
  }
  return children;
}

function App() {
  return (
    <Router>
      <ScrollToTop />
      <div className="app">
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
      </div>
    </Router>
  );
}

export default App;
