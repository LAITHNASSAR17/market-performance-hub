
import { Check, ExternalLink } from 'lucide-react';
import { Badge } from "@/components/ui/badge";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { AlertIcon } from './AlertIcon';
import { Alert } from '@/hooks/useAlerts';
import { cn } from '@/lib/utils';

interface AlertItemProps {
  alert: Alert;
  onMarkSeen: (id: string) => void;
}

export const AlertItem: React.FC<AlertItemProps> = ({ alert, onMarkSeen }) => {
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
      className={cn(
        "flex items-start gap-2 p-3 cursor-default",
        !alert.seen && "bg-muted/50"
      )}
      onSelect={(e) => e.preventDefault()}
    >
      <AlertIcon type={alert.type} />
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
