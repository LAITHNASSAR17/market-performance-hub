
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
    { name: t('analytics.title') || 'Analytics', icon: BarChart2, href: '/analytics' },
    { name: t('chart.title') || 'Chart', icon: LineChart, href: '/chart' },
  ];

  // Add admin link only for admin users
  if (isAdmin) {
    navigation.push({ name: t('nav.adminPanel'), icon: ShieldAlert, href: '/admin' });
  }

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="flex h-screen bg-gray-50" dir={language === 'ar' ? 'rtl' : 'ltr'}>
      {/* Mobile menu button */}
      <div className={`fixed top-4 ${language === 'ar' ? 'right-4' : 'left-4'} z-50 md:hidden`}>
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
          "fixed inset-y-0 transform bg-gradient-to-b from-purple-700 to-purple-900 text-white shadow-lg transition-transform duration-300 ease-in-out md:relative",
          language === 'ar' 
            ? (sidebarOpen ? "translate-x-0 right-0" : "translate-x-full right-0") 
            : (sidebarOpen ? "translate-x-0 left-0" : "-translate-x-full left-0"),
          "w-72 md:translate-x-0"
        )}
      >
        <div className="flex h-full flex-col">
          <div className="flex items-center justify-between h-16 px-5 border-b border-purple-600">
            <h1 className="text-xl font-bold text-white">{t('nav.platform')}</h1>
            <Button 
              variant="ghost" 
              size="icon" 
              className="text-white hover:bg-purple-600 md:hidden"
              onClick={toggleSidebar}
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          <div className="flex-1 overflow-y-auto py-6 px-4">
            <nav className="space-y-3">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className={cn(
                    "flex items-center px-5 py-3 text-sm font-medium rounded-lg transition-colors",
                    location.pathname === item.href
                      ? "bg-purple-800 text-white"
                      : "text-purple-100 hover:bg-purple-800 hover:text-white"
                  )}
                  onClick={() => isMobile && setSidebarOpen(false)}
                >
                  <item.icon className={`h-5 w-5 ${language === 'ar' ? 'ml-3' : 'mr-3'}`} />
                  {item.name}
                </Link>
              ))}
            </nav>
          </div>

          <div className="p-5 border-t border-purple-600">
            <div className="mb-4">
              <p className="text-sm font-medium text-purple-200">{t('nav.loggedInAs')}</p>
              <p className="text-sm text-white truncate">{user?.name}</p>
              {isAdmin && (
                <Badge className="mt-1 bg-purple-500">{t('nav.admin')}</Badge>
              )}
            </div>
            <div className="flex flex-col space-y-2">
              <Button
                variant="outline"
                className="w-full justify-start text-white border-purple-400 hover:bg-purple-600"
                onClick={logout}
              >
                <LogOut className={`h-4 w-4 ${language === 'ar' ? 'ml-2' : 'mr-2'}`} />
                {t('nav.logout')}
              </Button>
              
              <LanguageToggle className="w-full justify-start text-white hover:bg-purple-600" />
            </div>
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
