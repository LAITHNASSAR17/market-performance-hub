
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useToast } from "@/hooks/use-toast";

export type Alert = {
  id: string;
  type: 'mistake' | 'success' | 'drop' | 'improvement';
  title: string;
  message: string;
  severity: 'info' | 'warning' | 'critical';
  seen: boolean;
  created_at: string;
  related_tag?: string;
};

export const useAlerts = () => {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const { toast } = useToast();

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

    setAlerts(prev => 
      prev.map(alert => 
        alert.id === alertId ? { ...alert, seen: true } : alert
      )
    );
  };

  const getSeverityVariant = (severity: string): "default" | "destructive" => {
    switch (severity) {
      case 'warning': return "default";
      case 'critical': return "destructive";
      case 'info': 
      default: return "default";
    }
  };

  useEffect(() => {
    fetchAlerts();

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

  return {
    alerts,
    markAlertAsSeen
  };
};
