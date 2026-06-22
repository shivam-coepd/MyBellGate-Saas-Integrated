import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Product from './pages/Product';
import Features from './pages/Features';
import Security from './pages/Security';
import Pricing from './pages/Pricing';
import About from './pages/About';
import Login from './pages/Login';
import PrivacyPolicy from './pages/PrivacyPolicy';
import SuperAdminDashboard from './pages/SuperAdminDashboard';
import SocietyAdminDashboard from './pages/SocietyAdminDashboard';
import UserManagement from './pages/UserManagement';
import BuildingManagement from './pages/BuildingManagement';
import AccountingManagement from './pages/AccountingManagement';
import AdminGuardManagement from './pages/AdminGuardManagement';
import CommunityManagement from './pages/CommunityManagement';
import EventManagement from './pages/EventManagement';
import CommunicationsManagement from './pages/CommunicationsManagement';

/** Protect routes: redirect to login if not authenticated, or to the correct dashboard if wrong role. */
const ProtectedRoute: React.FC<{
  element: React.ReactElement;
  allowedRoles?: string[];
}> = ({ element, allowedRoles }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    switch (user.role) {
      case 'super_admin': return <Navigate to="/super-admin/dashboard" replace />;
      case 'admin': return <Navigate to="/admin/dashboard" replace />;
      // Guards have no web dashboard — redirect to login
      default: return <Navigate to="/login" replace />;
    }
  }

  return element;
};

/** Hide Navbar/Footer on dashboard routes */
const AppLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const isDashboard =
    window.location.pathname.startsWith('/admin') ||
    window.location.pathname.startsWith('/super-admin');

  if (isDashboard) return <>{children}</>;

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow">{children}</main>
      <Footer />
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
}

function AppRoutes() {
  return (
    <AppLayout>
      <Routes>
        {/* Public */}
        <Route path="/" element={<Home />} />
        <Route path="/product" element={<Product />} />
        <Route path="/features" element={<Features />} />
        <Route path="/security" element={<Security />} />
        <Route path="/pricing" element={<Pricing />} />
        <Route path="/about" element={<About />} />
        <Route path="/login" element={<Login />} />
        <Route path="/privacy-policy" element={<PrivacyPolicy />} />

        {/* Super Admin */}
        <Route
          path="/super-admin/dashboard"
          element={<ProtectedRoute element={<SuperAdminDashboard />} allowedRoles={['super_admin']} />}
        />

        {/* Society Admin */}
        <Route
          path="/admin/dashboard"
          element={<ProtectedRoute element={<SocietyAdminDashboard />} allowedRoles={['admin']} />}
        />
        <Route
          path="/admin/users"
          element={<ProtectedRoute element={<UserManagement />} allowedRoles={['admin']} />}
        />
        <Route
          path="/admin/buildings"
          element={<ProtectedRoute element={<BuildingManagement />} allowedRoles={['admin']} />}
        />
        <Route
          path="/admin/accounting"
          element={<ProtectedRoute element={<AccountingManagement />} allowedRoles={['admin']} />}
        />
        <Route
          path="/admin/guards"
          element={<ProtectedRoute element={<AdminGuardManagement />} allowedRoles={['admin']} />}
        />
        <Route
          path="/admin/community"
          element={<ProtectedRoute element={<CommunityManagement />} allowedRoles={['admin']} />}
        />
        <Route
          path="/admin/events"
          element={<ProtectedRoute element={<EventManagement />} allowedRoles={['admin']} />}
        />
        <Route
          path="/admin/communications"
          element={<ProtectedRoute element={<CommunicationsManagement />} allowedRoles={['admin']} />}
        />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AppLayout>
  );
}

export default App;
