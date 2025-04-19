
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Bell, Check } from 'lucide-react';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuTrigger 
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
      .limit(10);

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
      case 'warning': return 'destructive';
      case 'critical': return 'destructive';
      default: return 'default';
    }
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'mistake': return '⚠️';
      case 'success': return '🎉';
      case 'drop': return '📉';
      default: return '📢';
    }
  };

  const unreadAlerts = alerts.filter(alert => !alert.seen);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="relative">
        <Bell className="h-5 w-5" />
        {unreadAlerts.length > 0 && (
          <Badge 
            variant="destructive" 
            className="absolute -top-2 -right-2 px-1.5 py-0.5 text-xs"
          >
            {unreadAlerts.length}
          </Badge>
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-96">
        <DropdownMenuLabel>
          <div className="flex justify-between items-center">
            Alerts
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
        {alerts.length === 0 ? (
          <DropdownMenuItem disabled>
            No alerts at the moment
          </DropdownMenuItem>
        ) : (
          alerts.map(alert => (
            <DropdownMenuItem 
              key={alert.id} 
              className={`flex items-center justify-between ${!alert.seen ? 'bg-muted/50' : ''}`}
            >
              <div>
                <div className="flex items-center">
                  <span className="mr-2">{getAlertIcon(alert.type)}</span>
                  <span className="font-medium">{alert.title}</span>
                </div>
                <p className="text-sm text-muted-foreground">{alert.message}</p>
              </div>
              {!alert.seen && (
                <button 
                  onClick={() => markAlertAsSeen(alert.id)}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <Check className="h-4 w-4" />
                </button>
              )}
            </DropdownMenuItem>
          ))
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default AlertsDropdown;
