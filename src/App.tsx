import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Trades from './pages/Trades';
import TradeTracking from './pages/TradeTracking';
import AddTrade from './pages/AddTrade';
import EditTrade from './pages/EditTrade';
import Journal from './pages/Journal';
import Analytics from './pages/Analytics';
import Settings from './pages/Settings';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import { AuthProvider } from './contexts/AuthContext';
import { TradeProvider } from './contexts/TradeContext';
import PrivateRoute from './components/PrivateRoute';
import LanguageProvider from './contexts/LanguageContext';
import Shared from './pages/Shared';
import PublicTrade from './pages/PublicTrade';
import PublicPlaybook from './pages/PublicPlaybook';

function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <TradeProvider>
          <Router>
            <Routes>
              {/* Public Routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password/:token" element={<ResetPassword />} />

              {/* Private Routes */}
              <Route path="/" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
              <Route path="/trades" element={<PrivateRoute><Trades /></PrivateRoute>} />
              <Route path="/trade/:id" element={<PrivateRoute><TradeTracking /></PrivateRoute>} />
              <Route path="/add-trade" element={<PrivateRoute><AddTrade /></PrivateRoute>} />
              <Route path="/edit-trade/:id" element={<PrivateRoute><EditTrade /></PrivateRoute>} />
              <Route path="/journal" element={<PrivateRoute><Journal /></PrivateRoute>} />
              <Route path="/analytics" element={<PrivateRoute><Analytics /></PrivateRoute>} />
              <Route path="/settings" element={<PrivateRoute><Settings /></PrivateRoute>} />
              <Route path="/shared" element={<PrivateRoute><Shared /></PrivateRoute>} />
        
              {/* Public Routes */}
              <Route path="/trade/:id" element={<PublicTrade />} />
              <Route path="/playbook/:id" element={<PublicPlaybook />} />
            </Routes>
          </Router>
        </TradeProvider>
      </AuthProvider>
    </LanguageProvider>
  );
}

export default App;
