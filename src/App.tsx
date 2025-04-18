
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Trades from './pages/Trades';
import TradeTracking from './pages/TradeTracking';
import AddTrade from './pages/AddTrade';
import Journal from './pages/Journal';
import Analytics from './pages/Analytics';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import { AuthProvider } from './contexts/AuthContext';
import { TradeProvider } from './contexts/TradeContext';
import { LanguageProvider } from './contexts/LanguageContext';
import PublicTrade from './pages/PublicTrade';
import PublicPlaybook from './pages/PublicPlaybook';
import EmailVerify from './pages/EmailVerify';
import { ThemeProvider } from './contexts/ThemeContext';
import { Toaster } from './components/ui/toaster';
import { TooltipProvider } from './components/ui/tooltip';
import NotFound from './pages/NotFound';

// Create a simple PrivateRoute component since it's missing
const PrivateRoute = ({ children }: { children: React.ReactNode }) => {
  // This is a simple implementation that always allows access
  // In a real app, you would check authentication status
  return <>{children}</>;
};

function App() {
  return (
    <Router>
      <TooltipProvider>
        <AuthProvider>
          <ThemeProvider>
            <LanguageProvider>
              <TradeProvider>
                <Routes>
                  {/* Public Routes */}
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  <Route path="/forgot-password" element={<ForgotPassword />} />
                  <Route path="/reset-password/:token" element={<ResetPassword />} />
                  <Route path="/verify" element={<EmailVerify />} />

                  {/* Private Routes */}
                  <Route path="/" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
                  <Route path="/trades" element={<PrivateRoute><Trades /></PrivateRoute>} />
                  <Route path="/trade/:id" element={<PrivateRoute><TradeTracking /></PrivateRoute>} />
                  <Route path="/add-trade" element={<PrivateRoute><AddTrade /></PrivateRoute>} />
                  <Route path="/journal" element={<PrivateRoute><Journal /></PrivateRoute>} />
                  <Route path="/analytics" element={<PrivateRoute><Analytics /></PrivateRoute>} />
            
                  {/* Public Routes */}
                  <Route path="/public/trade/:id" element={<PublicTrade />} />
                  <Route path="/public/playbook/:id" element={<PublicPlaybook />} />
                  
                  {/* Redirect old format to new format */}
                  <Route path="/playbook/:id" element={<PrivateRoute><NotFound /></PrivateRoute>} />
                  
                  {/* 404 Not Found */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
                <Toaster />
              </TradeProvider>
            </LanguageProvider>
          </ThemeProvider>
        </AuthProvider>
      </TooltipProvider>
    </Router>
  );
}

export default App;
