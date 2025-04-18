
import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  BarChart2, 
  Home, 
  PieChart, 
  LineChart, 
  BookOpen, 
  Calendar, 
  FileSpreadsheet, 
  BarChart, 
  UserCog, 
  LogOut, 
  Menu, 
  X, 
  Settings, 
  Users,
  Lightbulb,
  GraduationCap
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { useMentor } from '@/contexts/MentorContext';

interface SidebarProps {
  className?: string;
  isMobile?: boolean;
}

interface MenuItem {
  to: string;
  icon: React.ReactNode;
  label: string;
  adminOnly?: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ className, isMobile = false }) => {
  const { user, isAdmin, logout } = useAuth();
  const { t } = useLanguage();
  const location = useLocation();
  const { isInMenteeView, currentMenteeId } = useMentor();
  const [isOpen, setIsOpen] = useState(false);

  if (!user) {
    return null;
  }
  
  const adminMenuItems: MenuItem[] = [
    { to: '/admin', icon: <Home size={20} />, label: 'Admin Dashboard', adminOnly: true },
    { to: '/admin/users', icon: <Users size={20} />, label: 'Manage Users', adminOnly: true },
    { to: '/admin/settings', icon: <Settings size={20} />, label: 'Settings', adminOnly: true },
  ];

  const menuItems: MenuItem[] = [
    { to: '/dashboard', icon: <Home size={20} />, label: t('Dashboard') },
    { to: '/trades', icon: <BarChart2 size={20} />, label: t('Trades') },
    { to: '/journal', icon: <Calendar size={20} />, label: t('Trade Journal') },
    { to: '/notebook', icon: <BookOpen size={20} />, label: t('Notebook') },
    { to: '/insights', icon: <Lightbulb size={20} />, label: t('Insights') },
    { to: '/analytics', icon: <PieChart size={20} />, label: t('Analytics') },
    { to: '/reports', icon: <FileSpreadsheet size={20} />, label: t('Reports') },
    { to: '/chart', icon: <LineChart size={20} />, label: t('Chart') },
    { to: '/mentor', icon: <GraduationCap size={20} />, label: t('Mentor Mode') },
    { to: '/user-profile', icon: <UserCog size={20} />, label: t('Profile') }
  ];

  const renderMenuItems = (items: MenuItem[]) => {
    return items
      .filter(item => !item.adminOnly || isAdmin)
      .map((item) => (
        <li key={item.to}>
          <NavLink 
            to={item.to}
            className={({ isActive }) => cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:text-primary",
              (isActive || (item.to === '/dashboard' && location.pathname === '/')) 
                ? "bg-muted text-primary" 
                : "text-muted-foreground hover:bg-muted"
            )}
            onClick={() => setIsOpen(false)}
          >
            {item.icon}
            <span className="font-medium">{item.label}</span>
          </NavLink>
        </li>
      ));
  };

  const content = (
    <div className={cn("pb-12 h-full flex flex-col", className)}>
      <div className="py-6 px-4 flex-grow">
        {isInMenteeView && (
          <div className="mb-4 p-3 bg-purple-100 dark:bg-purple-900 rounded-md">
            <p className="text-sm font-medium text-purple-800 dark:text-purple-200 flex items-center">
              <GraduationCap className="h-4 w-4 mr-2" />
              Viewing as Mentee
            </p>
          </div>
        )}
        
        <nav className="grid gap-1">
          <ul className="space-y-1">
            {isAdmin && (
              <div>
                <div className="my-3 px-3">
                  <p className="text-xs font-medium text-muted-foreground">Admin</p>
                </div>
                {renderMenuItems(adminMenuItems)}
                <div className="border-t my-3"></div>
              </div>
            )}
            <div className="my-3 px-3">
              <p className="text-xs font-medium text-muted-foreground">{t('Menu')}</p>
            </div>
            {renderMenuItems(menuItems)}
          </ul>
        </nav>
      </div>

      <div className="px-3 py-2 border-t">
        <button
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary hover:bg-muted"
          onClick={logout}
        >
          <LogOut size={20} />
          <span className="font-medium">{t('Logout')}</span>
        </button>
      </div>
    </div>
  );

  if (isMobile) {
    return (
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          <button className="p-2">
            <Menu size={24} />
          </button>
        </SheetTrigger>
        <SheetContent side="left" className="p-0 w-64">
          <div className="p-2 flex justify-end">
            <button onClick={() => setIsOpen(false)}>
              <X size={24} />
            </button>
          </div>
          {content}
        </SheetContent>
      </Sheet>
    );
  }

  return content;
};

export default Sidebar;
