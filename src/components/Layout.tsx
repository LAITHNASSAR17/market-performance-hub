import React from 'react';
import { Link, useLocation, Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { BarChart, BookText, Calendar, Home, LineChart, LogOut, PlusCircle, Settings, Sparkles, Menu, X, UserCog, ShieldAlert, LineChart as LineChart3, BarChart2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';
import { Badge } from '@/components/ui/badge';
import LanguageToggle from '@/components/LanguageToggle';
interface LayoutProps {
  children: React.ReactNode;
}
const Layout: React.FC<LayoutProps> = ({
  children
}) => {
  const {
    isAuthenticated,
    logout,
    user,
    isAdmin
  } = useAuth();
  const {
    t,
    language
  } = useLanguage();
  const location = useLocation();
  const isMobile = useIsMobile();
  const [sidebarOpen, setSidebarOpen] = React.useState(!isMobile);
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }
  const navigation = [{
    name: t('nav.dashboard'),
    icon: Home,
    href: '/dashboard'
  }, {
    name: t('nav.addTrade'),
    icon: PlusCircle,
    href: '/add-trade'
  }, {
    name: t('nav.trades'),
    icon: BookText,
    href: '/trades'
  }, {
    name: t('nav.journal'),
    icon: Calendar,
    href: '/journal'
  }, {
    name: t('nav.notebook'),
    icon: BookText,
    href: '/notebook'
  }, {
    name: t('nav.reports'),
    icon: BarChart,
    href: '/reports'
  }, {
    name: t('nav.insights'),
    icon: Sparkles,
    href: '/insights'
  }, {
    name: t('analytics.title') || 'Analytics',
    icon: BarChart2,
    href: '/analytics'
  }, {
    name: t('chart.title') || 'Chart',
    icon: LineChart3,
    href: '/chart'
  }];

  // Add admin link only for admin users
  if (isAdmin) {
    navigation.push({
      name: t('nav.adminPanel'),
      icon: ShieldAlert,
      href: '/admin'
    });
  }
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };
  return <div className="flex h-screen bg-gray-50" dir={language === 'ar' ? 'rtl' : 'ltr'}>
      {/* Mobile menu button */}
      <div className={`fixed top-4 ${language === 'ar' ? 'right-4' : 'left-4'} z-50 md:hidden`}>
        <Button variant="outline" size="icon" onClick={toggleSidebar} className="rounded-full bg-white shadow-md">
          {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </div>

      {/* Sidebar */}
      <div className={cn("fixed inset-y-0 transform bg-trading-blue text-white shadow-lg transition-transform duration-300 ease-in-out md:relative", language === 'ar' ? sidebarOpen ? "translate-x-0 right-0" : "translate-x-full right-0" : sidebarOpen ? "translate-x-0 left-0" : "-translate-x-full left-0", "w-64 md:translate-x-0")}>
        <div className="flex h-full flex-col">
          

          

          <div className="p-4 border-t border-trading-blue-dark">
            <div className="mb-4">
              
              <p className="text-sm text-gray-300 truncate">{user?.name}</p>
              {isAdmin && <Badge className="mt-1 bg-purple-500">{t('nav.admin')}</Badge>}
            </div>
            <div className="flex justify-between items-center">
              <Button variant="outline" className="flex-1 justify-start text-white border-white hover:bg-trading-blue-dark" onClick={logout}>
                <LogOut className={`h-4 w-4 ${language === 'ar' ? 'ml-2' : 'mr-2'}`} />
                {t('nav.logout')}
              </Button>
              
              <LanguageToggle className="text-white hover:bg-trading-blue-dark" />
            </div>
          </div>
        </div>
      </div>

      {/* Overlay for mobile */}
      {sidebarOpen && isMobile && <div className="fixed inset-0 bg-black bg-opacity-50 z-30" onClick={() => setSidebarOpen(false)} />}

      {/* Main content */}
      <main className="flex-1 overflow-y-auto bg-trading-background p-6">
        {children}
      </main>
    </div>;
};
export default Layout;