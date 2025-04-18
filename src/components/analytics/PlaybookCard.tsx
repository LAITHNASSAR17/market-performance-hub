
import React from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Pencil, Trash2, Star, TrendingUp, Percent, ArrowRightLeft, BarChart, Coins, Hash } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { PlaybookEntry } from '@/hooks/usePlaybooks';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface PlaybookCardProps {
  playbook: PlaybookEntry;
  onEdit?: (updatedData: Partial<PlaybookEntry>) => void;
  onDelete?: () => void;
  onViewDetails?: (playbookId: string) => void;
}

const PlaybookCard: React.FC<PlaybookCardProps> = ({ 
  playbook, 
  onEdit, 
  onDelete,
  onViewDetails 
}) => {
  const { t } = useLanguage();
  const [showDetails, setShowDetails] = React.useState(false);
  
  // Get category colors
  const getCategoryColor = (category?: string) => {
    switch(category) {
      case 'trend': return 'bg-blue-500';
      case 'breakout': return 'bg-green-500';
      case 'reversal': return 'bg-purple-500';
      default: return 'bg-gray-500';
    }
  };
  
  return (
    <>
      <Card className="transition-all hover:shadow-md">
        <CardHeader className="pb-2">
          <div className="flex justify-between items-start">
            <div className="flex flex-col">
              <CardTitle className="text-lg flex items-center">
                <div className={`w-3 h-3 rounded-full mr-2 ${getCategoryColor(playbook.category)}`}></div>
                {playbook.name}
              </CardTitle>
              <span className="text-xs text-muted-foreground capitalize">
                {playbook.category || 'uncategorized'}
              </span>
            </div>
            <div className="flex">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star 
                  key={star} 
                  className={`h-4 w-4 ${
                    star <= Math.round(playbook.rating) 
                      ? "fill-yellow-400 text-yellow-400" 
                      : "text-muted-foreground"
                  }`}
                  onClick={() => onEdit && onEdit({ rating: star })}
                />
              ))}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4 h-12 overflow-hidden text-ellipsis">
            {playbook.description}
          </p>
          
          <div className="grid grid-cols-3 gap-2 mb-4">
            <div className="flex flex-col items-center p-2 border rounded-md">
              <div className="flex items-center text-xs text-muted-foreground mb-1">
                <TrendingUp className="h-3 w-3 mr-1" />
                {t('analytics.rMultiple') || 'R-Multiple'}
              </div>
              <div className="text-lg font-semibold">{playbook.rMultiple || 0}R</div>
            </div>
            
            <div className="flex flex-col items-center p-2 border rounded-md">
              <div className="flex items-center text-xs text-muted-foreground mb-1">
                <Percent className="h-3 w-3 mr-1" />
                {t('analytics.winRate') || 'Win Rate'}
              </div>
              <div className="text-lg font-semibold">{playbook.winRate || 0}%</div>
            </div>
            
            <div className="flex flex-col items-center p-2 border rounded-md">
              <div className="flex items-center text-xs text-muted-foreground mb-1">
                <ArrowRightLeft className="h-3 w-3 mr-1" />
                {t('analytics.ev') || 'Exp. Value'}
              </div>
              <div className={`text-lg font-semibold ${
                (playbook.expectedValue || 0) > 0 ? 'text-green-500' : 
                (playbook.expectedValue || 0) < 0 ? 'text-red-500' : ''
              }`}>
                {playbook.expectedValue || 0}
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-3 gap-2 mb-4">
            <div className="flex flex-col items-center p-2 border rounded-md">
              <div className="flex items-center text-xs text-muted-foreground mb-1">
                <BarChart className="h-3 w-3 mr-1" />
                Profit Factor
              </div>
              <div className={`text-lg font-semibold ${
                (playbook.profitFactor || 0) > 1 ? 'text-green-500' : 'text-red-500'
              }`}>
                {playbook.profitFactor?.toFixed(2) || '0.00'}
              </div>
            </div>
            
            <div className="flex flex-col items-center p-2 border rounded-md">
              <div className="flex items-center text-xs text-muted-foreground mb-1">
                <Hash className="h-3 w-3 mr-1" />
                Total Trades
              </div>
              <div className="text-lg font-semibold">{playbook.totalTrades || 0}</div>
            </div>
            
            <div className="flex flex-col items-center p-2 border rounded-md">
              <div className="flex items-center text-xs text-muted-foreground mb-1">
                <Coins className="h-3 w-3 mr-1" />
                Avg. Profit
              </div>
              <div className={`text-lg font-semibold ${
                (playbook.averageProfit || 0) > 0 ? 'text-green-500' : 
                (playbook.averageProfit || 0) < 0 ? 'text-red-500' : ''
              }`}>
                ${playbook.averageProfit?.toFixed(2) || '0.00'}
              </div>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-1">
            {playbook.tags.map((tag, i) => (
              <Badge key={i} variant="outline">{tag}</Badge>
            ))}
          </div>
        </CardContent>
        <CardFooter className="pt-0 justify-end gap-2">
          <Button variant="outline" size="sm" onClick={() => setShowDetails(true)}>
            View Details
          </Button>
          {onEdit && (
            <Button variant="outline" size="sm" onClick={() => onEdit({})}>
              <Pencil className="h-3 w-3 mr-1" />
              {t('edit') || 'Edit'}
            </Button>
          )}
          {onDelete && (
            <Button variant="outline" size="sm" className="text-destructive" onClick={onDelete}>
              <Trash2 className="h-3 w-3 mr-1" />
              {t('delete') || 'Delete'}
            </Button>
          )}
        </CardFooter>
      </Card>

      {/* Detailed Playbook Dialog */}
      <Dialog open={showDetails} onOpenChange={setShowDetails}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <div className={`w-3 h-3 rounded-full mr-2 ${getCategoryColor(playbook.category)}`}></div>
              {playbook.name}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">Strategy Description</h3>
              <p className="text-sm text-muted-foreground">{playbook.description}</p>
            </div>
            
            <div>
              <h3 className="font-semibold mb-2">Performance Statistics</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                <div className="p-3 bg-muted rounded-md">
                  <div className="text-sm text-muted-foreground">Win Rate</div>
                  <div className="text-xl font-bold">{playbook.winRate || 0}%</div>
                </div>
                <div className="p-3 bg-muted rounded-md">
                  <div className="text-sm text-muted-foreground">R-Multiple</div>
                  <div className="text-xl font-bold">{playbook.rMultiple || 0}R</div>
                </div>
                <div className="p-3 bg-muted rounded-md">
                  <div className="text-sm text-muted-foreground">Profit Factor</div>
                  <div className="text-xl font-bold">{playbook.profitFactor?.toFixed(2) || '0.00'}</div>
                </div>
                <div className="p-3 bg-muted rounded-md">
                  <div className="text-sm text-muted-foreground">Expected Value</div>
                  <div className="text-xl font-bold">{playbook.expectedValue || 0}</div>
                </div>
                <div className="p-3 bg-muted rounded-md">
                  <div className="text-sm text-muted-foreground">Total Trades</div>
                  <div className="text-xl font-bold">{playbook.totalTrades || 0}</div>
                </div>
                <div className="p-3 bg-muted rounded-md">
                  <div className="text-sm text-muted-foreground">Avg. Profit/Trade</div>
                  <div className="text-xl font-bold">${playbook.averageProfit?.toFixed(2) || '0.00'}</div>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="font-semibold mb-2">Linked Trades</h3>
              <div className="border rounded-md">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Symbol</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Direction</TableHead>
                      <TableHead>P/L</TableHead>
                      <TableHead>R-Multiple</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {/* This would be populated with actual linked trades */}
                    <TableRow>
                      <TableCell className="text-muted-foreground italic" colSpan={5}>
                        No trades linked to this playbook yet.
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h3 className="font-semibold mb-2">Common Mistakes</h3>
                <ul className="list-disc pl-5 text-sm">
                  <li className="text-muted-foreground">Early entry before confirmation</li>
                  <li className="text-muted-foreground">Not respecting invalidation level</li>
                  <li className="text-muted-foreground">Taking profit too early</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Winning Habits</h3>
                <ul className="list-disc pl-5 text-sm">
                  <li className="text-muted-foreground">Waiting for confirmation</li>
                  <li className="text-muted-foreground">Proper position sizing</li>
                  <li className="text-muted-foreground">Following the plan</li>
                </ul>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default PlaybookCard;
