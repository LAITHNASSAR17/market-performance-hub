
import React from 'react';
import { Navigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { 
  ShieldAlert, 
  LayoutDashboard, 
  Users, 
  TrendingUp, 
  Hash, 
  FileText, 
  Settings, 
  LogOut 
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/contexts/LanguageContext';

interface AdminLayoutProps {
  children: React.ReactNode;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const { user, isAdmin, logout } = useAuth();
  const { toast } = useToast();
  const { t } = useLanguage();
  
  // Get site name from localStorage or default
  const siteName = localStorage.getItem('siteName') || 'TradeTracker';
  
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
    { icon: <Settings className="w-5 h-5" />, label: "Settings", path: "/admin/settings" },
  ];

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
      {/* Admin Sidebar */}
      <div className="w-64 hidden md:block bg-white dark:bg-gray-800 shadow-md">
        <div className="flex flex-col h-full">
          <div className="p-4 border-b dark:border-gray-700">
            <div className="flex items-center gap-3">
              <div className="bg-purple-600 p-2 rounded-lg">
                <ShieldAlert className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className="font-bold text-xl">{siteName} Admin</h2>
                <p className="text-xs text-gray-500 dark:text-gray-400">{user?.name}</p>
              </div>
            </div>
          </div>
          
          <nav className="flex-1 p-4 space-y-1">
            {navItems.map((item, index) => (
              <Link 
                key={index} 
                to={item.path}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200"
              >
                {item.icon}
                <span>{item.label}</span>
              </Link>
            ))}
          </nav>
          
          <div className="p-4 border-t dark:border-gray-700 space-y-4">
            <Link 
              to="/dashboard"
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/20"
            >
              <LayoutDashboard className="w-5 h-5" />
              <span>Back to App</span>
            </Link>
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
            <ShieldAlert className="h-5 w-5 text-purple-600" />
            <span className="font-bold">{siteName} Admin</span>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={handleLogout}
              className="p-2 text-red-500"
            >
              <LogOut className="w-5 w-5" />
            </button>
          </div>
        </div>
        
        {/* Page Content */}
        <div className="p-4">
          {children}
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;
