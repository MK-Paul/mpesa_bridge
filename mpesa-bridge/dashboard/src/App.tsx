import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import Documentation from './pages/Documentation';
import FeaturesPage from './pages/FeaturesPage';
import PricingPage from './pages/PricingPage';

// Temporary placeholder
const Dashboard = () => <div className="min-h-screen flex items-center justify-center text-white">Dashboard Coming Soon</div>;

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/docs" element={<Documentation />} />
        <Route path="/features" element={<FeaturesPage />} />
        <Route path="/pricing" element={<PricingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Protected Routes (Dashboard) */}
        <Route path="/dashboard" element={<Dashboard />} />

        {/* Catch all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
