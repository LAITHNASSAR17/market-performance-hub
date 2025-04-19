import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Bell, Check, TrendingUp, TrendingDown, AlertTriangle, BadgeCheck, Info, Clock } from 'lucide-react';
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
import { useToast } from "@/hooks/use-toast";

type Alert = {
  id: string;
  type: 'mistake' | 'success' | 'drop' | 'improvement';
  title: string;
  message: string;
  severity: 'info' | 'warning' | 'critical';
  seen: boolean;
  created_at: string;
  related_tag?: string;
};

const AlertsDropdown: React.FC = () => {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    fetchAlerts();

    // Set up real-time subscription for new alerts
    const channel = supabase
      .channel('alerts')
      .on(
        'postgres_changes',
        { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'alerts' 
        },
        (payload) => {
          setAlerts(prev => [payload.new as Alert, ...prev]);
          
          // Show toast notification for new alerts
          toast({
            title: (payload.new as Alert).title,
            description: (payload.new as Alert).message,
            variant: getSeverityVariant((payload.new as Alert).severity)
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchAlerts = async () => {
    const { data, error } = await supabase
      .from('alerts')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(15);

    if (data) setAlerts(data);
  };

  const markAlertAsSeen = async (alertId: string) => {
    await supabase
      .from('alerts')
      .update({ seen: true })
      .eq('id', alertId);

    // Update local state
    setAlerts(prev => 
      prev.map(alert => 
        alert.id === alertId ? { ...alert, seen: true } : alert
      )
    );
  };

  const getSeverityVariant = (severity: string) => {
    switch (severity) {
      case 'warning': return 'warning';
      case 'critical': return 'destructive';
      case 'info': 
      default: return 'success';
    }
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'mistake': return <AlertTriangle className="h-4 w-4 text-amber-500" />;
      case 'success': return <BadgeCheck className="h-4 w-4 text-emerald-500" />;
      case 'drop': return <TrendingDown className="h-4 w-4 text-red-500" />;
      case 'improvement': return <TrendingUp className="h-4 w-4 text-blue-500" />;
      default: return <Info className="h-4 w-4 text-gray-500" />;
    }
  };

  const getAlertTimestamp = (createdAt: string) => {
    const date = new Date(createdAt);
    const now = new Date();
    const diffInHours = Math.abs(now.getTime() - date.getTime()) / 36e5;
    
    if (diffInHours < 1) {
      const minutes = Math.floor(diffInHours * 60);
      return `${minutes} minute${minutes !== 1 ? 's' : ''} ago`;
    } else if (diffInHours < 24) {
      const hours = Math.floor(diffInHours);
      return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
    } else {
      const days = Math.floor(diffInHours / 24);
      return `${days} day${days !== 1 ? 's' : ''} ago`;
    }
  };

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

const AlertItem: React.FC<{ 
  alert: Alert; 
  onMarkSeen: (id: string) => void;
}> = ({ alert, onMarkSeen }) => {
  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'mistake': return <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0" />;
      case 'success': return <BadgeCheck className="h-4 w-4 text-emerald-500 shrink-0" />;
      case 'drop': return <TrendingDown className="h-4 w-4 text-red-500 shrink-0" />;
      case 'improvement': return <TrendingUp className="h-4 w-4 text-blue-500 shrink-0" />;
      default: return <Info className="h-4 w-4 text-gray-500 shrink-0" />;
    }
  };

  const getAlertTimestamp = (createdAt: string) => {
    const date = new Date(createdAt);
    const now = new Date();
    const diffInHours = Math.abs(now.getTime() - date.getTime()) / 36e5;
    
    if (diffInHours < 1) {
      const minutes = Math.floor(diffInHours * 60);
      return `${minutes}m ago`;
    } else if (diffInHours < 24) {
      const hours = Math.floor(diffInHours);
      return `${hours}h ago`;
    } else {
      const days = Math.floor(diffInHours / 24);
      return `${days}d ago`;
    }
  };

  return (
    <DropdownMenuItem 
      className={`flex items-start gap-2 p-3 cursor-default ${!alert.seen ? 'bg-muted/50' : ''}`}
      onSelect={(e) => e.preventDefault()}
    >
      {getAlertIcon(alert.type)}
      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-start gap-1">
          <h4 className="font-medium text-sm">{alert.title}</h4>
          <span className="text-xs text-muted-foreground whitespace-nowrap">
            {getAlertTimestamp(alert.created_at)}
          </span>
        </div>
        <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{alert.message}</p>
        {alert.related_tag && (
          <Badge variant="outline" className="mt-2 text-xs">
            #{alert.related_tag}
          </Badge>
        )}
      </div>
      {!alert.seen && (
        <button 
          onClick={(e) => {
            e.stopPropagation();
            onMarkSeen(alert.id);
          }}
          className="text-muted-foreground hover:text-foreground mt-1 shrink-0"
          title="Mark as read"
        >
          <Check className="h-4 w-4" />
        </button>
      )}
    </DropdownMenuItem>
  );
};

export default AlertsDropdown;
