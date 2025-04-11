
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, Plus, TrendingUp, BookOpen, ArrowRightLeft, Percent } from 'lucide-react';
import PlaybookCard from '@/components/analytics/PlaybookCard';
import { useLanguage } from '@/contexts/LanguageContext';
import { PlaybookEntry } from '@/hooks/usePlaybooks';

interface PlaybookTabProps {
  playbooks: PlaybookEntry[];
  onAddPlaybook?: (playbook: Omit<PlaybookEntry, 'id'>) => void;
  onUpdatePlaybook?: (id: string, playbook: Partial<PlaybookEntry>) => void;
  onDeletePlaybook?: (id: string) => void;
}

const PlaybookTab: React.FC<PlaybookTabProps> = ({ 
  playbooks,
  onAddPlaybook,
  onUpdatePlaybook,
  onDeletePlaybook
}) => {
  const { t } = useLanguage();
  const [searchTerm, setSearchTerm] = useState('');
  
  const filteredPlaybooks = searchTerm 
    ? playbooks.filter(p => 
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        p.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      )
    : playbooks;
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-4 items-start justify-between">
        <Card className="w-full md:w-3/4">
          <CardHeader>
            <CardTitle className="flex items-center">
              <BookOpen className="h-5 w-5 mr-2" />
              {t('analytics.tradingPlans') || 'Trading Plans & Setups'}
            </CardTitle>
            <CardDescription>
              {t('analytics.tradingPlansDesc') || 'Build your trading system with proven setups'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 mb-4">
              <div className="relative flex-1">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder={t('analytics.searchPlaybooks') || "Search playbooks..."}
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Button variant="outline" onClick={() => onAddPlaybook && onAddPlaybook({
                name: 'New Playbook',
                description: 'Describe your setup here',
                rating: 0,
                tags: [],
                rMultiple: 0,
                winRate: 0,
                expectedValue: 0
              })}>
                <Plus className="h-4 w-4 mr-2" />
                {t('analytics.addPlaybook') || 'Add Playbook'}
              </Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredPlaybooks.map((playbook) => (
                <PlaybookCard 
                  key={playbook.id} 
                  playbook={playbook} 
                  onEdit={onUpdatePlaybook ? 
                    (updatedPlaybook) => onUpdatePlaybook(playbook.id, updatedPlaybook) : 
                    undefined
                  }
                  onDelete={onDeletePlaybook ? 
                    () => onDeletePlaybook(playbook.id) : 
                    undefined
                  }
                />
              ))}
              
              {filteredPlaybooks.length === 0 && (
                <div className="col-span-2 text-center py-8 text-muted-foreground">
                  {t('analytics.noPlaybooks') || 'No playbooks found. Create your first trading plan!'}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
        
        <Card className="w-full md:w-1/4">
          <CardHeader>
            <CardTitle>{t('analytics.setupPerformance') || 'Setup Performance'}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <div className="text-sm font-medium mb-2 flex items-center">
                <TrendingUp className="h-4 w-4 mr-1 text-green-500" />
                {t('analytics.bestRMultiple') || 'Best R-Multiple'}
              </div>
              <div className="space-y-3">
                {playbooks
                  .filter(p => p.rMultiple !== undefined)
                  .sort((a, b) => (b.rMultiple || 0) - (a.rMultiple || 0))
                  .slice(0, 3)
                  .map(p => (
                    <div key={p.id} className="flex justify-between items-center">
                      <span className="text-sm">{p.name}</span>
                      <Badge variant="outline" className="bg-green-50">
                        {p.rMultiple}R
                      </Badge>
                    </div>
                  ))
                }
              </div>
            </div>
            
            <div>
              <div className="text-sm font-medium mb-2 flex items-center">
                <Percent className="h-4 w-4 mr-1 text-blue-500" />
                {t('analytics.highestWinRate') || 'Highest Win Rate'}
              </div>
              <div className="space-y-3">
                {playbooks
                  .filter(p => p.winRate !== undefined)
                  .sort((a, b) => (b.winRate || 0) - (a.winRate || 0))
                  .slice(0, 3)
                  .map(p => (
                    <div key={p.id} className="flex justify-between items-center">
                      <span className="text-sm">{p.name}</span>
                      <Badge variant="outline" className="bg-blue-50">
                        {p.winRate}%
                      </Badge>
                    </div>
                  ))
                }
              </div>
            </div>
            
            <div>
              <div className="text-sm font-medium mb-2 flex items-center">
                <ArrowRightLeft className="h-4 w-4 mr-1 text-purple-500" />
                {t('analytics.expectedValue') || 'Expected Value'}
              </div>
              <div className="space-y-3">
                {playbooks
                  .filter(p => p.expectedValue !== undefined)
                  .sort((a, b) => (b.expectedValue || 0) - (a.expectedValue || 0))
                  .slice(0, 3)
                  .map(p => (
                    <div key={p.id} className="flex justify-between items-center">
                      <span className="text-sm">{p.name}</span>
                      <Badge variant="outline" className="bg-purple-50">
                        {p.expectedValue}
                      </Badge>
                    </div>
                  ))
                }
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col items-start pt-0">
            <div className="text-xs text-muted-foreground border-t pt-4 w-full">
              <p className="mb-2"><strong>{t('analytics.expectedValueFormula') || 'Expected Value Formula'}:</strong></p>
              <p>(Win Rate × Avg. Win R) - (Loss Rate × Avg. Loss R)</p>
              <p className="mt-2 italic">
                {t('analytics.positiveEVNote') || 'Setups with positive expected value are profitable in the long run.'}
              </p>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default PlaybookTab;
