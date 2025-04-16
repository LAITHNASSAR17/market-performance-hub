
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { LanguageProvider } from './contexts/LanguageContext';
import { TradeProvider } from './contexts/TradeContext';
import { Toaster } from './components/ui/toaster';
import { TooltipProvider } from './components/ui/tooltip';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Settings from './pages/Settings';
import Index from './pages/Index';

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
                  <Route path="/" element={<Index />} />
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/settings" element={<Settings />} />
                  <Route path="/add-trade" element={<Navigate to="/dashboard" />} />
                  <Route path="/trades" element={<Navigate to="/dashboard" />} />
                  <Route path="/journal" element={<Navigate to="/dashboard" />} />
                  <Route path="/notebook" element={<Navigate to="/dashboard" />} />
                  <Route path="/reports" element={<Navigate to="/dashboard" />} />
                  <Route path="/insights" element={<Navigate to="/dashboard" />} />
                  <Route path="/analytics" element={<Navigate to="/dashboard" />} />
                  <Route path="/chart" element={<Navigate to="/dashboard" />} />
                  <Route path="/admin" element={<Navigate to="/dashboard" />} />
                  <Route path="/profile" element={<Navigate to="/settings" />} />
                  <Route path="*" element={<Navigate to="/dashboard" />} />
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
