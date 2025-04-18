
import React, { useState } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { PlaybookEntry } from '@/hooks/usePlaybooks';
import { Edit, Trash2, BookMarked, Eye, Lock, Unlock, Star } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PlaybookCardProps {
  playbook: PlaybookEntry;
  onEdit?: (updatedData: Partial<PlaybookEntry>) => void;
  onDelete?: () => void;
  onViewDetails?: () => void;
}

const PlaybookCard: React.FC<PlaybookCardProps> = ({ 
  playbook, 
  onEdit, 
  onDelete,
  onViewDetails 
}) => {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  
  // Format numbers to include proper decimal places and currency
  const formatCurrency = (value?: number) => {
    if (value === undefined) return '$0.00';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(value);
  };
  
  const formatPercent = (value?: number) => {
    if (value === undefined) return '0%';
    return `${value}%`;
  };
  
  const formatNumber = (value?: number, decimals = 2) => {
    if (value === undefined) return '0';
    return value.toFixed(decimals);
  };
  
  // Calculate number of winning rules (rules that were followed in winning trades)
  const winningRulesCount = playbook.rules?.filter(rule => 
    rule.type === 'entry' || rule.type === 'exit'
  ).length || 0;
  
  // Get color class based on profitability
  const getProfitColorClass = (value?: number) => {
    if (!value) return 'text-gray-500';
    return value > 0 ? 'text-green-500' : 'text-red-500';
  };

  return (
    <Card className="overflow-hidden transition-all duration-200 hover:shadow-md">
      <CardHeader className="pb-2 pt-4">
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-2">
            <BookMarked className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg line-clamp-1">{playbook.name}</CardTitle>
          </div>
          {playbook.isPrivate ? (
            <Lock className="h-4 w-4 text-muted-foreground" />
          ) : (
            <Unlock className="h-4 w-4 text-muted-foreground" />
          )}
        </div>
        
        <div className="flex items-center gap-1 mt-1">
          {Array.from({ length: 5 }).map((_, index) => (
            <Star 
              key={index}
              className={cn(
                "h-4 w-4",
                index < Math.round(playbook.rating || 0) 
                  ? "text-yellow-400 fill-yellow-400" 
                  : "text-gray-300"
              )}
            />
          ))}
          <span className="text-xs text-muted-foreground ml-1">
            {playbook.rating ? playbook.rating.toFixed(1) : '0.0'}
          </span>
        </div>
        
        <div className="text-sm text-muted-foreground line-clamp-2 mt-1">
          {playbook.description}
        </div>
      </CardHeader>
      
      <CardContent className="pb-3 pt-2">
        {/* Tags */}
        <div className="flex flex-wrap gap-1 mb-3">
          {playbook.category && (
            <Badge variant="outline" className="bg-primary/10 text-xs">
              {playbook.category === 'trend' ? 'Trend' : 
               playbook.category === 'breakout' ? 'Breakout' :
               playbook.category === 'reversal' ? 'Reversal' : 'Other'}
            </Badge>
          )}
          
          {playbook.tags?.slice(0, 3).map(tag => (
            <Badge key={tag} variant="secondary" className="text-xs">
              {tag}
            </Badge>
          ))}
          
          {(playbook.tags?.length || 0) > 3 && (
            <Badge variant="outline" className="text-xs">
              +{(playbook.tags?.length || 0) - 3} more
            </Badge>
          )}
        </div>
        
        <Separator className="mb-3" />
        
        {/* Performance Metrics */}
        <div className="grid grid-cols-2 gap-y-2 gap-x-4 text-sm">
          <div>
            <p className="text-muted-foreground text-xs">Win Rate</p>
            <p className="font-medium">{formatPercent(playbook.winRate)}</p>
          </div>
          
          <div>
            <p className="text-muted-foreground text-xs">Total Trades</p>
            <p className="font-medium">{playbook.totalTrades || 0}</p>
          </div>
          
          <div>
            <p className="text-muted-foreground text-xs">R Multiple</p>
            <p className="font-medium">{formatNumber(playbook.rMultiple)}</p>
          </div>
          
          <div>
            <p className="text-muted-foreground text-xs">Expectancy</p>
            <p className="font-medium">{formatNumber(playbook.expectedValue)}</p>
          </div>
          
          <div>
            <p className="text-muted-foreground text-xs">Avg Winner</p>
            <p className={`font-medium ${getProfitColorClass(playbook.avgWinner)}`}>
              {formatCurrency(playbook.avgWinner)}
            </p>
          </div>
          
          <div>
            <p className="text-muted-foreground text-xs">Avg Loser</p>
            <p className={`font-medium ${getProfitColorClass(playbook.avgLoser)}`}>
              {formatCurrency(playbook.avgLoser)}
            </p>
          </div>
          
          <div className="col-span-2">
            <p className="text-muted-foreground text-xs">Net P&L</p>
            <p className={`font-medium text-lg ${getProfitColorClass(playbook.netProfitLoss)}`}>
              {formatCurrency(playbook.netProfitLoss)}
            </p>
          </div>
        </div>
        
        <Separator className="mt-3 mb-3" />
        
        {/* Rules Summary */}
        <div className="text-xs text-muted-foreground">
          <p>{playbook.rules?.length || 0} rules defined • {winningRulesCount} trading rules</p>
        </div>
      </CardContent>
      
      <CardFooter className="pt-0 pb-3 flex justify-between">
        <Button 
          variant="outline" 
          size="sm"
          onClick={onViewDetails}
        >
          <Eye className="h-4 w-4 mr-1" />
          View
        </Button>
        
        <div className="flex gap-2">
          {onEdit && (
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => onEdit(playbook)}
            >
              <Edit className="h-4 w-4" />
            </Button>
          )}
          
          {onDelete && (
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => setIsDeleteDialogOpen(true)}
            >
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          )}
        </div>
      </CardFooter>
      
      {/* Delete Confirmation Dialog */}
      {onDelete && (
        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete Playbook</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete the playbook "{playbook.name}"?
                This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button 
                variant="outline" 
                onClick={() => setIsDeleteDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button 
                variant="destructive" 
                onClick={() => {
                  onDelete();
                  setIsDeleteDialogOpen(false);
                }}
              >
                Delete
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </Card>
  );
};

export default PlaybookCard;
