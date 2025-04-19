import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAuth } from '@/contexts/AuthContext';
import { useTrade } from '@/contexts/TradeContext';
import { useTags } from '@/contexts/TagsContext';
import { tradeService } from '@/services/tradeService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { CalendarIcon } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { TradingAccount } from '@/contexts/TradeContext';
import { userService } from '@/services/userService';
import { useToast } from '@/hooks/use-toast';

const formSchema = z.object({
  symbol: z.string().min(1, { message: "Symbol is required." }),
  entry_price: z.string().refine(value => !isNaN(parseFloat(value)), {
    message: "Entry price must be a number.",
  }),
  exit_price: z.string().refine(value => !isNaN(parseFloat(value)), {
    message: "Exit price must be a number.",
  }),
  quantity: z.string().refine(value => !isNaN(parseFloat(value)), {
    message: "Quantity must be a number.",
  }),
  direction: z.enum(['long', 'short'], {
    required_error: "Please select a trade direction.",
  }),
  entry_date: z.date(),
  exit_date: z.date().nullable(),
  profit_loss: z.string().refine(value => !isNaN(parseFloat(value)), {
    message: "Profit/Loss must be a number.",
  }),
  fees: z.string().refine(value => !isNaN(parseFloat(value)), {
    message: "Fees must be a number.",
  }),
  notes: z.string().optional(),
  tags: z.array(z.string()).optional(),
  rating: z.string().optional(),
  stop_loss: z.string().optional(),
  take_profit: z.string().optional(),
  duration_minutes: z.string().optional(),
  playbook: z.string().optional(),
  followed_rules: z.array(z.string()).optional(),
  market_session: z.string().optional(),
  account_id: z.string().optional(),
  risk_percentage: z.string().optional(),
  return_percentage: z.string().optional(),
});

const AddTrade: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { addTrade, updateTrade } = useTrade();
  const { tags } = useTags();
  const [trade, setTrade] = useState<any>(null);
  const [tradingAccounts, setTradingAccounts] = useState<TradingAccount[]>([]);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      symbol: "",
      entry_price: "",
      exit_price: "",
      quantity: "",
      direction: "long",
      entry_date: new Date(),
      exit_date: null,
      profit_loss: "",
      fees: "",
      notes: "",
      tags: [],
      rating: "",
      stop_loss: "",
      take_profit: "",
      duration_minutes: "",
      playbook: "",
      followed_rules: [],
      market_session: "",
      account_id: "",
      risk_percentage: "",
      return_percentage: "",
    },
  });

  useEffect(() => {
    if (id) {
      const fetchTrade = async () => {
        try {
          const tradeData = await tradeService.getTradeById(id);
          setTrade(tradeData);
          form.reset({
            symbol: tradeData.symbol,
            entry_price: String(tradeData.entry_price),
            exit_price: String(tradeData.exit_price),
            quantity: String(tradeData.quantity),
            direction: tradeData.direction,
            entry_date: new Date(tradeData.entry_date),
            exit_date: tradeData.exit_date ? new Date(tradeData.exit_date) : null,
            profit_loss: String(tradeData.profit_loss),
            fees: String(tradeData.fees),
            notes: tradeData.notes,
            tags: tradeData.tags,
            rating: String(tradeData.rating),
            stop_loss: String(tradeData.stop_loss),
            take_profit: String(tradeData.take_profit),
            duration_minutes: String(tradeData.duration_minutes),
            playbook: tradeData.playbook,
            followed_rules: tradeData.followed_rules,
            market_session: tradeData.market_session,
            account_id: tradeData.account_id,
            risk_percentage: String(tradeData.risk_percentage),
            return_percentage: String(tradeData.return_percentage),
          });
        } catch (error) {
          console.error("Error fetching trade:", error);
        }
      };
      fetchTrade();
    }
  }, [id, form]);

  useEffect(() => {
    const loadTradingAccounts = async () => {
      if (user?.id) {
        try {
          const accounts = await userService.getTradingAccounts(user.id);
          setTradingAccounts(accounts);
        } catch (error) {
          console.error("Error loading trading accounts:", error);
        }
      }
    };

    loadTradingAccounts();
  }, [user]);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    const mappedDirection = values.direction === "long" ? "Buy" : "Sell";

    const tradeData = {
      user_id: user?.id as string,
      symbol: values.symbol,
      entry_price: parseFloat(values.entry_price),
      exit_price: parseFloat(values.exit_price),
      quantity: parseFloat(values.quantity),
      direction: values.direction,
      entry_date: values.entry_date.toISOString(),
      exit_date: values.exit_date ? values.exit_date.toISOString() : null,
      profit_loss: parseFloat(values.profit_loss),
      fees: parseFloat(values.fees),
      notes: values.notes || '',
      tags: values.tags || [],
      rating: values.rating ? parseFloat(values.rating) : null,
      stop_loss: values.stop_loss ? parseFloat(values.stop_loss) : null,
      take_profit: values.take_profit ? parseFloat(values.take_profit) : null,
      duration_minutes: values.duration_minutes ? parseFloat(values.duration_minutes) : null,
      playbook: values.playbook || '',
      followed_rules: values.followed_rules || [],
      market_session: values.market_session || '',
      account_id: values.account_id || '',
      risk_percentage: values.risk_percentage ? parseFloat(values.risk_percentage) : null,
      return_percentage: values.return_percentage ? parseFloat(values.return_percentage) : null,
    };

    try {
      if (id) {
        const { data, error } = await tradeService.updateTrade(id, tradeData);
        if (error) {
          toast({
            title: "Error updating trade",
            description: "Failed to update the trade. Please try again.",
            variant: "destructive",
          });
        } else {
          updateTrade(data);
          toast({
            title: "Trade updated",
            description: "The trade has been updated successfully.",
          });
          navigate('/trades');
        }
      } else {
        const { data, error } = await tradeService.createTrade(tradeData);
        if (error) {
          toast({
            title: "Error adding trade",
            description: "Failed to add the trade. Please try again.",
            variant: "destructive",
          });
        } else {
          addTrade(data);
          toast({
            title: "Trade added",
            description: "The trade has been added successfully.",
          });
          navigate('/trades');
        }
      }
    } catch (error) {
      console.error("Error adding/updating trade:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-2xl font-bold mb-6">{id ? "Edit Trade" : "Add Trade"}</h1>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <Label htmlFor="symbol">Symbol</Label>
          <Input id="symbol" type="text" placeholder="e.g., AAPL" {...form.register("symbol")} />
          {form.formState.errors.symbol && (
            <p className="text-red-500 text-sm">{form.formState.errors.symbol.message}</p>
          )}
        </div>

        <div>
          <Label htmlFor="entry_price">Entry Price</Label>
          <Input id="entry_price" type="text" placeholder="e.g., 150.25" {...form.register("entry_price")} />
          {form.formState.errors.entry_price && (
            <p className="text-red-500 text-sm">{form.formState.errors.entry_price.message}</p>
          )}
        </div>

        <div>
          <Label htmlFor="exit_price">Exit Price</Label>
          <Input id="exit_price" type="text" placeholder="e.g., 155.50" {...form.register("exit_price")} />
          {form.formState.errors.exit_price && (
            <p className="text-red-500 text-sm">{form.formState.errors.exit_price.message}</p>
          )}
        </div>

        <div>
          <Label htmlFor="quantity">Quantity</Label>
          <Input id="quantity" type="text" placeholder="e.g., 10" {...form.register("quantity")} />
          {form.formState.errors.quantity && (
            <p className="text-red-500 text-sm">{form.formState.errors.quantity.message}</p>
          )}
        </div>

        <div>
          <Label>Direction</Label>
          <div className="flex items-center space-x-2">
            <Label htmlFor="long" className="flex items-center">
              <input
                type="radio"
                id="long"
                value="long"
                className="mr-2"
                {...form.register("direction")}
              />
              Long
            </Label>
            <Label htmlFor="short" className="flex items-center">
              <input
                type="radio"
                id="short"
                value="short"
                className="mr-2"
                {...form.register("direction")}
              />
              Short
            </Label>
          </div>
          {form.formState.errors.direction && (
            <p className="text-red-500 text-sm">{form.formState.errors.direction.message}</p>
          )}
        </div>

        <div>
          <Label htmlFor="entry_date">Entry Date</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant={"outline"}
                className={cn(
                  "w-[240px] justify-start text-left font-normal",
                  !form.getValues("entry_date") && "text-muted-foreground"
                )}
              >
                {form.getValues("entry_date") ? (
                  format(form.getValues("entry_date"), "PPP")
                ) : (
                  <span>Pick a date</span>
                )}
                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="center" side="bottom">
              <Calendar
                mode="single"
                selected={form.getValues("entry_date")}
                onSelect={(date) => form.setValue("entry_date", date!)}
                disabled={(date) =>
                  date > new Date()
                }
                initialFocus
              />
            </PopoverContent>
          </Popover>
          {form.formState.errors.entry_date && (
            <p className="text-red-500 text-sm">{form.formState.errors.entry_date.message}</p>
          )}
        </div>

        <div>
          <Label htmlFor="exit_date">Exit Date</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant={"outline"}
                className={cn(
                  "w-[240px] justify-start text-left font-normal",
                  !form.getValues("exit_date") && "text-muted-foreground"
                )}
              >
                {form.getValues("exit_date") ? (
                  format(form.getValues("exit_date"), "PPP")
                ) : (
                  <span>Pick a date</span>
                )}
                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="center" side="bottom">
              <Calendar
                mode="single"
                selected={form.getValues("exit_date")}
                onSelect={(date) => form.setValue("exit_date", date)}
                disabled={(date) =>
                  date > new Date() || date < form.getValues("entry_date")
                }
                initialFocus
              />
            </PopoverContent>
          </Popover>
          {form.formState.errors.exit_date && (
            <p className="text-red-500 text-sm">{form.formState.errors.exit_date.message}</p>
          )}
        </div>

        <div>
          <Label htmlFor="profit_loss">Profit/Loss</Label>
          <Input id="profit_loss" type="text" placeholder="e.g., 500.00" {...form.register("profit_loss")} />
          {form.formState.errors.profit_loss && (
            <p className="text-red-500 text-sm">{form.formState.errors.profit_loss.message}</p>
          )}
        </div>

        <div>
          <Label htmlFor="fees">Fees</Label>
          <Input id="fees" type="text" placeholder="e.g., 1.50" {...form.register("fees")} />
          {form.formState.errors.fees && (
            <p className="text-red-500 text-sm">{form.formState.errors.fees.message}</p>
          )}
        </div>

        <div>
          <Label htmlFor="notes">Notes</Label>
          <Textarea id="notes" placeholder="Trade notes..." {...form.register("notes")} />
        </div>

        <div>
          <Label htmlFor="tags">Tags</Label>
          <Select
            multiple
            onValueChange={(value) => form.setValue("tags", value)}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select tags" />
            </SelectTrigger>
            <SelectContent>
              {tags.map((tag) => (
                <SelectItem key={tag} value={tag}>
                  {tag}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="account_id">Trading Account</Label>
          <Select onValueChange={(value) => form.setValue("account_id", value)}>
            <SelectTrigger className="w-[240px]">
              <SelectValue placeholder="Select account" />
            </SelectTrigger>
            <SelectContent>
              {tradingAccounts.map((account) => (
                <SelectItem key={account.id} value={account.id}>
                  {account.name} (Balance: {account.balance})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Button type="submit" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting ? "Submitting..." : "Submit"}
        </Button>
      </form>
    </div>
  );
};

export default AddTrade;
