
import React, { useState, useEffect } from 'react';
import { Link, useLocation, Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { BarChart, BookText, Calendar, Home, LineChart, LogOut, PlusCircle, Settings, Sparkles, Menu, X, UserCog, ShieldAlert, LineChart as LineChart3, BarChart2, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';
import { Badge } from '@/components/ui/badge';
import LanguageToggle from '@/components/LanguageToggle';
import {
  SidebarProvider,
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarSeparator
} from '@/components/ui/sidebar';

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
  const [sidebarOpen, setSidebarOpen] = useState(!isMobile);

  // Handle window resize to auto-collapse sidebar on mobile
  useEffect(() => {
    if (isMobile) {
      setSidebarOpen(false);
    } else {
      setSidebarOpen(true);
    }
  }, [isMobile]);

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

  return (
    <SidebarProvider defaultOpen={!isMobile}>
      <div className="flex h-screen bg-gray-50" dir={language === 'ar' ? 'rtl' : 'ltr'}>
        {/* Sidebar */}
        <div className={cn(
          "relative h-full bg-sidebar text-sidebar-foreground transition-all duration-300 ease-in-out z-30",
          sidebarOpen ? "w-64" : "w-16",
          language === 'ar' ? "border-l" : "border-r"
        )}>
          {/* Sidebar Header */}
          <div className="flex flex-col items-center py-4 px-4">
            <div className="flex items-center justify-between w-full">
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleSidebar}
                className="text-sidebar-foreground"
              >
                <Menu className="h-5 w-5" />
              </Button>
              
              {sidebarOpen && (
                <h2 className="text-xl font-bold flex-1 text-center">{t('app.name') || 'TradeTracker'}</h2>
              )}
              
              <LanguageToggle />
            </div>
            
            {sidebarOpen && (
              <div className="flex items-center gap-2 mt-4 w-full">
                <div className="flex flex-col flex-1">
                  <span className="text-sm font-medium">{user?.name}</span>
                  <span className="text-xs text-muted-foreground">{user?.email}</span>
                </div>
                <Button variant="ghost" size="icon" onClick={logout} title={t('auth.logout')}>
                  <LogOut className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>

          <div className="mt-4 overflow-y-auto max-h-[calc(100vh-200px)]">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <Link 
                  key={item.href} 
                  to={item.href} 
                  className={cn(
                    "flex items-center px-4 py-3 text-sm transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                    isActive && "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                  )}
                  title={!sidebarOpen ? item.name : undefined}
                >
                  <item.icon className="h-5 w-5 flex-shrink-0" />
                  {sidebarOpen && <span className="ml-3">{item.name}</span>}
                </Link>
              );
            })}
          </div>

          {/* Footer */}
          <div className="absolute bottom-0 left-0 right-0 py-4 px-4">
            <Button 
              variant="outline" 
              size="sm" 
              asChild 
              className={cn(
                "w-full flex items-center justify-center",
                !sidebarOpen && "px-2"
              )}
              title={!sidebarOpen ? t('nav.settings') : undefined}
            >
              <Link to="/settings">
                <Settings className="h-4 w-4" />
                {sidebarOpen && <span className="ml-2">{t('nav.settings') || 'Settings'}</span>}
              </Link>
            </Button>
          </div>
        </div>

        {/* Overlay for mobile */}
        {sidebarOpen && isMobile && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-20" 
            onClick={() => setSidebarOpen(false)} 
          />
        )}

        {/* Main content */}
        <main className="flex-1 overflow-y-auto bg-trading-background p-6">
          {children}
        </main>
      </div>
    </SidebarProvider>
  );
};

export default Layout;
