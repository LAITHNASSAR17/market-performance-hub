import React from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Pencil, Trash2, Star, TrendingUp, Percent, ArrowRightLeft, 
  BarChart, Coins, Hash, Lock, Unlock, Trophy, AlertTriangle 
} from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { PlaybookEntry, PlaybookRule } from '@/types/settings';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';

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
  
  // Helper to safely get property values considering both naming conventions
  const getPropertyValue = <K extends keyof PlaybookEntry>(
    prop: K, 
    altProp?: keyof PlaybookEntry
  ): PlaybookEntry[K] => {
    if (playbook[prop] !== undefined) return playbook[prop];
    if (altProp && playbook[altProp] !== undefined) return playbook[altProp] as unknown as PlaybookEntry[K];
    return undefined as unknown as PlaybookEntry[K];
  };
  
  // Get category colors
  const getCategoryColor = (category?: string) => {
    switch(category) {
      case 'trend': return 'bg-blue-500';
      case 'breakout': return 'bg-green-500';
      case 'reversal': return 'bg-purple-500';
      default: return 'bg-gray-500';
    }
  };

  const isActiveValue = getPropertyValue('is_active', 'isActive');
  const isPrivateValue = getPropertyValue('is_private', 'isPrivate');
  const rMultipleValue = getPropertyValue('r_multiple', 'rMultiple');
  const winRateValue = getPropertyValue('win_rate', 'winRate');
  const expectedValueValue = getPropertyValue('expected_value', 'expectedValue');
  const profitFactorValue = getPropertyValue('profit_factor', 'profitFactor');
  const netProfitLossValue = getPropertyValue('net_profit_loss', 'netProfitLoss');
  const totalTradesValue = getPropertyValue('total_trades', 'totalTrades');
  const avgWinnerValue = getPropertyValue('avg_winner', 'avgWinner');
  const avgLoserValue = getPropertyValue('avg_loser', 'avgLoser');
  const missedTradesValue = getPropertyValue('missed_trades', 'missedTrades');
  
  
  return (
    <>
      <Card className="h-full flex flex-col shadow-sm hover:shadow-md transition-all">
        <CardHeader className="pb-2 space-y-0">
          <div className="flex justify-between items-start gap-2">
            <div className="flex-grow min-w-0">
              <div className="flex items-center">
                <div className={`w-3 h-3 rounded-full mr-2 flex-shrink-0 ${getCategoryColor(playbook.category)}`}></div>
                <CardTitle className="text-lg truncate pr-1">
                  {playbook.name}
                </CardTitle>
                {isPrivateValue ? (
                  <Lock className="h-4 w-4 ml-1 text-muted-foreground flex-shrink-0" />
                ) : (
                  <Unlock className="h-4 w-4 ml-1 text-muted-foreground flex-shrink-0" />
                )}
              </div>
              <div className="flex items-center text-xs text-muted-foreground">
                <span className="capitalize truncate mr-2">
                  {playbook.category || 'uncategorized'}
                </span>
                <span className="flex">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star 
                      key={star} 
                      className={`h-3 w-3 flex-shrink-0 ${
                        star <= Math.round(playbook.rating || 0) 
                          ? "fill-yellow-400 text-yellow-400" 
                          : "text-muted-foreground"
                      }`}
                      onClick={() => onEdit && onEdit({ rating: star })}
                    />
                  ))}
                </span>
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="flex-grow px-4 pb-0">
          <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
            {playbook.description}
          </p>
          
          <div className="grid grid-cols-2 gap-2 mb-4">
            <div className="flex flex-col p-2 border rounded-md">
              <div className="flex items-center text-xs text-muted-foreground mb-1 truncate w-full justify-center">
                <TrendingUp className="h-3 w-3 mr-1 flex-shrink-0" />
                <span className="truncate">R Multiple</span>
              </div>
              <div className="text-base font-semibold truncate text-center">{rMultipleValue || 0}R</div>
            </div>
            
            <div className="flex flex-col p-2 border rounded-md">
              <div className="flex items-center text-xs text-muted-foreground mb-1 truncate w-full justify-center">
                <Percent className="h-3 w-3 mr-1 flex-shrink-0" />
                <span className="truncate">Win Rate</span>
              </div>
              <div className="text-base font-semibold truncate text-center">{winRateValue || 0}%</div>
            </div>
          </div>
          
          <div className="grid grid-cols-3 gap-2 mb-4">
            <div className="flex flex-col p-2 border rounded-md">
              <div className="flex items-center text-xs text-muted-foreground mb-1 truncate w-full justify-center">
                <ArrowRightLeft className="h-3 w-3 mr-1 flex-shrink-0" />
                <span className="truncate">Exp. Value</span>
              </div>
              <div className={`text-sm font-semibold truncate text-center ${
                (expectedValueValue || 0) > 0 ? 'text-green-500' : 
                (expectedValueValue || 0) < 0 ? 'text-red-500' : ''
              }`}>
                {expectedValueValue || 0}
              </div>
            </div>
            
            <div className="flex flex-col p-2 border rounded-md">
              <div className="flex items-center text-xs text-muted-foreground mb-1 truncate w-full justify-center">
                <BarChart className="h-3 w-3 mr-1 flex-shrink-0" />
                <span className="truncate">Profit Factor</span>
              </div>
              <div className={`text-sm font-semibold truncate text-center ${
                (profitFactorValue || 0) > 1 ? 'text-green-500' : 'text-red-500'
              }`}>
                {profitFactorValue?.toFixed(2) || '0.00'}
              </div>
            </div>
            
            <div className="flex flex-col p-2 border rounded-md">
              <div className="flex items-center text-xs text-muted-foreground mb-1 truncate w-full justify-center">
                <Coins className="h-3 w-3 mr-1 flex-shrink-0" />
                <span className="truncate">Net P/L</span>
              </div>
              <div className={`text-sm font-semibold truncate text-center ${
                (netProfitLossValue || 0) > 0 ? 'text-green-500' : 
                (netProfitLossValue || 0) < 0 ? 'text-red-500' : ''
              }`}>
                ${netProfitLossValue?.toFixed(2) || '0.00'}
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-3 gap-2 mb-4">
            <div className="flex flex-col p-2 border rounded-md">
              <div className="flex items-center text-xs text-muted-foreground mb-1 truncate w-full justify-center">
                <Hash className="h-3 w-3 mr-1 flex-shrink-0" />
                <span className="truncate">Trades</span>
              </div>
              <div className="text-sm font-semibold truncate text-center">{totalTradesValue || 0}</div>
            </div>
            
            <div className="flex flex-col p-2 border rounded-md">
              <div className="flex items-center text-xs text-muted-foreground mb-1 truncate w-full justify-center">
                <Trophy className="h-3 w-3 mr-1 flex-shrink-0" />
                <span className="truncate">Avg Winner</span>
              </div>
              <div className="text-sm font-semibold truncate text-center text-green-500">
                ${avgWinnerValue?.toFixed(2) || '0.00'}
              </div>
            </div>
            
            <div className="flex flex-col p-2 border rounded-md">
              <div className="flex items-center text-xs text-muted-foreground mb-1 truncate w-full justify-center">
                <AlertTriangle className="h-3 w-3 mr-1 flex-shrink-0" />
                <span className="truncate">Avg Loser</span>
              </div>
              <div className="text-sm font-semibold truncate text-center text-red-500">
                ${avgLoserValue?.toFixed(2) || '0.00'}
              </div>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-1 mb-4">
            {playbook.tags.map((tag, i) => (
              <Badge key={i} variant="outline" className="truncate max-w-[100px]">{tag}</Badge>
            ))}
          </div>
        </CardContent>

        <CardFooter className="pt-0 mt-auto justify-end gap-2 px-4 pb-4">
          <Button variant="outline" size="sm" onClick={() => setShowDetails(true)} className="flex-shrink-0">
            View Details
          </Button>
          {onEdit && (
            <Button variant="outline" size="sm" onClick={() => onEdit({})} className="flex-shrink-0">
              <Pencil className="h-3 w-3 mr-1" />
              {t('edit') || 'Edit'}
            </Button>
          )}
          {onDelete && (
            <Button variant="outline" size="sm" className="text-destructive flex-shrink-0" onClick={onDelete}>
              <Trash2 className="h-3 w-3 mr-1" />
              {t('delete') || 'Delete'}
            </Button>
          )}
        </CardFooter>
      </Card>

      {/* Detailed Playbook Dialog */}
      <Dialog open={showDetails} onOpenChange={setShowDetails}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <div className={`w-3 h-3 rounded-full mr-2 ${getCategoryColor(playbook.category)}`}></div>
              {playbook.name}
              <span className="ml-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star 
                    key={star} 
                    className={`inline-block h-4 w-4 ${
                      star <= Math.round(playbook.rating || 0) 
                        ? "fill-yellow-400 text-yellow-400" 
                        : "text-muted-foreground"
                    }`}
                  />
                ))}
              </span>
              {isPrivateValue ? (
                <Badge variant="outline" className="ml-2 gap-1">
                  <Lock className="h-3 w-3" /> Private
                </Badge>
              ) : (
                <Badge variant="outline" className="ml-2 gap-1">
                  <Unlock className="h-3 w-3" /> Shared
                </Badge>
              )}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6">
            <div>
              <h3 className="font-semibold mb-2">Strategy Description</h3>
              <p className="text-sm text-muted-foreground">{playbook.description}</p>
              <div className="flex flex-wrap gap-1 mt-2">
                {playbook.tags.map((tag, i) => (
                  <Badge key={i} variant="secondary">{tag}</Badge>
                ))}
              </div>
            </div>
            
            <div>
              <h3 className="font-semibold mb-3">Performance Metrics</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                <div className="p-3 bg-muted rounded-md">
                  <div className="text-sm text-muted-foreground flex items-center">
                    <Percent className="h-3 w-3 mr-1" /> Win Rate
                  </div>
                  <div className="text-xl font-bold">{winRateValue || 0}%</div>
                </div>
                <div className="p-3 bg-muted rounded-md">
                  <div className="text-sm text-muted-foreground flex items-center">
                    <TrendingUp className="h-3 w-3 mr-1" /> R-Multiple
                  </div>
                  <div className="text-xl font-bold">{rMultipleValue || 0}R</div>
                </div>
                <div className="p-3 bg-muted rounded-md">
                  <div className="text-sm text-muted-foreground flex items-center">
                    <BarChart className="h-3 w-3 mr-1" /> Profit Factor
                  </div>
                  <div className="text-xl font-bold">{profitFactorValue?.toFixed(2) || '0.00'}</div>
                </div>
                <div className="p-3 bg-muted rounded-md">
                  <div className="text-sm text-muted-foreground flex items-center">
                    <ArrowRightLeft className="h-3 w-3 mr-1" /> Expectancy
                  </div>
                  <div className="text-xl font-bold">{expectedValueValue || 0}</div>
                </div>
                <div className="p-3 bg-muted rounded-md">
                  <div className="text-sm text-muted-foreground flex items-center">
                    <Hash className="h-3 w-3 mr-1" /> Total Trades
                  </div>
                  <div className="text-xl font-bold">{totalTradesValue || 0}</div>
                </div>
                <div className="p-3 bg-muted rounded-md">
                  <div className="text-sm text-muted-foreground flex items-center">
                    <AlertTriangle className="h-3 w-3 mr-1" /> Missed Trades
                  </div>
                  <div className="text-xl font-bold">{missedTradesValue || 0}</div>
                </div>
                <div className="p-3 bg-muted rounded-md">
                  <div className="text-sm text-muted-foreground flex items-center">
                    <Trophy className="h-3 w-3 mr-1" /> Avg. Winner
                  </div>
                  <div className="text-xl font-bold text-green-500">${avgWinnerValue?.toFixed(2) || '0.00'}</div>
                </div>
                <div className="p-3 bg-muted rounded-md">
                  <div className="text-sm text-muted-foreground flex items-center">
                    <AlertTriangle className="h-3 w-3 mr-1" /> Avg. Loser
                  </div>
                  <div className="text-xl font-bold text-red-500">${avgLoserValue?.toFixed(2) || '0.00'}</div>
                </div>
              </div>
            </div>
            
            {playbook.rules && playbook.rules.length > 0 && (
              <div>
                <h3 className="font-semibold mb-2">Playbook Rules</h3>
                <div className="space-y-3">
                  {['entry', 'exit', 'risk', 'custom'].map((ruleType) => {
                    const rules = playbook.rules?.filter(r => r.type === ruleType);
                    if (!rules || rules.length === 0) return null;
                    
                    return (
                      <div key={ruleType} className="space-y-1">
                        <h4 className="text-sm font-medium capitalize">{ruleType} Rules</h4>
                        <div className="space-y-1 pl-1">
                          {rules.map((rule) => (
                            <div key={rule.id} className="flex items-start space-x-2">
                              <Checkbox id={rule.id} className="mt-0.5" />
                              <label htmlFor={rule.id} className="text-sm">
                                {rule.description}
                              </label>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
            
            <div>
              <h3 className="font-semibold mb-2">Linked Trades</h3>
              <div className="border rounded-md">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Symbol</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Direction</TableHead>
                      <TableHead>R-Multiple</TableHead>
                      <TableHead>P/L</TableHead>
                      <TableHead>Rules Followed</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell className="text-muted-foreground italic" colSpan={6}>
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
