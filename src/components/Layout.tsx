
import React, { useState, useEffect } from 'react';
import { Link, useLocation, Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { BarChart, BookText, Calendar, Home, LineChart, LogOut, PlusCircle, Settings, Sparkles, Menu, X, UserCog, LineChart as LineChart3, BarChart2, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';
import { Badge } from '@/components/ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({
  children
}) => {
  const {
    isAuthenticated,
    logout,
    user
  } = useAuth();
  const {
    t,
    language
  } = useLanguage();
  const location = useLocation();
  const isMobile = useIsMobile();
  const [sidebarOpen, setSidebarOpen] = useState(!isMobile);

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

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900" dir={language === 'ar' ? 'rtl' : 'ltr'}>
      <div className={cn(
        "relative h-full bg-sidebar text-sidebar-foreground transition-all duration-300 ease-in-out z-30",
        sidebarOpen ? "w-64" : "w-16",
        language === 'ar' ? "border-l" : "border-r",
        "dark:bg-indigo-900/90 dark:border-indigo-800"
      )}>
        <div className="flex flex-col items-center py-4 px-4">
          <div className="flex items-center justify-between w-full">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleSidebar}
              className="text-sidebar-foreground dark:text-white"
            >
              <Menu className="h-5 w-5" />
            </Button>
            
            {sidebarOpen && (
              <h2 className="text-xl font-bold flex-1 text-center dark:text-white">{t('app.name') || 'TradeTracker'}</h2>
            )}
          </div>
          
          <div className="flex items-center gap-2 mt-4 w-full">
            <div className="flex items-center gap-2 flex-1">
              <span className="text-sm font-medium dark:text-white truncate">{user?.name}</span>
              {user?.isAdmin && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Link to="/admin">
                      <Button variant="ghost" size="icon" className="h-6 w-6 p-1">
                        <UserCog className="h-4 w-4 text-purple-500" />
                      </Button>
                    </Link>
                  </TooltipTrigger>
                  <TooltipContent side={language === 'ar' ? 'left' : 'right'}>
                    {language === 'ar' ? 'لوحة الإدارة' : 'Admin Dashboard'}
                  </TooltipContent>
                </Tooltip>
              )}
            </div>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" onClick={logout}>
                  <LogOut className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side={language === 'ar' ? 'left' : 'right'}>
                {t('auth.logout')}
              </TooltipContent>
            </Tooltip>
          </div>
          {!sidebarOpen && (
            <div className="mt-4 flex justify-center">
              {user?.isAdmin && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Link to="/admin">
                      <Button variant="ghost" size="icon" className="h-6 w-6 p-1">
                        <UserCog className="h-4 w-4 text-purple-500" />
                      </Button>
                    </Link>
                  </TooltipTrigger>
                  <TooltipContent side={language === 'ar' ? 'left' : 'right'}>
                    {language === 'ar' ? 'لوحة الإدارة' : 'Admin Dashboard'}
                  </TooltipContent>
                </Tooltip>
              )}
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" onClick={logout}>
                    <LogOut className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side={language === 'ar' ? 'left' : 'right'}>
                  {t('auth.logout')}
                </TooltipContent>
              </Tooltip>
            </div>
          )}
        </div>

        <div className="mt-4 overflow-y-auto max-h-[calc(100vh-200px)]">
          {navigation.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <Tooltip key={item.href}>
                <TooltipTrigger asChild>
                  <Link 
                    to={item.href} 
                    className={cn(
                      "flex items-center px-4 py-3 text-sm transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground dark:hover:bg-indigo-800 dark:hover:text-white",
                      isActive && "bg-sidebar-accent text-sidebar-accent-foreground dark:bg-indigo-800 dark:text-white font-medium"
                    )}
                  >
                    <item.icon className="h-5 w-5 flex-shrink-0" />
                    {sidebarOpen && <span className="ml-3">{item.name}</span>}
                  </Link>
                </TooltipTrigger>
                <TooltipContent 
                  side={language === 'ar' ? 'left' : 'right'} 
                  align="center"
                  hidden={sidebarOpen}
                >
                  {item.name}
                </TooltipContent>
              </Tooltip>
            );
          })}
        </div>

        <div className="absolute bottom-0 left-0 right-0 py-4 px-4">
          {/* Settings Button */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="outline" 
                size="sm" 
                asChild 
                className={cn(
                  "w-full flex items-center justify-center",
                  !sidebarOpen && "px-2"
                )}
              >
                <Link to="/settings">
                  <Settings className="h-4 w-4" />
                  {sidebarOpen && <span className="ml-2">{t('nav.settings') || 'Settings'}</span>}
                </Link>
              </Button>
            </TooltipTrigger>
            <TooltipContent 
              side={language === 'ar' ? 'left' : 'right'} 
              align="center"
              hidden={sidebarOpen}
            >
              {t('nav.settings') || 'Settings'}
            </TooltipContent>
          </Tooltip>
        </div>
      </div>

      {sidebarOpen && isMobile && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-20" 
          onClick={() => setSidebarOpen(false)} 
        />
      )}

      <main className="flex-1 overflow-y-auto bg-trading-background dark:bg-gray-800 p-4 md:p-6">
        {children}
      </main>
    </div>
  );
};

export default Layout;
