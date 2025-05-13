import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './pages/Home';
import Features from './pages/Features';
import Pricing from './pages/Pricing';
import Auth from './pages/Auth';
import Dashboard from './pages/Dashboard';
import PropertySheet from './pages/PropertySheet';
import PropertyUpload from './pages/PropertyUpload';
import { AuthProvider, useAuth } from './context/AuthContext';
import ScrollIndicator from './components/ScrollIndicator';
import ScrollToTop from './components/ScrollToTop';
import SmoothScroll from './components/SmoothScroll';

// Protected Route component that redirects to login if not authenticated
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
  }
  
  if (!user) {
    return <Navigate to="/auth" replace />;
  }
  
  return <>{children}</>;
};

// Public Route component that redirects to dashboard if authenticated
const PublicRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
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
        path="/dashboard" 
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/properties" 
        element={
          <ProtectedRoute>
            <PropertySheet />
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
    </Routes>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <SmoothScroll offset={80}>
          <div className="min-h-screen bg-gray-50">
            <ScrollIndicator color="#3b82f6" height={3} position="top" />
            <Header />
            <AppRoutes />
            <Footer />
            <ScrollToTop size="md" bottom={30} right={30} showAfter={400} />
          </div>
        </SmoothScroll>
      </AuthProvider>
    </Router>
  );
}

export default App;
