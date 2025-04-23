
import React, { useEffect } from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Register from './pages/Register';
import ResetPassword from './pages/ResetPassword';
import ForgotPassword from './pages/ForgotPassword';
import Trades from './pages/Trades';
import AddTrade from './pages/AddTrade';
import Analytics from './pages/Analytics';
import Journal from './pages/Journal';
import Insights from './pages/Insights';
import NotFound from './pages/NotFound';
import UserProfileSettings from './pages/UserProfileSettings';
import { Toaster } from './components/ui/toaster';
import TradeTracking from './pages/TradeTracking';
import TradingChart from './pages/TradingChart';
import Notebook from './pages/Notebook';
import EmailVerify from './pages/EmailVerify';
import PageTransition from './components/PageTransition';
import Homepage from './pages/Homepage';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminSettings from './pages/admin/AdminSettings';
import AdminUsers from './pages/admin/AdminUsers';
import AdminTrades from './pages/admin/AdminTrades';
import AdminHashtags from './pages/admin/AdminHashtags';
import AdminPages from './pages/admin/AdminPages';
import AdminNotes from './pages/admin/AdminNotes';
import AdminSubscriptions from './pages/admin/AdminSubscriptions';
import AdminProfileSettings from './pages/admin/AdminProfileSettings';
import Index from './pages/Index';
import Reports from './pages/Reports';
import Subscriptions from './pages/Subscriptions';
import PaymentSuccess from './pages/PaymentSuccess';
import Payment from './pages/Payment';
import { TooltipProvider } from './components/ui/tooltip';

function App() {
  // Setup light mode as default
  useEffect(() => {
    document.documentElement.classList.remove('dark');
    document.documentElement.classList.add('light');
  }, []);

  return (
    <>
      <TooltipProvider>
        <Toaster />
        <AnimatedRoutes />
      </TooltipProvider>
    </>
  );
}

function AnimatedRoutes() {
  const location = useLocation();
  
  return (
    <PageTransition>
      <Routes location={location}>
        <Route path="/" element={<Index />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/email-verify" element={<EmailVerify />} />
        <Route path="/trades" element={<Trades />} />
        <Route path="/add-trade" element={<AddTrade />} />
        <Route path="/edit-trade/:id" element={<AddTrade />} />
        <Route path="/trade/:id" element={<TradeTracking />} />
        <Route path="/analytics" element={<Analytics />} />
        <Route path="/journal" element={<Journal />} />
        <Route path="/notebook" element={<Notebook />} />
        <Route path="/insights" element={<Insights />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="/chart" element={<TradingChart />} />
        <Route path="/user-profile" element={<UserProfileSettings />} />
        <Route path="/subscriptions" element={<Subscriptions />} />
        <Route path="/payment" element={<Payment />} />
        <Route path="/payment-success" element={<PaymentSuccess />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/settings" element={<AdminSettings />} />
        <Route path="/admin/users" element={<AdminUsers />} />
        <Route path="/admin/trades" element={<AdminTrades />} />
        <Route path="/admin/hashtags" element={<AdminHashtags />} />
        <Route path="/admin/pages" element={<AdminPages />} />
        <Route path="/admin/notes" element={<AdminNotes />} />
        <Route path="/admin/subscriptions" element={<AdminSubscriptions />} />
        <Route path="/admin/profile" element={<AdminProfileSettings />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </PageTransition>
  );
}

export default App;
