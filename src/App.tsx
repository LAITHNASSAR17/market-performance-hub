import { Route, Routes } from 'react-router-dom';
import './App.css'
import Auth from './pages/Auth.tsx';
import Home from './pages/Home.tsx';
import ProtectedRoute from './components/ProtectedRoute.tsx';
import { AuthProvider } from './contexts/AuthContext.tsx';
import ProfileSettings from './pages/ProfileSettings.tsx';
import Settings from './pages/Settings.tsx';
import AddTrade from './pages/AddTrade.tsx';
import Trades from './pages/Trades.tsx';
import TradeDetails from './pages/TradeDetails.tsx';
import Dashboard from './pages/Dashboard.tsx';
import Journal from './pages/Journal.tsx';
import { TradeProvider } from './contexts/TradeContext.tsx';
import { ThemeProvider } from './contexts/ThemeContext.tsx';
import { LanguageProvider } from './contexts/LanguageContext.tsx';
import PageTransition from './components/PageTransition.tsx';
import AdminRoute from './components/AdminRoute.tsx';
import AdminDashboard from './pages/admin/AdminDashboard.tsx';
import AdminTrades from './pages/admin/AdminTrades.tsx';
import { Toaster } from '@/components/ui/toaster';
import Notebook from './pages/Notebook.tsx';
import { NotebookProvider } from './contexts/NotebookContext.tsx';
import MetaTraderConnect from './pages/MetaTraderConnect.tsx';

function App() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <AuthProvider>
          <TradeProvider>
            <NotebookProvider>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/auth" element={<Auth />} />
                <Route path="/profile-settings" element={
                  <ProtectedRoute>
                    <PageTransition>
                      <ProfileSettings />
                    </PageTransition>
                  </ProtectedRoute>
                } />
                <Route path="/settings" element={
                  <ProtectedRoute>
                    <PageTransition>
                      <Settings />
                    </PageTransition>
                  </ProtectedRoute>
                } />
                <Route path="/add-trade" element={
                  <ProtectedRoute>
                    <PageTransition>
                      <AddTrade />
                    </PageTransition>
                  </ProtectedRoute>
                } />
                <Route path="/edit-trade/:id" element={
                  <ProtectedRoute>
                    <PageTransition>
                      <AddTrade />
                    </PageTransition>
                  </ProtectedRoute>
                } />
                <Route path="/trades" element={
                  <ProtectedRoute>
                    <PageTransition>
                      <Trades />
                    </PageTransition>
                  </ProtectedRoute>
                } />
                <Route path="/trade/:id" element={
                  <ProtectedRoute>
                    <PageTransition>
                      <TradeDetails />
                    </PageTransition>
                  </ProtectedRoute>
                } />
                <Route path="/dashboard" element={
                  <ProtectedRoute>
                    <PageTransition>
                      <Dashboard />
                    </PageTransition>
                  </ProtectedRoute>
                } />
                <Route path="/journal" element={
                  <ProtectedRoute>
                    <PageTransition>
                      <Journal />
                    </PageTransition>
                  </ProtectedRoute>
                } />
                <Route path="/notebook" element={
                  <ProtectedRoute>
                    <PageTransition>
                      <Notebook />
                    </PageTransition>
                  </ProtectedRoute>
                } />
                <Route path="/admin" element={
                  <AdminRoute>
                    <PageTransition>
                      <AdminDashboard />
                    </PageTransition>
                  </AdminRoute>
                } />
                <Route path="/admin/trades" element={
                  <AdminRoute>
                    <PageTransition>
                      <AdminTrades />
                    </PageTransition>
                  </AdminRoute>
                } />
                <Route path="/metatrader-connect" element={
                  <ProtectedRoute>
                    <PageTransition>
                      <MetaTraderConnect />
                    </PageTransition>
                  </ProtectedRoute>
                } />
              </Routes>
              <Toaster />
            </NotebookProvider>
          </TradeProvider>
        </AuthProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}

export default App;
