
import React from 'react';
import { Bell } from 'lucide-react';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuTrigger,
  DropdownMenuGroup,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { useAlerts } from '@/hooks/useAlerts';
import { AlertItem } from './alerts/AlertItem';

const AlertsDropdown: React.FC = () => {
  const { alerts, markAlertAsSeen } = useAlerts();

  const unreadAlerts = alerts.filter(alert => !alert.seen);
  const criticalAlerts = alerts.filter(alert => alert.severity === 'critical' && !alert.seen);
  const warningAlerts = alerts.filter(alert => alert.severity === 'warning' && !alert.seen);
  const infoAlerts = alerts.filter(alert => alert.severity === 'info' && !alert.seen);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="relative">
        <Bell className="h-5 w-5" />
        {unreadAlerts.length > 0 && (
          <Badge 
            variant={criticalAlerts.length > 0 ? "destructive" : warningAlerts.length > 0 ? "warning" : "success"}
            className="absolute -top-2 -right-2 px-1.5 py-0.5 text-xs"
          >
            {unreadAlerts.length}
          </Badge>
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-96 max-h-[70vh] overflow-y-auto">
        <DropdownMenuLabel>
          <div className="flex justify-between items-center">
            Trading Alerts
            {unreadAlerts.length > 0 && (
              <button 
                onClick={() => unreadAlerts.forEach(alert => markAlertAsSeen(alert.id))}
                className="text-sm text-muted-foreground hover:text-foreground"
              >
                Mark all as read
              </button>
            )}
          </div>
        </DropdownMenuLabel>
        {criticalAlerts.length > 0 && (
          <DropdownMenuGroup>
            <DropdownMenuLabel className="text-xs text-red-500 font-normal">Critical Alerts</DropdownMenuLabel>
            {criticalAlerts.map(alert => (
              <AlertItem 
                key={alert.id} 
                alert={alert} 
                onMarkSeen={markAlertAsSeen} 
              />
            ))}
            <DropdownMenuSeparator />
          </DropdownMenuGroup>
        )}
        {warningAlerts.length > 0 && (
          <DropdownMenuGroup>
            <DropdownMenuLabel className="text-xs text-amber-500 font-normal">Warning Alerts</DropdownMenuLabel>
            {warningAlerts.map(alert => (
              <AlertItem 
                key={alert.id} 
                alert={alert} 
                onMarkSeen={markAlertAsSeen} 
              />
            ))}
            <DropdownMenuSeparator />
          </DropdownMenuGroup>
        )}
        {infoAlerts.length > 0 && (
          <DropdownMenuGroup>
            <DropdownMenuLabel className="text-xs text-blue-500 font-normal">Insights</DropdownMenuLabel>
            {infoAlerts.map(alert => (
              <AlertItem 
                key={alert.id} 
                alert={alert} 
                onMarkSeen={markAlertAsSeen} 
              />
            ))}
            <DropdownMenuSeparator />
          </DropdownMenuGroup>
        )}
        {alerts.filter(alert => alert.seen).length > 0 && (
          <DropdownMenuGroup>
            <DropdownMenuLabel className="text-xs text-gray-500 font-normal">Read Alerts</DropdownMenuLabel>
            {alerts.filter(alert => alert.seen).slice(0, 5).map(alert => (
              <AlertItem 
                key={alert.id} 
                alert={alert} 
                onMarkSeen={markAlertAsSeen} 
              />
            ))}
          </DropdownMenuGroup>
        )}
        {alerts.length === 0 && (
          <DropdownMenuItem disabled>
            <div className="flex flex-col items-center w-full py-6 text-center">
              <Bell className="h-8 w-8 text-muted-foreground mb-2 opacity-40" />
              <p className="text-muted-foreground">No alerts at the moment</p>
              <p className="text-xs text-muted-foreground mt-1">
                Alerts will appear as you continue trading
              </p>
            </div>
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default AlertsDropdown;
