import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Toaster } from 'sonner';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './pages/Home';
import Features from './pages/Features';
import Pricing from './pages/Pricing';
import Auth from './pages/Auth';
import Dashboard from './pages/Dashboard';
import Properties from './pages/Properties';
import PropertyUpload from './pages/PropertyUpload';
import PropertyDetail from './pages/PropertyDetail';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import AdminLogin from './pages/admin/AdminLogin';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminUsers from './pages/admin/AdminUsers';
import AdminProperties from './pages/admin/AdminProperties';
import AdminAnalytics from './pages/admin/AdminAnalytics';
import AdminSettings from './pages/admin/AdminSettings';
import AdminLayout from './components/admin/AdminLayout';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AdminProvider, useAdmin } from './context/AdminContext';
import ScrollIndicator from './components/ScrollIndicator';
import ScrollToTop from './components/ScrollToTop';
import SmoothScroll from './components/SmoothScroll';
import LoadingSpinner from './components/LoadingSpinner';

// Protected Route component that redirects to login if not authenticated
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <LoadingSpinner 
        isVisible={loading}
        message="Authenticating..."
        variant="overlay"
      />
    );
  }
  
  if (!user) {
    return <Navigate to="/auth" replace />;
  }
  
  return <>{children}</>;
};

// Public Route component that redirects to properties if authenticated
const PublicRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <LoadingSpinner 
        isVisible={loading}
        message="Loading..."
        variant="overlay"
      />
    );
  }
  
  if (user) {
    return <Navigate to="/dashboard" replace />;
  }
  
  return <>{children}</>;
};

// Admin Route component that redirects to admin login if not admin
const AdminRoute = ({ children }: { children: React.ReactNode }) => {
  const { adminUser, loading } = useAdmin();
  
  if (loading) {
    return (
      <LoadingSpinner 
        isVisible={loading}
        message="Verifying admin access..."
        variant="overlay"
      />
    );
  }
  
  if (!adminUser) {
    return <Navigate to="/admin" replace />;
  }
  
  return <>{children}</>;
};

function AppRoutes() {
  return (
    <Routes>
      <Route 
        path="/" 
        element={
          <PublicRoute>
            <Home />
          </PublicRoute>
        } 
      />
      <Route 
        path="/features" 
        element={
          <PublicRoute>
            <Features />
          </PublicRoute>
        } 
      />
      <Route 
        path="/pricing" 
        element={
          <PublicRoute>
            <Pricing />
          </PublicRoute>
        } 
      />
      <Route 
        path="/auth" 
        element={
          <PublicRoute>
            <Auth />
          </PublicRoute>
        } 
      />
      <Route 
        path="/properties" 
        element={<Properties />} 
      />
      <Route 
        path="/dashboard" 
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/profile" 
        element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/settings" 
        element={
          <ProtectedRoute>
            <Settings />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/properties/upload" 
        element={
          <ProtectedRoute>
            <PropertyUpload />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/properties/:id" 
        element={<PropertyDetail />} 
      />
      
      {/* Admin Routes */}
      <Route path="/admin" element={<AdminLogin />} />
      <Route 
        path="/admin/dashboard" 
        element={
          <AdminRoute>
            <AdminLayout>
              <AdminDashboard />
            </AdminLayout>
          </AdminRoute>
        } 
      />
      <Route 
        path="/admin/users" 
        element={
          <AdminRoute>
            <AdminLayout>
              <AdminUsers />
            </AdminLayout>
          </AdminRoute>
        } 
      />
      <Route 
        path="/admin/properties" 
        element={
          <AdminRoute>
            <AdminLayout>
              <AdminProperties />
            </AdminLayout>
          </AdminRoute>
        } 
      />
      <Route 
        path="/admin/analytics" 
        element={
          <AdminRoute>
            <AdminLayout>
              <AdminAnalytics />
            </AdminLayout>
          </AdminRoute>
        } 
      />
      <Route 
        path="/admin/settings" 
        element={
          <AdminRoute>
            <AdminLayout>
              <AdminSettings />
            </AdminLayout>
          </AdminRoute>
        } 
      />
    </Routes>
  );
}

function AppContent() {
  const location = useLocation();
  const isPropertiesPage = location.pathname === '/properties';
  const isAdminPage = location.pathname.startsWith('/admin');

  return (
    <SmoothScroll offset={80}>
      <div className="min-h-screen bg-gray-50">
        <ScrollIndicator color="#3b82f6" height={3} position="top" />
        {!isAdminPage && <Header />}
        <AppRoutes />
        {!isAdminPage && <Footer />}
        {!isAdminPage && (
          <ScrollToTop 
            size="md" 
            bottom={30} 
            right={30} 
            showAfter={400} 
            showProgress={!isPropertiesPage}
          />
        )}
      </div>
    </SmoothScroll>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <AdminProvider>
          <AppContent />
          <Toaster position="top-right" />
        </AdminProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
