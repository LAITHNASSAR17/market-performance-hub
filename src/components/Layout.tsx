
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
  LineChart as LineChart3
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import LanguageToggle from '@/components/LanguageToggle';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { isAuthenticated, logout, user, isAdmin } = useAuth();
  const { t } = useLanguage();
  const location = useLocation();
  const isMobile = useIsMobile();
  const [sidebarOpen, setSidebarOpen] = React.useState(!isMobile);

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  const navigation = [
    { name: t('nav.dashboard'), icon: Home, href: '/dashboard' },
    { name: t('nav.addTrade'), icon: PlusCircle, href: '/add-trade' },
    { name: t('nav.trades'), icon: BookText, href: '/trades' },
    { name: t('nav.journal'), icon: Calendar, href: '/journal' },
    { name: t('nav.notebook'), icon: BookText, href: '/notebook' },
    { name: t('nav.reports'), icon: BarChart, href: '/reports' },
    { name: t('nav.insights'), icon: Sparkles, href: '/insights' },
    { name: t('chart.title') || 'الشارت', icon: LineChart3, href: '/chart' },
  ];

  // Add admin link only for admin users
  if (isAdmin) {
    navigation.push({ name: t('nav.adminPanel'), icon: ShieldAlert, href: '/admin' });
  }

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Mobile menu button */}
      <div className="fixed top-4 left-4 z-50 md:hidden">
        <Button
          variant="outline"
          size="icon"
          onClick={toggleSidebar}
          className="rounded-full bg-white shadow-md"
        >
          {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </div>

      {/* Sidebar */}
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-40 w-64 transform bg-white shadow-lg transition-transform duration-300 ease-in-out md:relative md:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex h-full flex-col">
          <div className="flex items-center justify-between h-16 px-4 border-b">
            <h1 className="text-xl font-bold text-trading-blue">{t('nav.platform')}</h1>
            <LanguageToggle />
          </div>

          <div className="flex-1 overflow-y-auto py-4 px-3">
            <nav className="space-y-1">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className={cn(
                    "flex items-center px-4 py-3 text-sm font-medium rounded-md",
                    location.pathname === item.href
                      ? "bg-blue-50 text-trading-blue"
                      : "text-gray-700 hover:bg-gray-100"
                  )}
                  onClick={() => isMobile && setSidebarOpen(false)}
                >
                  <item.icon className="mr-3 h-5 w-5" />
                  {item.name}
                </Link>
              ))}
            </nav>
          </div>

          <div className="p-4 border-t">
            <div className="mb-4">
              <p className="text-sm font-medium text-gray-700">{t('nav.loggedInAs')}</p>
              <p className="text-sm text-gray-500 truncate">{user?.name}</p>
              {isAdmin && (
                <Badge className="mt-1 bg-purple-500">{t('nav.admin')}</Badge>
              )}
            </div>
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={logout}
            >
              <LogOut className="mr-2 h-4 w-4" />
              {t('nav.logout')}
            </Button>
          </div>
        </div>
      </div>

      {/* Overlay for mobile */}
      {sidebarOpen && isMobile && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-30"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main content */}
      <main className="flex-1 overflow-y-auto bg-trading-background p-6">
        {children}
      </main>
    </div>
  );
};

export default Layout;
