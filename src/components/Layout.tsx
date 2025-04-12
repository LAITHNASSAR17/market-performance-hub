import React from 'react';
import { Link, useLocation, Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { 
  BarChart, 
  BookText, 
  Calendar, 
  Home, 
  LineChart, 
  LogOut, 
  PlusCircle, 
  Settings, 
  Sparkles,
  Menu,
  X,
  UserCog,
  ShieldAlert,
  LineChart as LineChart3,
  BarChart2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';
import { Badge } from '@/components/ui/badge';
import LanguageToggle from '@/components/LanguageToggle';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { isAuthenticated, logout, user, isAdmin } = useAuth();
  const { t, language } = useLanguage();
  const location = useLocation();
  const isMobile = useIsMobile();
  
  // Remove the sidebar state - let Dashboard handle its own sidebar
  // const [sidebarOpen, setSidebarOpen] = React.useState(!isMobile);

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  // We're removing the sidebar from Layout and keeping it only in Dashboard
  return (
    <div className="flex h-screen bg-gray-50" dir={language === 'ar' ? 'rtl' : 'ltr'}>
      {/* Main content */}
      <main className="flex-1 overflow-y-auto bg-trading-background p-6">
        {children}
      </main>
    </div>
  );
};

export default Layout;
