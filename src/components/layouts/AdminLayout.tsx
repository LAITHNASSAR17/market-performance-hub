
import React from 'react';
import { Navigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { 
  LayoutDashboard, 
  Users, 
  TrendingUp, 
  Hash, 
  FileText, 
  Settings, 
  LogOut,
  Layers,
  Sun,
  Moon,
  Shield
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useTheme } from '@/contexts/ThemeContext';
import { Button } from '@/components/ui/button';

interface AdminLayoutProps {
  children: React.ReactNode;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const { user, isAdmin, logout } = useAuth();
  const { toast } = useToast();
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();
  
  // Redirect non-admin users to dashboard
  if (!isAdmin) {
    toast({
      title: "Access Denied",
      description: "You don't have permission to access the admin area",
      variant: "destructive"
    });
    return <Navigate to="/dashboard" />;
  }

  const handleLogout = () => {
    logout();
    toast({
      title: "Logged Out",
      description: "You have been logged out successfully"
    });
  };

  const navItems = [
    { icon: <LayoutDashboard className="w-5 h-5" />, label: "Dashboard", path: "/admin" },
    { icon: <Users className="w-5 h-5" />, label: "Users", path: "/admin/users" },
    { icon: <TrendingUp className="w-5 h-5" />, label: "Trades", path: "/admin/trades" },
    { icon: <Hash className="w-5 h-5" />, label: "Hashtags", path: "/admin/hashtags" },
    { icon: <FileText className="w-5 h-5" />, label: "Notes", path: "/admin/notes" },
    { icon: <Layers className="w-5 h-5" />, label: "Pages", path: "/admin/pages" },
    { icon: <Settings className="w-5 h-5" />, label: "Settings", path: "/admin/settings" },
  ];

  // Check if the current path matches the item
  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
      {/* Admin Sidebar */}
      <div className="w-64 hidden md:block bg-white dark:bg-gray-800 shadow-md">
        <div className="flex flex-col h-full">
          <div className="p-4 border-b dark:border-gray-700">
            <div className="flex items-center gap-3">
              <div className="bg-purple-600 p-2 rounded-lg">
                <Shield className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className="font-bold text-xl">Admin Panel</h2>
                <p className="text-xs text-gray-500 dark:text-gray-400">{user?.name}</p>
              </div>
            </div>
          </div>
          
          <nav className="flex-1 p-4 space-y-1">
            {navItems.map((item, index) => (
              <Link
                key={index} 
                to={item.path}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 ${
                  isActive(item.path) ? 'bg-gray-100 dark:bg-gray-700 font-medium' : ''
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
              </Link>
            ))}
          </nav>
          
          <div className="p-4 border-t dark:border-gray-700">
            <button 
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
            >
              <LogOut className="w-5 h-5" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </div>
      
      {/* Admin Content */}
      <div className="flex-1 overflow-auto">
        {/* Mobile Header */}
        <div className="md:hidden bg-white dark:bg-gray-800 shadow-sm p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-purple-600" />
            <span className="font-bold">Admin</span>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={toggleTheme}
              className="p-2"
            >
              {theme === 'dark' ? (
                <Sun className="h-4 w-4 text-amber-500" />
              ) : (
                <Moon className="h-4 w-4 text-indigo-600" />
              )}
            </button>
            <button 
              onClick={handleLogout}
              className="p-2 text-red-500"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
        
        {/* Page Content */}
        <div className="p-0">
          {children}
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;
