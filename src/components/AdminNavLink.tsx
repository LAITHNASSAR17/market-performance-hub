
import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

const AdminNavLink: React.FC = () => {
  const { isAdmin } = useAuth();
  
  if (!isAdmin) return null;
  
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Link 
            to="/admin" 
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            aria-label="Admin Dashboard"
          >
            <ShieldAlert className="h-5 w-5 text-purple-600" />
          </Link>
        </TooltipTrigger>
        <TooltipContent>
          <p>Admin Dashboard</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default AdminNavLink;
