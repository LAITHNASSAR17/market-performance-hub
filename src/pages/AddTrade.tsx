
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '@/components/Layout';
import { usePlaybooks } from '@/hooks/usePlaybooks';
import { useTrade } from '@/contexts/TradeContext';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { PlaybookEntry, PlaybookRule } from '@/hooks/usePlaybooks';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { CalendarIcon } from '@radix-ui/react-icons';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { Symbol } from '@/contexts/TradeContext';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Slider } from "@/components/ui/slider"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { useToast } from "@/components/ui/use-toast"

const AddTrade: React.FC = () => {
  const { playbooks } = usePlaybooks();
  const { addTrade, pairs, symbols, addSymbol, allHashtags, addHashtag, calculateProfitLoss } = useTrade();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [pair, setPair] = useState('');
  const [type, setType] = useState<'Buy' | 'Sell'>('Buy');
  const [entry, setEntry] = useState<number | null>(null);
  const [exit, setExit] = useState<number | null>(null);
  const [lotSize, setLotSize] = useState<number | null>(null);
  const [stopLoss, setStopLoss] = useState<number | null>(null);
  const [takeProfit, setTakeProfit] = useState<number | null>(null);
  const [riskPercentage, setRiskPercentage] = useState<number | null>(null);
  const [returnPercentage, setReturnPercentage] = useState<number | null>(null);
  const [profitLoss, setProfitLoss] = useState<number | null>(null);
  const [durationMinutes, setDurationMinutes] = useState<number | null>(null);
  const [notes, setNotes] = useState('');
  const [date, setDate] = useState<Date | null>(null);
  const [account, setAccount] = useState('');
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [beforeImageUrl, setBeforeImageUrl] = useState<string | null>(null);
  const [afterImageUrl, setAfterImageUrl] = useState<string | null>(null);
  const [hashtags, setHashtags] = useState<string[]>([]);
  const [commission, setCommission] = useState<number | null>(null);
  const [rating, setRating] = useState<number | null>(null);

  const [selectedPlaybook, setSelectedPlaybook] = useState<string | null>(null);
  const [selectedPlaybookRules, setSelectedPlaybookRules] = useState<PlaybookRule[]>([]);
  const [followedRules, setFollowedRules] = useState<string[]>([]);

  const [open, setOpen] = React.useState(false)
  const [commandValue, setCommandValue] = React.useState("")

  const handlePlaybookChange = (value: string) => {
    const playbook = playbooks.find(p => p.id === value);
    setSelectedPlaybook(value);
    setSelectedPlaybookRules(playbook?.rules || []);
  };

  const handleRuleToggle = (ruleId: string) => {
    setFollowedRules(prev => 
      prev.includes(ruleId) 
        ? prev.filter(id => id !== ruleId) 
        : [...prev, ruleId]
    );
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    
    if (!pair || !type || !entry || !exit || !lotSize || !date) {
      toast({
        title: "Required Fields Missing",
        description: "Please fill in all required fields.",
        variant: "destructive",
      })
      return;
    }

    try {
      await addTrade({
        pair: pair,
        type: type,
        entry: entry,
        exit: exit,
        lotSize: lotSize,
        stopLoss: stopLoss,
        takeProfit: takeProfit,
        riskPercentage: riskPercentage || 0,
        returnPercentage: returnPercentage || 0,
        profitLoss: profitLoss || 0,
        durationMinutes: durationMinutes || 0,
        notes: notes,
        date: format(date, 'yyyy-MM-dd'),
        account: account,
        imageUrl: imageUrl,
        beforeImageUrl: beforeImageUrl,
        afterImageUrl: afterImageUrl,
        hashtags: hashtags,
        commission: commission || 0,
        rating: rating || 0,
        playbook: selectedPlaybook === 'none' ? null : selectedPlaybook,
        followedRules: followedRules,
      });
      
      navigate('/trades');
    } catch (error) {
      console.error('Error adding trade:', error);
    }
  };

  const handleSymbolSelect = (symbol: Symbol) => {
    setPair(symbol.symbol);
    setOpen(false);
  };

  const filteredSymbols = symbols.filter((symbol) =>
    symbol.symbol.toLowerCase().includes(commandValue.toLowerCase()) ||
    symbol.name.toLowerCase().includes(commandValue.toLowerCase())
  );

  const handleHashtagAddition = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      const hashtag = (event.target as HTMLInputElement).value.trim();
      if (hashtag && !hashtags.includes(hashtag)) {
        setHashtags([...hashtags, hashtag]);
        addHashtag(hashtag);
        (event.target as HTMLInputElement).value = '';
      }
    }
  };

  const handleRemoveHashtag = (hashtagToRemove: string) => {
    setHashtags(hashtags.filter(hashtag => hashtag !== hashtagToRemove));
  };

  const handleCalculateProfitLoss = () => {
    if (entry !== null && exit !== null && lotSize !== null && type) {
      const calculatedProfitLoss = calculateProfitLoss(entry, exit, lotSize, type, pair);
      setProfitLoss(calculatedProfitLoss);
    }
  };

  return (
    <Layout>
      <div className="container mx-auto p-6">
        <h1 className="text-2xl font-bold mb-4">Add New Trade</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          
          <div>
            <Label htmlFor="pair">الزوج</Label>
            <Command open={open} onOpenChange={setOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={open}
                  className="w-full justify-between"
                >
                  {pair
                    ? symbols.find((symbol) => symbol.symbol === pair)?.name
                    : "Select symbol..."}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="p-0">
                <CommandInput
                  placeholder="Search symbol..."
                  value={commandValue}
                  onValueChange={setCommandValue}
                />
                <CommandList>
                  <CommandEmpty>No symbol found.</CommandEmpty>
                  <CommandGroup heading="Symbols">
                    {filteredSymbols.map((symbol) => (
                      <CommandItem
                        key={symbol.symbol}
                        value={symbol.symbol}
                        onSelect={() => handleSymbolSelect(symbol)}
                      >
                        {symbol.name}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                  <CommandSeparator />
                  <CommandGroup heading="Settings">
                    <CommandItem onSelect={() => alert("Add new symbol.")}>
                      Add symbol
                    </CommandItem>
                  </CommandGroup>
                </CommandList>
              </PopoverContent>
            </Command>
          </div>
          
          <div>
            <Label htmlFor="type">النوع</Label>
            <Select value={type} onValueChange={(value) => setType(value as 'Buy' | 'Sell')}>
              <SelectTrigger>
                <SelectValue placeholder="Select trade type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Buy">شراء</SelectItem>
                <SelectItem value="Sell">بيع</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label htmlFor="entry">سعر الدخول</Label>
            <Input
              type="number"
              id="entry"
              value={entry !== null ? entry.toString() : ''}
              onChange={(e) => setEntry(e.target.value ? parseFloat(e.target.value) : null)}
            />
          </div>
          
          <div>
            <Label htmlFor="exit">سعر الخروج</Label>
            <Input
              type="number"
              id="exit"
              value={exit !== null ? exit.toString() : ''}
              onChange={(e) => setExit(e.target.value ? parseFloat(e.target.value) : null)}
              onBlur={handleCalculateProfitLoss}
            />
          </div>
          
          <div>
            <Label htmlFor="lotSize">حجم اللوت</Label>
            <Input
              type="number"
              id="lotSize"
              value={lotSize !== null ? lotSize.toString() : ''}
              onChange={(e) => setLotSize(e.target.value ? parseFloat(e.target.value) : null)}
              onBlur={handleCalculateProfitLoss}
            />
          </div>
          
          <div>
            <Label htmlFor="stopLoss">وقف الخسارة</Label>
            <Input
              type="number"
              id="stopLoss"
              value={stopLoss !== null ? stopLoss.toString() : ''}
              onChange={(e) => setStopLoss(e.target.value ? parseFloat(e.target.value) : null)}
            />
          </div>
          
          <div>
            <Label htmlFor="takeProfit">جني الأرباح</Label>
            <Input
              type="number"
              id="takeProfit"
              value={takeProfit !== null ? takeProfit.toString() : ''}
              onChange={(e) => setTakeProfit(e.target.value ? parseFloat(e.target.value) : null)}
            />
          </div>
          
          <div>
            <Label htmlFor="profitLoss">الربح / الخسارة</Label>
            <Input
              type="number"
              id="profitLoss"
              value={profitLoss !== null ? profitLoss.toString() : ''}
              readOnly
            />
          </div>
          
          <div>
            <Label htmlFor="commission">العمولة</Label>
            <Input
              type="number"
              id="commission"
              value={commission !== null ? commission.toString() : ''}
              onChange={(e) => setCommission(e.target.value ? parseFloat(e.target.value) : null)}
            />
          </div>
          
          <div>
            <Label htmlFor="durationMinutes">المدة بالدقائق</Label>
            <Input
              type="number"
              id="durationMinutes"
              value={durationMinutes !== null ? durationMinutes.toString() : ''}
              onChange={(e) => setDurationMinutes(e.target.value ? parseFloat(e.target.value) : null)}
            />
          </div>
          
          <div>
            <Label htmlFor="notes">ملاحظات</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>
          
          <div>
            <Label>تاريخ التداول</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={cn(
                    "w-[240px] justify-start text-left font-normal",
                    !date && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? format(date, "yyyy-MM-dd") : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="center">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  disabled={(date) =>
                    date > new Date()
                  }
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
          
          <div>
            <Label htmlFor="hashtags">الهاشتاجات</Label>
            <div className="flex items-center space-x-2">
              <Input
                type="text"
                id="hashtags"
                placeholder="أضف هاشتاج واضغط Enter"
                onKeyDown={handleHashtagAddition}
              />
            </div>
            <div className="flex flex-wrap mt-2">
              {hashtags.map(hashtag => (
                <Badge key={hashtag} className="mr-2 mb-2 rounded-full px-3 py-1 text-sm font-medium bg-secondary hover:bg-muted">
                  {hashtag}
                  <button onClick={() => handleRemoveHashtag(hashtag)} className="ml-1">
                    <span aria-hidden="true">&times;</span>
                  </button>
                </Badge>
              ))}
            </div>
          </div>
        
        <div className="mb-4">
          <Label>الاستراتيجية</Label>
          <Select 
            value={selectedPlaybook || ''} 
            onValueChange={handlePlaybookChange}
          >
            <SelectTrigger>
              <SelectValue placeholder="اختر استراتيجية" />
            </SelectTrigger>
            <SelectContent>
              {playbooks.map(playbook => (
                <SelectItem 
                  key={playbook.id} 
                  value={playbook.id}
                >
                  {playbook.name}
                </SelectItem>
              ))}
              <SelectItem value="none">بدون استراتيجية</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        {selectedPlaybook && selectedPlaybook !== 'none' && selectedPlaybookRules.length > 0 && (
          <div className="space-y-2 border rounded-md p-4">
            <Label>القواعد المتبعة في هذا التداول</Label>
            <div className="space-y-2 mt-2">
              {selectedPlaybookRules.map(rule => (
                <div key={rule.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={rule.id}
                    checked={followedRules.includes(rule.id)}
                    onCheckedChange={() => handleRuleToggle(rule.id)}
                  />
                  <Label htmlFor={rule.id}>{rule.description}</Label>
                </div>
              ))}
            </div>
          </div>
        )}
        
          <Button type="submit" className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-700">
            إضافة التداول
          </Button>
        </form>
      </div>
    </Layout>
  );
};

export default AddTrade;
