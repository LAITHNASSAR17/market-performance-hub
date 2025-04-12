
import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthProvider } from './contexts/AuthContext';
import { MongoDBProvider } from './contexts/MongoDBContext';
import { Toaster } from './components/ui/toaster';

// Import your pages
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Settings from './pages/Settings';
import NotFound from './pages/NotFound';
import AdminDashboard from './pages/AdminDashboard'; // Using the existing AdminDashboard

const App: React.FC = () => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <MongoDBProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Login />} />
              <Route path="/login" element={<Login />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
          <Toaster />
        </MongoDBProvider>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;
