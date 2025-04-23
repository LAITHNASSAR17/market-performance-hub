
import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { BarChart, BookText, Calendar, Home, LineChart, LogOut, PlusCircle, Sparkles, Menu, UserCog, LineChart as LineChart3, BarChart2, Shield, ChevronDown, Settings, Scroll, CreditCard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { Moon, Sun } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({
  children
}) => {
  const { toast } = useToast();
  const location = useLocation();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [sidebarOpen, setSidebarOpen] = useState(!isMobile);
  const [theme, setTheme] = useState('light');
  const [user, setUser] = useState<any>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const siteName = localStorage.getItem('siteName') || 'TradeTracker';
  
  useEffect(() => {
    // Check if user is authenticated (for demo)
    const authStatus = localStorage.getItem('isAuthenticated') === 'true';
    setIsAuthenticated(authStatus);
    
    if (authStatus) {
      const storedUser = localStorage.getItem('user');
      setUser(storedUser ? JSON.parse(storedUser) : null);
    } else if (location.pathname !== '/login' && location.pathname !== '/register' && 
              location.pathname !== '/forgot-password' && location.pathname !== '/reset-password') {
      // Redirect to login if not authenticated and trying to access protected routes
      navigate('/login');
    }
  }, [location, navigate]);

  useEffect(() => {
    if (isMobile) {
      setSidebarOpen(false);
    } else {
      setSidebarOpen(true);
    }
  }, [isMobile]);

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    document.documentElement.classList.toggle('dark');
  };

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
    icon: Scroll,
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
  }, {
    name: 'Subscriptions',
    icon: CreditCard,
    href: '/subscriptions'
  }];

  const handleLogout = () => {
    // Clear authentication for demo
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('user');
    setIsAuthenticated(false);
    setUser(null);
    
    toast({
      title: "Logged Out",
      description: "You have been logged out successfully"
    });
    
    navigate('/login');
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  // If not authenticated and on a protected route, show nothing while redirecting
  if (!isAuthenticated && location.pathname !== '/login' && 
      location.pathname !== '/register' && location.pathname !== '/forgot-password' && 
      location.pathname !== '/reset-password') {
    return null;
  }

  // If on auth pages, don't show the layout
  if (location.pathname === '/login' || location.pathname === '/register' || 
      location.pathname === '/forgot-password' || location.pathname === '/reset-password') {
    return <>{children}</>;
  }

  return <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      <div className={cn("relative h-full bg-sidebar text-sidebar-foreground transition-all duration-300 ease-in-out z-30", sidebarOpen ? "w-64" : "w-16", "border-r", "dark:bg-indigo-900/90 dark:border-indigo-800")}>
        <div className="flex flex-col items-center py-4 px-4">
          <div className="flex items-center justify-between w-full">
            <Button variant="ghost" size="icon" onClick={toggleSidebar} className="text-sidebar-foreground dark:text-white">
              <Menu className="h-5 w-5" />
            </Button>
            
            {sidebarOpen && <h2 className="text-xl font-bold flex-1 text-center dark:text-white">{siteName}</h2>}
          </div>
          
          {sidebarOpen && <div className="flex items-center gap-2 mt-4 w-full">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="text-left w-full justify-between px-2 py-1 h-auto hover:bg-sidebar-accent">
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-gray-500 dark:text-gray-400 overflow-hidden">
                        {user?.name?.charAt(0) || 'U'}
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm font-medium dark:text-white truncate">{user?.name || 'User'}</span>
                        <span className="text-xs text-gray-500 dark:text-gray-400 truncate">{user?.email || 'user@example.com'}</span>
                      </div>
                      {user?.role === 'admin' && <div className="flex-shrink-0 ms-1">
                          <Shield className="h-4 w-4 text-purple-500" />
                        </div>}
                    </div>
                    <ChevronDown className="h-4 w-4 ms-2 opacity-50" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuItem asChild>
                    <Link to="/user-profile" className="flex items-center">
                      <UserCog className="mr-2 h-4 w-4" />
                      User Profile
                    </Link>
                  </DropdownMenuItem>
                  
                  {user?.role === 'admin' && <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <Link to="/admin" className="flex items-center text-purple-600">
                          <Shield className="mr-2 h-4 w-4" />
                          Admin Dashboard
                        </Link>
                      </DropdownMenuItem>
                    </>}
                  
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="text-red-500">
                    <LogOut className="mr-2 h-4 w-4" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>}
        </div>

        <div className="mt-4 overflow-y-auto max-h-[calc(100vh-200px)]">
          {navigation.map(item => {
          const isActive = location.pathname === item.href;
          return <Tooltip key={item.href}>
                <TooltipTrigger asChild>
                  <Link to={item.href} className={cn("flex items-center px-4 py-3 text-sm transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground dark:hover:bg-indigo-800 dark:hover:text-white", isActive && "bg-sidebar-accent text-sidebar-accent-foreground dark:bg-indigo-800 dark:text-white font-medium")}>
                    <item.icon className="h-5 w-5 flex-shrink-0" />
                    {sidebarOpen && <span className="ml-3">{item.name}</span>}
                  </Link>
                </TooltipTrigger>
                <TooltipContent side="right" align="center" hidden={sidebarOpen}>
                  {item.name}
                </TooltipContent>
              </Tooltip>;
        })}
        </div>

        <div className="absolute bottom-0 left-0 right-0 py-4 px-4">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" onClick={toggleTheme} className="w-full flex justify-center">
                {theme === 'dark' ? <Sun className="h-5 w-5 text-amber-300" /> : <Moon className="h-5 w-5 text-indigo-600" />}
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right">
              {theme === 'dark' ? 'Light mode' : 'Dark mode'}
            </TooltipContent>
          </Tooltip>
        </div>
      </div>

      {sidebarOpen && isMobile && <div className="fixed inset-0 bg-black bg-opacity-50 z-20" onClick={() => setSidebarOpen(false)} />}

      <main className="flex-1 overflow-y-auto bg-trading-background dark:bg-gray-800 p-4 md:p-6">
        {children}
      </main>
    </div>;
};

export default Layout;
