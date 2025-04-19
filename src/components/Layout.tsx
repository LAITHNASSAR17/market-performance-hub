
import React from 'react';
import ThemeToggle from './ThemeToggle';
import AlertsDropdown from './AlertsDropdown';
import { useAuth } from '@/contexts/AuthContext';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  LayoutDashboard,
  PlusCircle,
  ScrollText,
  CalendarDays,
  BookOpen,
  BarChart2,
  Sparkles,
  LineChart,
  AreaChart,
  CreditCard,
  ShieldAlert,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useNavigate } from 'react-router-dom';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();

  const menuItems = [
    { icon: LayoutDashboard, label: "لوحة التحكم", path: "/dashboard" },
    { icon: PlusCircle, label: "إضافة صفقة", path: "/add-trade" },
    { icon: ScrollText, label: "الصفقات", path: "/trades" },
    { icon: CalendarDays, label: "السجل", path: "/journal" },
    { icon: BookOpen, label: "المفكرة", path: "/notebook" },
    { icon: BarChart2, label: "التقارير", path: "/reports" },
    { icon: Sparkles, label: "الرؤى", path: "/insights" },
    { icon: LineChart, label: "التحليلات", path: "/analytics" },
    { icon: AreaChart, label: "الرسم البياني", path: "/chart" },
    { icon: CreditCard, label: "الاشتراكات", path: "/subscriptions" },
  ];

  const handleSignOut = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen flex">
      {/* Fixed Sidebar */}
      <aside className="fixed h-screen w-64 bg-background border-r z-50">
        <div className="h-full flex flex-col">
          {/* Logo and Title */}
          <div className="p-4 border-b">
            <Link to="/" className="text-2xl font-bold">
              Track Mind
            </Link>
          </div>

          {/* Navigation Menu */}
          <nav className="flex-1 p-2 overflow-y-auto">
            {menuItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-md text-base transition-colors hover:bg-accent hover:text-accent-foreground ${
                  location.pathname === item.path ? 'bg-accent text-accent-foreground' : ''
                }`}
              >
                <item.icon className="h-5 w-5 shrink-0" />
                <span className="line-clamp-1">{item.label}</span>
              </Link>
            ))}
          </nav>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 ml-64">
        <header className="fixed top-0 right-0 left-64 bg-background border-b z-40">
          <div className="container mx-auto flex justify-end items-center py-4 px-4">
            <div className="flex items-center space-x-4">
              <div className="flex items-center gap-2">
                {isAdmin && (
                  <Link 
                    to="/admin" 
                    className="p-2 hover:bg-accent rounded-full transition-colors"
                  >
                    <ShieldAlert className="h-5 w-5" />
                  </Link>
                )}
                <AlertsDropdown />
              </div>
              
              {user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={user.avatar_url} />
                        <AvatarFallback>
                          {user.name?.charAt(0) || 'U'}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem asChild>
                      <Link to="/user-profile">User Profile</Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleSignOut}>
                      تسجيل الخروج
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Button asChild>
                  <Link to="/login">تسجيل الدخول</Link>
                </Button>
              )}
            </div>
          </div>
        </header>
        
        <main className="container mx-auto py-8 px-4 mt-16">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;
