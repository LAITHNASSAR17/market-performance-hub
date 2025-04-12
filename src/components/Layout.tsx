
import React, { useState, useEffect } from 'react';
import { Link, useLocation, Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { BarChart, BookText, Calendar, Home, LogOut, PlusCircle, Settings, Sparkles, Menu, LineChart as LineChart3, BarChart2, CreditCard, UserCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useLanguage } from '@/contexts/LanguageContext';

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
  const { t } = useLanguage();
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

  const navigation = [
    {
      name: t('nav.dashboard') || 'Dashboard',
      icon: Home,
      href: '/dashboard'
    }, 
    {
      name: t('nav.addTrade') || 'Add Trade',
      icon: PlusCircle,
      href: '/add-trade'
    }, 
    {
      name: t('nav.trades') || 'Trades',
      icon: BookText,
      href: '/trades'
    }, 
    {
      name: t('nav.journal') || 'Journal',
      icon: Calendar,
      href: '/journal'
    }, 
    {
      name: t('nav.notebook') || 'Notebook',
      icon: BookText,
      href: '/notebook'
    }, 
    {
      name: t('nav.reports') || 'Reports',
      icon: BarChart,
      href: '/reports'
    }, 
    {
      name: t('nav.insights') || 'Insights',
      icon: Sparkles,
      href: '/insights'
    }, 
    {
      name: t('nav.analytics') || 'Analytics',
      icon: BarChart2,
      href: '/analytics'
    }, 
    {
      name: t('nav.chart') || 'Chart',
      icon: LineChart3,
      href: '/chart'
    },
    {
      name: t('nav.subscriptions') || 'Subscriptions',
      icon: CreditCard,
      href: '/subscriptions'
    }
  ];

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <TooltipProvider delayDuration={300}>
      <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
        <div className={cn(
          "relative h-full bg-sidebar text-sidebar-foreground transition-all duration-300 ease-in-out z-30",
          sidebarOpen ? "w-64" : "w-16",
          "border-r",
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
                <h2 className="text-xl font-bold flex-1 text-center dark:text-white">TradeTracker</h2>
              )}
            </div>
          </div>

          {/* User Profile Section */}
          {sidebarOpen && (
            <div className="px-4 py-3 mb-2 border-b dark:border-indigo-800/50">
              <div className="flex items-center gap-3">
                <div className="bg-indigo-100 dark:bg-indigo-800 p-2 rounded-full">
                  <UserCircle className="h-6 w-6 text-indigo-600 dark:text-indigo-300" />
                </div>
                <div className="overflow-hidden">
                  <p className="font-medium text-sm truncate">{user?.name}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                    {user?.isAdmin ? t('nav.admin') || 'Administrator' : t('nav.platform') || 'Basic Plan'}
                  </p>
                </div>
              </div>
            </div>
          )}

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
                    side="right" 
                    align="center"
                    hidden={sidebarOpen}
                  >
                    {item.name}
                  </TooltipContent>
                </Tooltip>
              );
            })}
          </div>

          <div className="absolute bottom-0 left-0 right-0 py-4 px-4 space-y-2">
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
                side="right" 
                align="center"
                hidden={sidebarOpen}
              >
                {t('nav.settings') || 'Settings'}
              </TooltipContent>
            </Tooltip>
            
            {/* Logout Button */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={logout}
                  className={cn(
                    "w-full flex items-center justify-center text-red-600",
                    !sidebarOpen && "px-2"
                  )}
                >
                  <LogOut className="h-4 w-4" />
                  {sidebarOpen && <span className="ml-2">{t('nav.logout') || 'Logout'}</span>}
                </Button>
              </TooltipTrigger>
              <TooltipContent 
                side="right" 
                align="center"
                hidden={sidebarOpen}
              >
                {t('nav.logout') || 'Logout'}
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
    </TooltipProvider>
  );
};

export default Layout;
