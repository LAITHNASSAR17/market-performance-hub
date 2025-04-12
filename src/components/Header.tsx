
import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import ThemeToggle from './ThemeToggle';
import UserMenu from './UserMenu';
import AdminButton from './AdminButton';
import AdminDashboardIcon from './AdminDashboardIcon';
import { LineChart } from 'lucide-react';

const Header = () => {
  const { isAuthenticated } = useAuth();

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <div className="mr-4 flex">
          <Link to="/" className="flex items-center space-x-2">
            <LineChart className="h-6 w-6" />
            <span className="font-bold">TradePro</span>
          </Link>
        </div>
        
        <div className="flex flex-1 items-center justify-end space-x-2">
          {isAuthenticated && (
            <>
              <AdminDashboardIcon />
              <AdminButton />
              <ThemeToggle />
              <UserMenu />
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
