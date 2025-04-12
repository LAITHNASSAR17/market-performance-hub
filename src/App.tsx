
import React, { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from '@/contexts/AuthContext';
import { Toaster } from "@/components/ui/toaster";
import { TradeProvider } from '@/contexts/TradeContext';
import { NotebookProvider } from '@/contexts/NotebookContext';
import { LanguageProvider } from '@/contexts/LanguageContext';
import { AccountProvider } from '@/contexts/AccountContext';

// Pages
import Login from '@/pages/Login';
import Register from '@/pages/Register';
import Dashboard from '@/pages/Dashboard';
import Trades from '@/pages/Trades';
import Journal from '@/pages/Journal';
import AddTrade from '@/pages/AddTrade';
import Analytics from '@/pages/Analytics';
import Index from '@/pages/Index';
import TradingChart from '@/pages/TradingChart';
import AdminDashboard from '@/pages/AdminDashboard';
import TradeTracking from '@/pages/TradeTracking';
import Notebook from '@/pages/Notebook';
import Insights from '@/pages/Insights';
import Reports from '@/pages/Reports';
import NotFound from '@/pages/NotFound';

import './App.css';

// Utility Loading component
const LoadingPage = () => (
  <div className="flex items-center justify-center h-screen">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-600"></div>
  </div>
);

function App() {
  return (
    <Suspense fallback={<LoadingPage />}>
      <Router>
        <LanguageProvider>
          <AuthProvider>
            <TradeProvider>
              <NotebookProvider>
                <AccountProvider>
                  <Routes>
                    <Route path="/" element={<Index />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/admin" element={<AdminDashboard />} />
                    <Route path="/trades" element={<Trades />} />
                    <Route path="/trades/:id" element={<Trades />} />
                    <Route path="/journal" element={<Journal />} />
                    <Route path="/add-trade" element={<AddTrade />} />
                    <Route path="/edit-trade/:id" element={<AddTrade />} />
                    <Route path="/analytics" element={<Analytics />} />
                    <Route path="/chart" element={<TradingChart />} />
                    <Route path="/tracking" element={<TradeTracking />} />
                    <Route path="/notebook" element={<Notebook />} />
                    <Route path="/insights" element={<Insights />} />
                    <Route path="/reports" element={<Reports />} />
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                  <Toaster />
                </AccountProvider>
              </NotebookProvider>
            </TradeProvider>
          </AuthProvider>
        </LanguageProvider>
      </Router>
    </Suspense>
  );
}

export default App;
