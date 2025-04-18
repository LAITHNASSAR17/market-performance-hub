import React, { useState } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Pencil, Trash2, Star, TrendingUp, Percent, ArrowRightLeft, 
  BarChart, Coins, Hash, Lock, Unlock, Trophy, AlertTriangle, Share, RefreshCw, Copy, Check
} from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { PlaybookEntry, PlaybookRule } from '@/hooks/usePlaybooks';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { Tooltip, TooltipTrigger, TooltipContent, Switch, Label, Input } from '@/components/ui/tooltip';

interface PlaybookCardProps {
  playbook: PlaybookEntry;
  onEdit?: (updatedData: Partial<PlaybookEntry>) => void;
  onDelete?: () => void;
  onShare?: (playbook: PlaybookEntry) => void;
  showActions?: boolean;
  onClick?: () => void;
}

const PlaybookCard: React.FC<PlaybookCardProps> = ({ 
  playbook, 
  onEdit, 
  onDelete,
  onShare,
  showActions = true,
  onClick
}) => {
  const { t } = useLanguage();
  const [showDetails, setShowDetails] = React.useState(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [isPublic, setIsPublic] = useState(!playbook.isPrivate);
  const [shareLink, setShareLink] = useState('');
  const [linkCopied, setLinkCopied] = useState(false);

  const getCategoryColor = (category?: string) => {
    switch(category) {
      case 'trend': return 'bg-blue-500';
      case 'breakout': return 'bg-green-500';
      case 'reversal': return 'bg-purple-500';
      default: return 'bg-gray-500';
    }
  };

  const getCategoryIcon = (category?: string) => {
    switch(category) {
      case 'trend': return <TrendingUp className="h-3 w-3" />;
      case 'breakout': return <Coins className="h-3 w-3" />;
      case 'reversal': return <BarChart className="h-3 w-3" />;
      default: return <Hash className="h-3 w-3" />;
    }
  };

  const handleConfirmDelete = () => {
    setShowConfirmDelete(true);
  };

  const handleCopyLink = () => {
    setLinkCopied(true);
  };

  return (
    <Card className={`transition-shadow hover:shadow-md ${onClick ? 'cursor-pointer' : ''}`} onClick={onClick}>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <span className={`p-1.5 rounded-md ${getCategoryColor(playbook.category)}`}>
              {getCategoryIcon(playbook.category)}
            </span>
            <CardTitle className="text-lg font-semibold">{playbook.name}</CardTitle>
          </div>
          
          {showActions && (
            <div className="flex items-center space-x-1">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-8 w-8 p-0" 
                    onClick={(e) => {
                      e.stopPropagation();
                      onShare && onShare(playbook);
                      setShowShareDialog(true);
                    }}
                  >
                    <Share className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Share</p>
                </TooltipContent>
              </Tooltip>
              
              {onEdit && (
                <Button variant="outline" size="sm" onClick={() => onEdit({})} className="flex-shrink-0">
                  <Pencil className="h-3 w-3 mr-1" />
                  {t('edit') || 'Edit'}
                </Button>
              )}
              
              {onDelete && (
                <Button variant="outline" size="sm" className="text-destructive flex-shrink-0" onClick={handleConfirmDelete}>
                  <Trash2 className="h-3 w-3 mr-1" />
                  {t('delete') || 'Delete'}
                </Button>
              )}
            </div>
          )}
        </div>
        
        <div className="flex items-center mt-1 text-sm text-muted-foreground">
          <CategoryBadge category={playbook.category} /> 
          <span className="mx-2">•</span>
          <div className="flex items-center">
            {Array.from({length: 5}).map((_, index) => (
              <Star 
                key={index}
                className={`h-3.5 w-3.5 ${index < playbook.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
              />
            ))}
          </div>
          <span className="mx-2">•</span>
          <span>{playbook.isPrivate ? 'Private' : 'Public'}</span>
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
            <div className="text-base font-semibold truncate text-center">{playbook.rMultiple || 0}R</div>
          </div>
          
          <div className="flex flex-col p-2 border rounded-md">
            <div className="flex items-center text-xs text-muted-foreground mb-1 truncate w-full justify-center">
              <Percent className="h-3 w-3 mr-1 flex-shrink-0" />
              <span className="truncate">Win Rate</span>
            </div>
            <div className="text-base font-semibold truncate text-center">{playbook.winRate || 0}%</div>
          </div>
        </div>
        
        <div className="grid grid-cols-3 gap-2 mb-4">
          <div className="flex flex-col p-2 border rounded-md">
            <div className="flex items-center text-xs text-muted-foreground mb-1 truncate w-full justify-center">
              <ArrowRightLeft className="h-3 w-3 mr-1 flex-shrink-0" />
              <span className="truncate">Exp. Value</span>
            </div>
            <div className={`text-sm font-semibold truncate text-center ${
              (playbook.expectedValue || 0) > 0 ? 'text-green-500' : 
              (playbook.expectedValue || 0) < 0 ? 'text-red-500' : ''
            }`}>
              {playbook.expectedValue || 0}
            </div>
          </div>
          
          <div className="flex flex-col p-2 border rounded-md">
            <div className="flex items-center text-xs text-muted-foreground mb-1 truncate w-full justify-center">
              <BarChart className="h-3 w-3 mr-1 flex-shrink-0" />
              <span className="truncate">Profit Factor</span>
            </div>
            <div className={`text-sm font-semibold truncate text-center ${
              (playbook.profitFactor || 0) > 1 ? 'text-green-500' : 'text-red-500'
            }`}>
              {playbook.profitFactor?.toFixed(2) || '0.00'}
            </div>
          </div>
          
          <div className="flex flex-col p-2 border rounded-md">
            <div className="flex items-center text-xs text-muted-foreground mb-1 truncate w-full justify-center">
              <Coins className="h-3 w-3 mr-1 flex-shrink-0" />
              <span className="truncate">Net P/L</span>
            </div>
            <div className={`text-sm font-semibold truncate text-center ${
              (playbook.netProfitLoss || 0) > 0 ? 'text-green-500' : 
              (playbook.netProfitLoss || 0) < 0 ? 'text-red-500' : ''
            }`}>
              ${playbook.netProfitLoss?.toFixed(2) || '0.00'}
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-3 gap-2 mb-4">
          <div className="flex flex-col p-2 border rounded-md">
            <div className="flex items-center text-xs text-muted-foreground mb-1 truncate w-full justify-center">
              <Hash className="h-3 w-3 mr-1 flex-shrink-0" />
              <span className="truncate">Trades</span>
            </div>
            <div className="text-sm font-semibold truncate text-center">{playbook.totalTrades || 0}</div>
          </div>
          
          <div className="flex flex-col p-2 border rounded-md">
            <div className="flex items-center text-xs text-muted-foreground mb-1 truncate w-full justify-center">
              <Trophy className="h-3 w-3 mr-1 flex-shrink-0" />
              <span className="truncate">Avg Winner</span>
            </div>
            <div className="text-sm font-semibold truncate text-center text-green-500">
              ${playbook.avgWinner?.toFixed(2) || '0.00'}
            </div>
          </div>
          
          <div className="flex flex-col p-2 border rounded-md">
            <div className="flex items-center text-xs text-muted-foreground mb-1 truncate w-full justify-center">
              <AlertTriangle className="h-3 w-3 mr-1 flex-shrink-0" />
              <span className="truncate">Avg Loser</span>
            </div>
            <div className="text-sm font-semibold truncate text-center text-red-500">
              ${playbook.avgLoser?.toFixed(2) || '0.00'}
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
      </CardFooter>
    </Card>

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
                    star <= Math.round(playbook.rating) 
                      ? "fill-yellow-400 text-yellow-400" 
                      : "text-muted-foreground"
                  }`}
                />
              ))}
            </span>
            {playbook.isPrivate ? (
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
                <div className="text-xl font-bold">{playbook.winRate || 0}%</div>
              </div>
              <div className="p-3 bg-muted rounded-md">
                <div className="text-sm text-muted-foreground flex items-center">
                  <TrendingUp className="h-3 w-3 mr-1" /> R-Multiple
                </div>
                <div className="text-xl font-bold">{playbook.rMultiple || 0}R</div>
              </div>
              <div className="p-3 bg-muted rounded-md">
                <div className="text-sm text-muted-foreground flex items-center">
                  <BarChart className="h-3 w-3 mr-1" /> Profit Factor
                </div>
                <div className="text-xl font-bold">{playbook.profitFactor?.toFixed(2) || '0.00'}</div>
              </div>
              <div className="p-3 bg-muted rounded-md">
                <div className="text-sm text-muted-foreground flex items-center">
                  <ArrowRightLeft className="h-3 w-3 mr-1" /> Expectancy
                </div>
                <div className="text-xl font-bold">{playbook.expectedValue || 0}</div>
              </div>
              <div className="p-3 bg-muted rounded-md">
                <div className="text-sm text-muted-foreground flex items-center">
                  <Hash className="h-3 w-3 mr-1" /> Total Trades
                </div>
                <div className="text-xl font-bold">{playbook.totalTrades || 0}</div>
              </div>
              <div className="p-3 bg-muted rounded-md">
                <div className="text-sm text-muted-foreground flex items-center">
                  <AlertTriangle className="h-3 w-3 mr-1" /> Missed Trades
                </div>
                <div className="text-xl font-bold">{playbook.missedTrades || 0}</div>
              </div>
              <div className="p-3 bg-muted rounded-md">
                <div className="text-sm text-muted-foreground flex items-center">
                  <Trophy className="h-3 w-3 mr-1" /> Avg. Winner
                </div>
                <div className="text-xl font-bold text-green-500">${playbook.avgWinner?.toFixed(2) || '0.00'}</div>
              </div>
              <div className="p-3 bg-muted rounded-md">
                <div className="text-sm text-muted-foreground flex items-center">
                  <AlertTriangle className="h-3 w-3 mr-1" /> Avg. Loser
                </div>
                <div className="text-xl font-bold text-red-500">${playbook.avgLoser?.toFixed(2) || '0.00'}</div>
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

    <Dialog open={showShareDialog} onOpenChange={setShowShareDialog}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Share Playbook</DialogTitle>
          <DialogDescription>
            Make your playbook available to others via a public link.
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex items-center space-x-2 mt-4">
          <Switch 
            id="public-toggle" 
            checked={isPublic} 
            onCheckedChange={setIsPublic}
          />
          <Label htmlFor="public-toggle">Make this Playbook Public</Label>
        </div>
        
        {isPublic && (
          <div className="mt-4 space-y-4">
            <div className="flex items-center space-x-2">
              <Input 
                value={shareLink || `${window.location.origin}/public/playbook/${playbook.id}`} 
                readOnly
              />
              <Button 
                type="button" 
                size="sm" 
                onClick={handleCopyLink}
                className="shrink-0"
              >
                {linkCopied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
            
            <div className="flex items-center space-x-2">
              <Button 
                variant="outline" 
                className="w-full" 
                size="sm"
                onClick={() => {
                  setShareLink(`${window.location.origin}/public/playbook/${playbook.id}-${Math.random().toString(36).substring(2, 8)}`);
                  setLinkCopied(false);
                }}
              >
                <RefreshCw className="h-3.5 w-3.5 mr-2" />
                Regenerate Link
              </Button>
            </div>
          </div>
        )}
        
        <DialogFooter className="sm:justify-start">
          <DialogClose asChild>
            <Button type="button" variant="secondary">
              Close
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>

    <Dialog open={showConfirmDelete} onOpenChange={setShowConfirmDelete}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Confirm Delete</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete this playbook?
          </DialogDescription>
        </DialogHeader>
        
        <DialogFooter className="sm:justify-start">
          <DialogClose asChild>
            <Button type="button" variant="secondary">
              Cancel
            </Button>
          </DialogClose>
          <Button variant="destructive" onClick={onDelete}>
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default PlaybookCard;
