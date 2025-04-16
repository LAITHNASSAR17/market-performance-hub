
import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { LanguageProvider } from './contexts/LanguageContext';
import { TradeProvider } from './contexts/TradeContext';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Toaster } from './components/ui/toaster';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Index from './pages/Index';
import Layout from './components/Layout';
import AdminLayout from './components/layouts/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminUsers from './pages/admin/AdminUsers';
import AdminTrades from './pages/admin/AdminTrades';
import AdminHashtags from './pages/admin/AdminHashtags';
import AdminNotes from './pages/admin/AdminNotes';
import AdminSettings from './pages/admin/AdminSettings';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ThemeProvider>
          <LanguageProvider>
            <TradeProvider>
              <TooltipProvider>
                <Toaster />
                <Routes>
                  {/* Main Routes */}
                  <Route path="/" element={<Index />} />
                  <Route path="/login" element={<Login />} />
                  
                  {/* App Routes */}
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/add-trade" element={<Dashboard />} />
                  <Route path="/trades" element={<Dashboard />} />
                  <Route path="/journal" element={<Dashboard />} />
                  <Route path="/notebook" element={<Dashboard />} />
                  <Route path="/reports" element={<Dashboard />} />
                  <Route path="/insights" element={<Dashboard />} />
                  <Route path="/analytics" element={<Dashboard />} />
                  <Route path="/chart" element={<Dashboard />} />
                  <Route path="/profile" element={<Dashboard />} />
                  
                  {/* Admin Routes */}
                  <Route path="/admin" element={<AdminDashboard />} />
                  <Route path="/admin/users" element={<AdminUsers />} />
                  <Route path="/admin/trades" element={<AdminTrades />} />
                  <Route path="/admin/hashtags" element={<AdminHashtags />} />
                  <Route path="/admin/notes" element={<AdminNotes />} />
                  <Route path="/admin/settings" element={<AdminSettings />} />
                  
                  {/* Fallback Route */}
                  <Route path="*" element={<Login />} />
                </Routes>
              </TooltipProvider>
            </TradeProvider>
          </LanguageProvider>
        </ThemeProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
