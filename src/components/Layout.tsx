
import React, { useState, useEffect } from 'react';
import { Link, useLocation, Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { 
  LayoutDashboard, 
  BookText, 
  Calendar, 
  LineChart, 
  LogOut, 
  PlusCircle, 
  Settings,
  Bell,
  UserCircle,
  Menu,
  Table2,
  Building2,
  BookMarked,
  Activity,
  UserCog,
  ChevronDown 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { isAuthenticated, logout, user, isAdmin } = useAuth();
  const { toast } = useToast();
  const location = useLocation();
  const isMobile = useIsMobile();
  const [sidebarOpen, setSidebarOpen] = useState(!isMobile);

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

  const navigation = [
    { name: 'Dashboard', icon: LayoutDashboard, href: '/dashboard' },
    { name: 'Tables', icon: Table2, href: '/trades' },
    { name: 'Calendar', icon: Calendar, href: '/journal' },
    { name: 'Analytics', icon: Activity, href: '/analytics' },
    { name: 'Notebook', icon: BookMarked, href: '/notebook' },
    { name: 'Reports', icon: BookText, href: '/reports' },
    { name: 'Chart', icon: LineChart, href: '/chart' },
    { name: 'Settings', icon: Settings, href: '/settings' },
  ];

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
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
      <div className={cn(
        "relative h-full transition-all duration-300 ease-in-out z-30",
        sidebarOpen ? "w-64" : "w-16",
        "bg-[#2D3748] border-r border-gray-700"
      )}>
        <div className="flex flex-col h-full">
          <div className="flex flex-col items-center py-4 px-4">
            <div className="flex items-center justify-between w-full">
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={toggleSidebar}
                className="text-gray-400 hover:text-white hover:bg-gray-700"
              >
                <Menu className="h-5 w-5" />
              </Button>
              
              {sidebarOpen && (
                <h2 className="text-xl font-bold text-gray-200 flex-1 text-center">
                  {siteName}
                </h2>
              )}
            </div>
          </div>

          <div className="mt-4 flex-1 overflow-y-auto">
            {navigation.map(item => {
              const isActive = location.pathname === item.href;
              return (
                <Tooltip key={item.href}>
                  <TooltipTrigger asChild>
                    <Link 
                      to={item.href} 
                      className={cn(
                        "flex items-center px-4 py-3 text-sm transition-colors",
                        isActive 
                          ? "bg-[#3182CE] text-white" 
                          : "text-gray-400 hover:bg-gray-700 hover:text-white",
                      )}
                    >
                      <item.icon className="h-5 w-5 flex-shrink-0" />
                      {sidebarOpen && <span className="ml-3">{item.name}</span>}
                    </Link>
                  </TooltipTrigger>
                  <TooltipContent side="right" align="center" hidden={sidebarOpen}>
                    {item.name}
                  </TooltipContent>
                </Tooltip>
              );
            })}
          </div>

          {sidebarOpen && (
            <div className="p-4 border-t border-gray-700">
              <Button 
                variant="secondary" 
                className="w-full bg-[#3182CE] hover:bg-blue-600 text-white"
              >
                Upgrade to Pro
              </Button>
            </div>
          )}

          <div className="p-4 border-t border-gray-700">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  className="w-full justify-between text-gray-400 hover:text-white hover:bg-gray-700"
                >
                  <div className="flex items-center gap-2">
                    <UserCircle className="h-5 w-5" />
                    {sidebarOpen && (
                      <span className="text-sm">{user?.name || 'User'}</span>
                    )}
                  </div>
                  {sidebarOpen && <ChevronDown className="h-4 w-4 opacity-50" />}
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
                        <Building2 className="mr-2 h-4 w-4" />
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
          </div>
        </div>
      </div>

      {/* Mobile overlay */}
      {sidebarOpen && isMobile && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-20" 
          onClick={() => setSidebarOpen(false)} 
        />
      )}

      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  );
};

export default Layout;
