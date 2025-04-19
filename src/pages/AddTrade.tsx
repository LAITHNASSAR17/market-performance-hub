import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTrade } from '@/contexts/TradeContext';
import { useAuth } from '@/contexts/AuthContext';
import Layout from '@/components/Layout';
import { calculateProfitLoss, calculateReturnPercentage, calculateRiskPercentage } from '@/utils/tradeUtils';
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import TradePairSelector from '@/components/trade/TradePairSelector';
import TradeTypeSelector from '@/components/trade/TradeTypeSelector';
import TradePriceInputs from '@/components/trade/TradePriceInputs';
import TradeSizeAndCommission from '@/components/trade/TradeSizeAndCommission';
import TradeStopLossAndTarget from '@/components/trade/TradeStopLossAndTarget';
import TradeDateSelector from '@/components/trade/TradeDateSelector';
import TradeAccountSelector from '@/components/trade/TradeAccountSelector';
import MarketSessionSelector from '@/components/trade/MarketSessionSelector';
import TradeImages from '@/components/trade/TradeImages';
import { Trade } from '@/types/settings';

const marketSessions = [
  { id: 'asia', name: 'Asia' },
  { id: 'london', name: 'London' },
  { id: 'newYork', name: 'New York' },
  { id: 'londonClose', name: 'London Close' },
  { id: 'overlap', name: 'Overlap' },
  { id: 'other', name: 'Other' },
];

const AddTrade: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditMode = !!id;
  const { addTrade, updateTrade, getTrade, pairs, addSymbol, tradingAccounts } = useTrade();
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [selectedTrade, setSelectedTrade] = useState<Trade | undefined>(undefined);
  const [tradeData, setTradeData] = useState<Omit<Trade, 'id' | 'createdAt'>>({
    userId: user?.id || 'demo-user-id',
    pair: pairs[0] || 'EURUSD',
    type: 'Buy',
    entry: 0,
    exit: 0,
    lotSize: 0,
    stopLoss: 0,
    takeProfit: 0,
    riskPercentage: 0,
    returnPercentage: 0,
    profitLoss: 0,
    durationMinutes: 0,
    notes: '',
    date: format(new Date(), "yyyy-MM-dd"),
    account: tradingAccounts[0] || 'Demo',
    imageUrl: null,
    beforeImageUrl: null,
    afterImageUrl: null,
    hashtags: [],
    commission: 0,
    rating: 0,
    total: 0,
    playbook: '',
    followedRules: [],
    marketSession: marketSessions[0].name,
    symbol: pairs[0] || 'EURUSD'
  });
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());

  useEffect(() => {
    if (isEditMode && id) {
      const trade = getTrade(id);
      if (trade) {
        setSelectedTrade(trade);
        setTradeData({
          userId: trade.userId,
          pair: trade.pair,
          symbol: trade.symbol || trade.pair,
          type: trade.type,
          entry: trade.entry,
          exit: trade.exit || 0,
          lotSize: trade.lotSize,
          stopLoss: trade.stopLoss || 0,
          takeProfit: trade.takeProfit || 0,
          riskPercentage: trade.riskPercentage,
          returnPercentage: trade.returnPercentage,
          profitLoss: trade.profitLoss,
          durationMinutes: trade.durationMinutes || 0,
          notes: trade.notes,
          date: trade.date,
          account: trade.account,
          imageUrl: trade.imageUrl,
          beforeImageUrl: trade.beforeImageUrl,
          afterImageUrl: trade.afterImageUrl,
          hashtags: trade.hashtags,
          commission: trade.commission,
          rating: trade.rating,
          total: trade.total,
          playbook: trade.playbook || '',
          followedRules: trade.followedRules || [],
          marketSession: trade.marketSession || marketSessions[0].name
        });
        setSelectedDate(new Date(trade.date));
      }
    }
  }, [isEditMode, id, getTrade]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setTradeData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setTradeData(prev => ({ ...prev, [name]: value }));
    if (name === 'pair') {
      setTradeData(prev => ({ ...prev, pair: value }));
    }
  };

  const handleSaveClick = async () => {
    if (!tradeData.pair || !tradeData.type || !tradeData.entry || !tradeData.exit || !tradeData.lotSize) {
      toast({
        title: "خطأ",
        description: "يرجى ملء جميع الحقول المطلوبة",
        variant: "destructive"
      });
      return;
    }

    try {
      setLoading(true);
      const currentUser = user || { id: 'demo-user-id' };
      
      const finalTradeData = {
        ...tradeData,
        userId: currentUser.id,
        returnPercentage: calculateReturnPercentage(tradeData),
        riskPercentage: calculateRiskPercentage(tradeData),
        profitLoss: calculateProfitLoss(tradeData)
      };
    
      if (isEditMode && selectedTrade) {
        await updateTrade(selectedTrade.id, finalTradeData);
        toast({
          title: "تم التحديث",
          description: "تم تحديث الصفقة بنجاح"
        });
      } else {
        await addTrade(finalTradeData);
        toast({
          title: "تمت الإضافة",
          description: "تم إضافة الصفقة بنجاح"
        });
      }

      navigate('/trades');
    } catch (error) {
      console.error("Error saving trade:", error);
      toast({
        title: "خطأ",
        description: "فشل في حفظ الصفقة",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = (imageUrl: string, field: string) => {
    setTradeData(prev => ({ ...prev, [field]: imageUrl }));
  };

  const handleAddSymbol = () => {
    const newSymbol = prompt("Enter new trading pair symbol:");
    if (newSymbol) {
      addSymbol(newSymbol);
      setTradeData(prev => ({ ...prev, pair: newSymbol, symbol: newSymbol }));
    }
  };

  const handleDateChange = (date: Date | undefined) => {
    if (date) {
      setSelectedDate(date);
      setTradeData(prev => ({ ...prev, date: format(date, "yyyy-MM-dd") }));
    }
  };

  return (
    <Layout>
      <div className="container mx-auto py-8">
        <Card>
          <CardHeader>
            <CardTitle>{isEditMode ? 'Edit Trade' : 'Add New Trade'}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <TradePairSelector
                pairs={pairs}
                selectedPair={tradeData.pair}
                onPairChange={(value) => handleSelectChange('pair', value)}
                onAddPair={handleAddSymbol}
              />
              <TradeTypeSelector
                selectedType={tradeData.type}
                onTypeChange={(value) => handleSelectChange('type', value)}
              />
            </div>

            <TradePriceInputs
              entry={tradeData.entry}
              exit={tradeData.exit}
              onInputChange={handleInputChange}
            />

            <TradeSizeAndCommission
              lotSize={tradeData.lotSize}
              commission={tradeData.commission}
              onInputChange={handleInputChange}
            />

            <TradeStopLossAndTarget
              stopLoss={tradeData.stopLoss}
              takeProfit={tradeData.takeProfit}
              onInputChange={handleInputChange}
            />

            <div>
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                name="notes"
                value={tradeData.notes}
                onChange={handleInputChange}
              />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <TradeDateSelector
                selectedDate={selectedDate}
                onDateChange={handleDateChange}
              />
              <TradeAccountSelector
                accounts={tradingAccounts}
                selectedAccount={tradeData.account}
                onAccountChange={(value) => handleSelectChange('account', value)}
              />
            </div>

            <MarketSessionSelector
              selectedSession={tradeData.marketSession}
              onSessionChange={(value) => handleSelectChange('marketSession', value)}
            />

            <TradeImages
              beforeImageUrl={tradeData.beforeImageUrl}
              afterImageUrl={tradeData.afterImageUrl}
              additionalImageUrl={tradeData.imageUrl}
              onImageUpload={handleImageUpload}
            />

            <Button onClick={handleSaveClick} disabled={loading}>
              {loading ? 'Saving...' : 'Save Trade'}
            </Button>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default AddTrade;
