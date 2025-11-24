import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ForgotPassword from './pages/auth/ForgotPassword';
import ResetPassword from './pages/auth/ResetPassword';
import Documentation from './pages/Documentation';
import FeaturesPage from './pages/FeaturesPage';
import PricingPage from './pages/PricingPage';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import { ProjectProvider } from './context/ProjectContext';
import DashboardLayout from './layouts/DashboardLayout';
import AdminLayout from './layouts/AdminLayout';
import Overview from './pages/dashboard/Overview';
import Projects from './pages/dashboard/Projects';
import Transactions from './pages/dashboard/Transactions';
import APIKeys from './pages/dashboard/APIKeys';
import Settings from './pages/dashboard/Settings';
import PaymentLinks from './pages/dashboard/PaymentLinks';
import Analytics from './pages/dashboard/Analytics';
import Developer from './pages/dashboard/Developer';
import Checkout from './pages/public/Checkout';
import AdminAnalytics from './pages/admin/AdminAnalytics';
import AdminUsers from './pages/admin/AdminUsers';
import AdminTransactions from './pages/admin/AdminTransactions';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ProjectProvider>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/docs" element={<Documentation />} />
            <Route path="/features" element={<FeaturesPage />} />
            <Route path="/pricing" element={<PricingPage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />

            {/* Public Payment Link Route */}
            <Route path="/pay/:slug" element={<Checkout />} />

            {/* Protected Routes (Admin) */}
            <Route path="/admin" element={
              <ProtectedRoute requireAdmin>
                <AdminLayout />
              </ProtectedRoute>
            }>
              <Route index element={<Navigate to="/admin/users" replace />} />
              <Route path="users" element={<AdminUsers />} />
              <Route path="analytics" element={<AdminAnalytics />} />
              <Route path="transactions" element={<AdminTransactions />} />
            </Route>

            {/* Protected Routes (Dashboard) */}
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            }>
              <Route index element={<Overview />} />
              <Route path="transactions" element={<Transactions />} />
              <Route path="projects" element={<Projects />} />
              <Route path="payment-links" element={<PaymentLinks />} />
              <Route path="analytics" element={<Analytics />} />
              <Route path="api-keys" element={<APIKeys />} />
              <Route path="developer" element={<Developer />} />
              <Route path="settings" element={<Settings />} />
            </Route>

            {/* Catch all */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </ProjectProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
