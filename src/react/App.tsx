import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Product from './pages/Product';
import Features from './pages/Features';
import Security from './pages/Security';
import Pricing from './pages/Pricing';
import About from './pages/About';
import Login from './pages/Login';
import SuperAdminDashboard from './pages/SuperAdminDashboard';
import SocietyAdminDashboard from './pages/SocietyAdminDashboard';
import UserManagement from './pages/UserManagement';
import BuildingManagement from './pages/BuildingManagement';
import AccountingManagement from './pages/AccountingManagement';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="flex flex-col min-h-screen">
          <Navbar />
          <main className="flex-grow">
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Home />} />
              <Route path="/product" element={<Product />} />
              <Route path="/features" element={<Features />} />
              <Route path="/security" element={<Security />} />
              <Route path="/pricing" element={<Pricing />} />
              <Route path="/about" element={<About />} />
              <Route path="/login" element={<Login />} />
              
              {/* Admin Routes */}
              <Route path="/super-admin/dashboard" element={<SuperAdminDashboard />} />
              <Route path="/admin/dashboard" element={<SocietyAdminDashboard />} />
              <Route path="/admin/users" element={<UserManagement />} />
              <Route path="/admin/buildings" element={<BuildingManagement />} />
              <Route path="/admin/accounting" element={<AccountingManagement />} />
              
              {/* Fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
