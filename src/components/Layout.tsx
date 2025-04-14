import React, { useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, LineChart, TrendingUp, BookText, Settings, MenuIcon, X, LogOut, User, Moon, Sun, Globe } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTheme } from '@/contexts/ThemeContext';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import AdminNavLink from './AdminNavLink';
interface LayoutProps {
  children: React.ReactNode;
}
const Layout: React.FC<LayoutProps> = ({
  children
}) => {
  const {
    user,
    logout
  } = useAuth();
  const {
    pathname
  } = useLocation();
  const {
    toast
  } = useToast();
  const {
    language,
    toggleLanguage,
    t
  } = useLanguage();
  const {
    theme,
    toggleTheme
  } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  // Get site name from localStorage or default
  const siteName = localStorage.getItem('siteName') || 'TradeTracker';

  // Close mobile menu when route changes
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);
  const handleLogout = () => {
    logout();
    toast({
      title: t('loggedOut'),
      description: t('youHaveBeenLoggedOut')
    });
  };
  const navigationItems = [{
    name: t('dashboard'),
    icon: <LayoutDashboard className="h-5 w-5" />,
    href: '/dashboard',
    current: pathname === '/dashboard'
  }, {
    name: t('trades'),
    icon: <TrendingUp className="h-5 w-5" />,
    href: '/trades',
    current: pathname === '/trades'
  }, {
    name: t('journal'),
    icon: <BookText className="h-5 w-5" />,
    href: '/journal',
    current: pathname === '/journal'
  }, {
    name: t('analytics'),
    icon: <LineChart className="h-5 w-5" />,
    href: '/analytics',
    current: pathname === '/analytics'
  }];
  return <div className="flex h-screen overflow-hidden bg-gray-50 dark:bg-gray-900">
      {/* Desktop Sidebar */}
      <div className="hidden lg:flex lg:flex-shrink-0">
        <div className="flex w-64 flex-col">
          <div className="flex min-h-0 flex-1 flex-col border-r border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-800">
            <div className="flex flex-1 flex-col overflow-y-auto pt-5 pb-4">
              <div className="flex flex-shrink-0 items-center px-4">
                <Link to="/dashboard" className="flex items-center">
                  <div className="bg-indigo-600 rounded-md p-1 mr-2">
                    <TrendingUp className="h-6 w-6 text-white" />
                  </div>
                  <span className="font-bold text-xl text-gray-900 dark:text-white">{siteName}</span>
                </Link>
              </div>
              <nav className="mt-8 flex-1 space-y-1 px-2">
                {navigationItems.map(item => <Link key={item.name} to={item.href} className={`${item.current ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-300' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'} group flex items-center rounded-md py-2 px-3`}>
                    {item.icon}
                    <span className="ml-3">{item.name}</span>
                  </Link>)}
              </nav>
            </div>
            <div className="flex flex-shrink-0 border-t border-gray-200 dark:border-gray-700 p-4">
              <div className="flex items-center w-full">
                <div className="flex flex-col flex-1 text-sm">
                  <span className="font-medium text-gray-900 dark:text-gray-200">{user?.name}</span>
                  <span className="text-gray-500 dark:text-gray-400 truncate">{user?.email}</span>
                </div>
                <div className="flex-shrink-0">
                  <Menu />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Mobile menu */}
      <div className={`${mobileMenuOpen ? 'fixed inset-0 z-40 flex' : 'hidden'} lg:hidden`}>
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setMobileMenuOpen(false)}></div>
        <div className="relative flex w-full max-w-xs flex-1 flex-col bg-white dark:bg-gray-800 pt-5 pb-4">
          <div className="absolute top-0 right-0 -mr-12 pt-2">
            <button type="button" className="ml-1 flex h-10 w-10 items-center justify-center rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white" onClick={() => setMobileMenuOpen(false)}>
              <span className="sr-only">Close sidebar</span>
              <X className="h-6 w-6 text-white" />
            </button>
          </div>
          
          <div className="flex flex-shrink-0 items-center px-4">
            <Link to="/dashboard" className="flex items-center">
              <div className="bg-indigo-600 rounded-md p-1 mr-2">
                <TrendingUp className="h-6 w-6 text-white" />
              </div>
              <span className="font-bold text-xl text-gray-900 dark:text-white">{siteName}</span>
            </Link>
          </div>
          
          <div className="mt-5 h-0 flex-1 overflow-y-auto">
            <nav className="space-y-1 px-2">
              {navigationItems.map(item => <Link key={item.name} to={item.href} className={`${item.current ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-300' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'} group flex items-center rounded-md py-2 px-2`}>
                  {item.icon}
                  <span className="ml-3">{item.name}</span>
                </Link>)}
            </nav>
          </div>
          
          <div className="flex flex-shrink-0 border-t border-gray-200 dark:border-gray-700 p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
                  <User className="h-6 w-6 text-indigo-600" />
                </div>
              </div>
              <div className="ml-3 flex flex-col">
                <span className="text-base font-medium text-gray-900 dark:text-white">{user?.name}</span>
                <span className="text-sm text-gray-500 dark:text-gray-400 truncate">{user?.email}</span>
              </div>
            </div>
          </div>
        </div>
        <div className="w-14 flex-shrink-0" aria-hidden="true"></div>
      </div>
      
      {/* Main content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="w-full">
          <div className="relative z-10 flex h-16 flex-shrink-0 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-800 shadow-sm">
            <button type="button" className="border-r border-gray-200 dark:border-gray-700 px-4 text-gray-500 dark:text-gray-400 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500 lg:hidden" onClick={() => setMobileMenuOpen(true)}>
              <span className="sr-only">Open sidebar</span>
              <MenuIcon className="h-6 w-6" />
            </button>
            <div className="flex flex-1 justify-between px-4 sm:px-6 lg:px-8">
              <div className="flex flex-1 items-center">
                <h1 className="text-lg font-medium text-gray-900 dark:text-white">
                  {pathname === '/dashboard' && t('dashboard')}
                  {pathname === '/trades' && t('trades')}
                  {pathname === '/journal' && t('journal')}
                  {pathname === '/analytics' && t('analytics')}
                  {pathname === '/settings' && t('settings')}
                  {pathname === '/profile' && t('profile')}
                </h1>
              </div>
              <div className="ml-4 flex items-center gap-3">
                <AdminNavLink />
                
                <button type="button" onClick={toggleTheme} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors" aria-label="Toggle theme">
                  {theme === 'dark' ? <Sun className="h-5 w-5 text-gray-400" /> : <Moon className="h-5 w-5 text-gray-400" />}
                </button>
                
                <button type="button" onClick={toggleLanguage} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors" aria-label="Toggle language">
                  <Globe className="h-5 w-5 text-gray-400" />
                </button>
                
                <Link to="/settings" className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors" aria-label="Settings">
                  <Settings className="h-5 w-5 text-gray-400" />
                </Link>
                
                <button type="button" onClick={handleLogout} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors" aria-label="Logout">
                  <LogOut className="h-5 w-5 text-gray-400" />
                </button>
              </div>
            </div>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-900">
          {children}
        </main>
      </div>
    </div>;
};

// Menu component for user dropdown
const Menu = () => {
  const {
    logout
  } = useAuth();
  const {
    toast
  } = useToast();
  const {
    t
  } = useLanguage();
  const handleLogout = () => {
    logout();
    toast({
      title: t('loggedOut'),
      description: t('youHaveBeenLoggedOut')
    });
  };
  return;
};
export default Layout;