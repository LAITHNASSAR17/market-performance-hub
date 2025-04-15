
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

interface DashboardCardProps {
  title?: string;
  children: React.ReactNode;
  className?: string;
  actions?: React.ReactNode;
  contentClassName?: string;
  variant?: 'default' | 'purple';
}

const DashboardCard: React.FC<DashboardCardProps> = ({
  title,
  children,
  className,
  actions,
  contentClassName,
  variant = 'default'
}) => {
  return (
    <Card className={cn(
      "overflow-hidden shadow-sm border rounded-xl", 
      variant === 'purple' ? 'bg-gradient-to-r from-purple-50 to-purple-100 border-purple-200 dark:from-purple-900/20 dark:to-purple-800/20 dark:border-purple-800/30' : '',
      className
    )}>
      {title && (
        <CardHeader className="flex flex-row items-center justify-between p-4 pb-2">
          <CardTitle className="text-base font-medium">{title}</CardTitle>
          {actions ? actions : (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>Refresh</DropdownMenuItem>
                <DropdownMenuItem>Settings</DropdownMenuItem>
                <DropdownMenuItem>Export</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </CardHeader>
      )}
      <CardContent className={cn("p-4 pt-2", contentClassName)}>
        {children}
      </CardContent>
    </Card>
  );
};

export default DashboardCard;
