
import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Edit, Trash2, Eye } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { Trade } from '@/contexts/TradeContext';
import { formatDistanceToNow } from 'date-fns';
import { useToast } from '@/components/ui/use-toast';
import { cn } from '@/lib/utils';

interface TradeCardProps {
  trade: Trade;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onView: (id: string) => void;
}

const TradeCard: React.FC<TradeCardProps> = ({ 
  trade, 
  onEdit, 
  onDelete,
  onView 
}) => {
  const { t } = useLanguage();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  // Get site name from localStorage for toast title
  const siteName = localStorage.getItem('siteName') || 'TradeTracker';

  const handleDelete = (e: React.SyntheticEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    toast({
      title: "Are you sure?",
      description: (
        <div className="grid gap-1">
          <p>Are you sure you want to delete this trade?</p>
          <div className="flex justify-end space-x-2">
            <Button variant="ghost">Cancel</Button>
            <Button variant="destructive" onClick={() => onDelete(trade.id)}>Delete</Button>
          </div>
        </div>
      ),
    })
  };

  return (
    <Card className="bg-card text-card-foreground shadow-sm hover:shadow-md transition-shadow duration-200">
      <CardHeader>
        <div className="flex items-center">
          <Avatar className="mr-4">
            <AvatarImage src={`https://avatar.vercel.sh/${trade.account}.png`} />
            <AvatarFallback>{trade.account.substring(0, 2)}</AvatarFallback>
          </Avatar>
          <div className="space-y-0.5">
            <CardTitle className="text-base font-semibold">{trade.pair} - {trade.type}</CardTitle>
            <CardDescription className="text-sm text-muted-foreground">
              {trade.account}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="py-2 grid gap-4">
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div>
            <span className="text-muted-foreground">{t('trade.entry') || 'Entry'}:</span> {trade.entry}
          </div>
          <div>
            <span className="text-muted-foreground">{t('trade.exit') || 'Exit'}:</span> {trade.exit}
          </div>
          <div>
            <span className="text-muted-foreground">{t('trade.lotSize') || 'Lot Size'}:</span> {trade.lotSize}
          </div>
          <div>
            <span className="text-muted-foreground">{t('trade.duration') || 'Duration'}:</span> {trade.durationMinutes} min
          </div>
          <div>
            <span className="text-muted-foreground">{t('trade.profitLoss') || 'P/L'}:</span> ${trade.profitLoss.toFixed(2)}
          </div>
          <div>
            <span className="text-muted-foreground">{t('trade.date') || 'Date'}:</span> {trade.date}
          </div>
        </div>
        <div className="line-clamp-2">
          <span className="text-muted-foreground">{t('trade.notes') || 'Notes'}:</span> {trade.notes}
        </div>
        <div className="flex flex-wrap gap-1">
          {trade.hashtags.map((tag) => (
            <Badge key={tag} variant="secondary" className="mr-1 mb-1">{tag}</Badge>
          ))}
        </div>
      </CardContent>
      <CardFooter className="flex justify-between items-center py-3">
        <span className="text-xs text-muted-foreground">
          {t('trade.added')} {formatDistanceToNow(new Date(trade.createdAt), { addSuffix: true })}
        </span>
        
        <div className="flex space-x-2 rtl:space-x-reverse">
          <Button size="sm" variant="default" className="mr-2" onClick={() => onView(trade.id)}>
            <Eye className="h-4 w-4 mr-1" />
            {t('trade.view') || 'View'}
          </Button>

          <Button size="sm" variant="ghost" onClick={() => onEdit(trade.id)}>
            <Edit className="h-4 w-4 mr-1" />
            {t('trade.edit') || 'Edit'}
          </Button>
          <Button size="sm" variant="ghost" onClick={handleDelete}>
            <Trash2 className="h-4 w-4 mr-1" />
            {t('trade.delete') || 'Delete'}
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};

export default TradeCard;
