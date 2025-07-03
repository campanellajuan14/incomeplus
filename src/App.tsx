import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
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
import { AuthProvider, useAuth } from './context/AuthContext';
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
        element={
          <ProtectedRoute>
            <Properties />
          </ProtectedRoute>
        } 
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
        path="/properties/upload" 
        element={
          <ProtectedRoute>
            <PropertyUpload />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/properties/:id" 
        element={
          <ProtectedRoute>
            <PropertyDetail />
          </ProtectedRoute>
        } 
      />
    </Routes>
  );
}

function AppContent() {
  const location = useLocation();
  const isPropertiesPage = location.pathname === '/properties';

  return (
    <SmoothScroll offset={80}>
      <div className="min-h-screen bg-gray-50">
        <ScrollIndicator color="#3b82f6" height={3} position="top" />
        <Header />
        <AppRoutes />
        <Footer />
        <ScrollToTop 
          size="md" 
          bottom={30} 
          right={30} 
          showAfter={400} 
          showProgress={!isPropertiesPage}
        />
      </div>
    </SmoothScroll>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Router>
  );
}

export default App;
