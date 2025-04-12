
import React, { useState, useEffect } from 'react';
import { Link, useLocation, Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { BarChart, BookText, Calendar, Home, LineChart, LogOut, PlusCircle, Settings, Sparkles, Menu, X, UserCog, LineChart as LineChart3, BarChart2, ChevronLeft, ChevronRight, FileImage, CreditCard, Moon, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';
import { Badge } from '@/components/ui/badge';
import ThemeToggle from '@/components/ThemeToggle';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import FaviconUpload from '@/components/FaviconUpload';
import { useTheme } from '@/contexts/ThemeContext';

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
  const location = useLocation();
  const isMobile = useIsMobile();
  const [sidebarOpen, setSidebarOpen] = useState(!isMobile);
  const [showFaviconModal, setShowFaviconModal] = useState(false);
  const { theme, toggleTheme } = useTheme();

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
      name: 'Dashboard',
      icon: Home,
      href: '/dashboard'
    }, 
    {
      name: 'Add Trade',
      icon: PlusCircle,
      href: '/add-trade'
    }, 
    {
      name: 'Trades',
      icon: BookText,
      href: '/trades'
    }, 
    {
      name: 'Journal',
      icon: Calendar,
      href: '/journal'
    }, 
    {
      name: 'Notebook',
      icon: BookText,
      href: '/notebook'
    }, 
    {
      name: 'Reports',
      icon: BarChart,
      href: '/reports'
    }, 
    {
      name: 'Insights',
      icon: Sparkles,
      href: '/insights'
    }, 
    {
      name: 'Analytics',
      icon: BarChart2,
      href: '/analytics'
    }, 
    {
      name: 'Chart',
      icon: LineChart3,
      href: '/chart'
    },
    {
      name: 'Subscriptions',
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
            
            <div className="flex items-center gap-2 mt-4 w-full">
              <div className="flex flex-col flex-1">
                <span className="text-sm font-medium dark:text-white">{user?.name}</span>
                <span className="text-xs text-muted-foreground dark:text-gray-300">{user?.email}</span>
              </div>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" onClick={logout}>
                    <LogOut className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="right">
                  Logout
                </TooltipContent>
              </Tooltip>
            </div>
            {!sidebarOpen && (
              <div className="mt-4 flex justify-center">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon" onClick={logout}>
                      <LogOut className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="right">
                    Logout
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
            {/* Theme Toggle */}
            <div className={cn(
              "flex items-center justify-between bg-gray-100 dark:bg-indigo-800/60 px-2 py-2 rounded-lg mb-2",
              !sidebarOpen && "flex-col gap-2"
            )}>
              <span className={cn(
                "text-sm text-gray-700 dark:text-gray-300",
                !sidebarOpen && "hidden"
              )}>
                Theme
              </span>
              <button 
                onClick={toggleTheme}
                className="p-1.5 rounded-md bg-gray-200 dark:bg-gray-600"
              >
                {theme === 'dark' ? (
                  <Sun className="h-4 w-4 text-amber-500" />
                ) : (
                  <Moon className="h-4 w-4 text-indigo-600" />
                )}
              </button>
            </div>
            
            {/* Admin Link (if user is admin) */}
            {isAdmin && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    asChild 
                    className={cn(
                      "w-full flex items-center justify-center bg-purple-50 text-purple-800 border-purple-200 hover:bg-purple-100 dark:bg-purple-900/20 dark:text-purple-400 dark:border-purple-800/30 dark:hover:bg-purple-900/30",
                      !sidebarOpen && "px-2"
                    )}
                  >
                    <Link to="/admin">
                      <ShieldAlert className="h-4 w-4" />
                      {sidebarOpen && <span className="ml-2">Admin Panel</span>}
                    </Link>
                  </Button>
                </TooltipTrigger>
                <TooltipContent 
                  side="right" 
                  align="center"
                  hidden={sidebarOpen}
                >
                  Admin Panel
                </TooltipContent>
              </Tooltip>
            )}
            
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
                    {sidebarOpen && <span className="ml-2">Settings</span>}
                  </Link>
                </Button>
              </TooltipTrigger>
              <TooltipContent 
                side="right" 
                align="center"
                hidden={sidebarOpen}
              >
                Settings
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
      
      {/* Favicon Upload Modal */}
      {showFaviconModal && (
        <FaviconUpload isOpen={showFaviconModal} onClose={() => setShowFaviconModal(false)} />
      )}
    </TooltipProvider>
  );
};

export default Layout;
