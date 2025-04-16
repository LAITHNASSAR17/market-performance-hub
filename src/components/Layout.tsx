
import React, { useState, useEffect } from 'react';
import { Link, useLocation, Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { BarChart, BookText, Calendar, Home, LineChart, LogOut, PlusCircle, Sparkles, Menu, UserCog, LineChart as LineChart3, BarChart2, Shield, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { Moon, Sun } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { isAuthenticated, logout, user, isAdmin } = useAuth();
  const { toast } = useToast();
  const { t } = useLanguage();
  const location = useLocation();
  const isMobile = useIsMobile();
  const [sidebarOpen, setSidebarOpen] = useState(!isMobile);
  const { theme, toggleTheme } = useTheme();

  const siteName = localStorage.getItem('siteName') || 'TradeTracker';

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
    name: 'Dashboard',
    icon: Home,
    href: '/dashboard'
  }, {
    name: 'Add Trade',
    icon: PlusCircle,
    href: '/add-trade'
  }, {
    name: 'Trades',
    icon: BookText,
    href: '/trades'
  }, {
    name: 'Journal',
    icon: Calendar,
    href: '/journal'
  }, {
    name: 'Notebook',
    icon: BookText,
    href: '/notebook'
  }, {
    name: 'Reports',
    icon: BarChart,
    href: '/reports'
  }, {
    name: 'Insights',
    icon: Sparkles,
    href: '/insights'
  }, {
    name: 'Analytics',
    icon: BarChart2,
    href: '/analytics'
  }, {
    name: 'Chart',
    icon: LineChart3,
    href: '/chart'
  }];

  const handleLogout = async () => {
    try {
      await logout();
      toast({
        title: "Logged Out",
        description: "You have been logged out successfully"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "An error occurred while logging out",
        variant: "destructive"
      });
    }
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <div className={cn("fixed h-full bg-sidebar text-sidebar-foreground transition-all duration-300 ease-in-out z-30", sidebarOpen ? "w-52" : "w-14", "border-r")}>
        <div className="flex flex-col items-center py-3 px-3">
          <div className="flex items-center justify-between w-full">
            <Button variant="ghost" size="icon" onClick={toggleSidebar} className="text-sidebar-foreground">
              <Menu className="h-5 w-5" />
            </Button>
            
            {sidebarOpen && <h2 className="text-lg font-bold flex-1 text-center">{siteName}</h2>}
          </div>
          
          {sidebarOpen && <div className="flex items-center gap-2 mt-3 w-full">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="text-left w-full justify-between px-2 py-1 h-auto hover:bg-sidebar-accent">
                    <div className="flex items-center gap-2">
                      <div className="h-7 w-7 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 overflow-hidden">
                        {user?.name?.charAt(0) || 'U'}
                      </div>
                      <div className="flex flex-col">
                        <span className="text-xs font-medium truncate">{user?.name || 'User'}</span>
                        <span className="text-xs text-gray-500 truncate">{user?.email || 'user@example.com'}</span>
                      </div>
                      {isAdmin && (
                        <div className="flex-shrink-0 ms-1">
                          <Shield className="h-3 w-3 text-purple-500" />
                        </div>
                      )}
                    </div>
                    <ChevronDown className="h-3 w-3 ms-1 opacity-50" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuItem asChild>
                    <Link to="/profile" className="flex items-center">
                      <UserCog className="mr-2 h-4 w-4" />
                      Profile Settings
                    </Link>
                  </DropdownMenuItem>
                  
                  {isAdmin && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <Link to="/admin" className="flex items-center text-purple-600">
                          <Shield className="mr-2 h-4 w-4" />
                          Admin Dashboard
                        </Link>
                      </DropdownMenuItem>
                    </>
                  )}
                  
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="text-red-500">
                    <LogOut className="mr-2 h-4 w-4" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>}
        </div>

        <div className="mt-2 overflow-y-auto max-h-[calc(100vh-120px)]">
          {navigation.map(item => {
            const isActive = location.pathname === item.href;
            return (
              <Tooltip key={item.href}>
                <TooltipTrigger asChild>
                  <Link 
                    to={item.href} 
                    className={cn("flex items-center px-3 py-2 text-sm transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground", 
                      isActive && "bg-sidebar-accent text-sidebar-accent-foreground font-medium")}
                  >
                    <item.icon className="h-4 w-4 flex-shrink-0" />
                    {sidebarOpen && <span className="ml-2 text-sm">{item.name}</span>}
                  </Link>
                </TooltipTrigger>
                <TooltipContent side="right" align="center" hidden={sidebarOpen}>
                  {item.name}
                </TooltipContent>
              </Tooltip>
            );
          })}
        </div>
      </div>

      {sidebarOpen && isMobile && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-20" onClick={() => setSidebarOpen(false)} />
      )}

      <main className={cn("flex-1 overflow-x-hidden bg-white p-3 md:p-4", sidebarOpen ? "ml-14 md:ml-52" : "ml-14")}>
        {children}
      </main>
    </div>
  );
};

export default Layout;
