
import React from 'react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Pencil, Trash2, Eye } from 'lucide-react';
import { Trade } from '@/contexts/TradeContext';
import HashtagBadge from './HashtagBadge';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface TradeCardProps {
  trade: Trade;
  onDelete: (id: string) => void;
}

const TradeCard: React.FC<TradeCardProps> = ({ trade, onDelete }) => {
  const isProfit = trade.profitLoss > 0;
  
  return (
    <Card className="h-full overflow-hidden">
      <CardContent className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-lg font-bold">{trade.pair}</h3>
            <p className="text-sm text-gray-500">
              {new Date(trade.date).toLocaleDateString()} • {trade.account}
            </p>
          </div>
          <div className={cn(
            "px-2 py-1 rounded text-sm font-medium",
            isProfit ? "bg-green-100 text-profit" : "bg-red-100 text-loss"
          )}>
            {trade.type}
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <p className="text-sm text-gray-500">Entry</p>
            <p className="font-medium">{trade.entry.toFixed(4)}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Exit</p>
            <p className="font-medium">{trade.exit.toFixed(4)}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Lot Size</p>
            <p className="font-medium">{trade.lotSize}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Duration</p>
            <p className="font-medium">{trade.durationMinutes} min</p>
          </div>
        </div>
        
        <div className="mb-3">
          <p className={cn(
            "text-lg font-bold",
            isProfit ? "text-profit" : "text-loss"
          )}>
            {isProfit ? '+' : ''}{trade.profitLoss.toFixed(2)} ({trade.returnPercentage}%)
          </p>
        </div>
        
        {trade.notes && (
          <div className="mb-3">
            <p className="text-sm text-gray-500">Notes</p>
            <p className="text-sm">{trade.notes}</p>
          </div>
        )}
        
        {trade.hashtags && trade.hashtags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-3">
            {trade.hashtags.map(tag => (
              <HashtagBadge key={tag} tag={tag} size="sm" />
            ))}
          </div>
        )}
      </CardContent>
      <CardFooter className="px-6 py-4 bg-gray-50 border-t flex justify-between">
        <Button variant="outline" size="sm" asChild>
          <Link to={`/trades/${trade.id}`}>
            <Eye className="h-4 w-4 mr-1" />
            View
          </Link>
        </Button>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link to={`/trades/${trade.id}/edit`}>
              <Pencil className="h-4 w-4 mr-1" />
              Edit
            </Link>
          </Button>
          <Button 
            variant="destructive" 
            size="sm" 
            onClick={() => onDelete(trade.id)}
          >
            <Trash2 className="h-4 w-4 mr-1" />
            Delete
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};

export default TradeCard;
