
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { TradeProvider } from './contexts/TradeContext';
import { LanguageProvider } from './contexts/LanguageContext';
import { NotebookProvider } from './contexts/NotebookContext';
import { SettingsProvider } from './contexts/SettingsContext';
import { ThemeProvider } from './components/theme-provider';
import { Toaster } from './components/ui/toaster';

// Import pages
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import EmailVerify from './pages/EmailVerify';
import Profile from './pages/Profile';
import AddTrade from './pages/AddTrade';
import EditTrade from './pages/EditTrade';
import Trades from './pages/Trades';
import Playbooks from './pages/Playbooks';
import PlaybookDetail from './pages/PlaybookDetail';
import Journal from './pages/Journal';
import Notebook from './pages/Notebook';
import Settings from './pages/Settings';
import NotFound from './pages/NotFound';

// Admin pages
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminUsers from './pages/admin/AdminUsers';
import AdminTrades from './pages/admin/AdminTrades';
import AdminNotes from './pages/admin/AdminNotes';
import AdminSettings from './pages/admin/AdminSettings';
import AdminLayout from './components/layouts/AdminLayout';

function App() {
  return (
    <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
      <LanguageProvider>
        <AuthProvider>
          <SettingsProvider>
            <TradeProvider>
              <NotebookProvider>
                <Router>
                  <Routes>
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/forgot-password" element={<ForgotPassword />} />
                    <Route path="/reset-password" element={<ResetPassword />} />
                    <Route path="/email-verify/:token" element={<EmailVerify />} />
                    
                    <Route path="/" element={<Dashboard />} />
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/profile" element={<Profile />} />
                    
                    <Route path="/trades" element={<Trades />} />
                    <Route path="/trades/add" element={<AddTrade />} />
                    <Route path="/trades/edit/:id" element={<EditTrade />} />
                    
                    <Route path="/playbooks" element={<Playbooks />} />
                    <Route path="/playbooks/:id" element={<PlaybookDetail />} />
                    
                    <Route path="/journal" element={<Journal />} />
                    <Route path="/notebook" element={<Notebook />} />
                    
                    <Route path="/settings" element={<Settings />} />

                    {/* Admin Routes */}
                    <Route path="/admin" element={<AdminLayout><AdminDashboard /></AdminLayout>} />
                    <Route path="/admin/users" element={<AdminLayout><AdminUsers /></AdminLayout>} />
                    <Route path="/admin/trades" element={<AdminLayout><AdminTrades /></AdminLayout>} />
                    <Route path="/admin/notes" element={<AdminLayout><AdminNotes /></AdminLayout>} />
                    <Route path="/admin/settings" element={<AdminLayout><AdminSettings /></AdminLayout>} />
                    
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                  <Toaster />
                </Router>
              </NotebookProvider>
            </TradeProvider>
          </SettingsProvider>
        </AuthProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}

export default App;
