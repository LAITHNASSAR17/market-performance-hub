
import React, { useState } from 'react';
import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import TradePairSelector from './TradePairSelector';
import TradeTypeSelector from './TradeTypeSelector';
import TradePriceInputs from './TradePriceInputs';
import TradeSizeAndCommission from './TradeSizeAndCommission';
import TradeStopLossAndTarget from './TradeStopLossAndTarget';
import TradeDateSelector from './TradeDateSelector';
import TradeAccountSelector from './TradeAccountSelector';
import MarketSessionSelector from './MarketSessionSelector';
import TradeImages from './TradeImages';
import { Trade } from '@/types/trade';
import { TRADE_TYPES, TradeType } from '@/constants/tradeTypes';

interface TradeFormProps {
  isEditMode: boolean;
  initialData: Omit<Trade, 'id' | 'createdAt'>;
  pairs: string[];
  tradingAccounts: string[];
  onAddSymbol: () => void;
  onSave: (data: Omit<Trade, 'id' | 'createdAt'>) => void;
  loading: boolean;
}

const TradeForm: React.FC<TradeFormProps> = ({
  isEditMode,
  initialData,
  pairs,
  tradingAccounts,
  onAddSymbol,
  onSave,
  loading
}) => {
  const [tradeData, setTradeData] = useState(initialData);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    tradeData.date ? new Date(tradeData.date) : new Date()
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setTradeData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setTradeData(prev => ({ 
      ...prev, 
      [name]: value,
      ...(name === 'pair' ? { symbol: value } : {})
    }));
  };

  const handleTypeChange = (value: TradeType) => {
    setTradeData(prev => ({
      ...prev,
      type: value
    }));
  };

  const handleDateChange = (date: Date | undefined) => {
    if (date) {
      setSelectedDate(date);
      setTradeData(prev => ({ ...prev, date: format(date, "yyyy-MM-dd") }));
    }
  };

  const handleImageUpload = (imageUrl: string, field: string) => {
    setTradeData(prev => ({ ...prev, [field]: imageUrl }));
  };

  return (
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
            onAddPair={onAddSymbol}
          />
          <TradeTypeSelector
            selectedType={tradeData.type}
            onTypeChange={handleTypeChange}
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

        <Button onClick={() => onSave(tradeData)} disabled={loading}>
          {loading ? 'Saving...' : 'Save Trade'}
        </Button>
      </CardContent>
    </Card>
  );
};

export default TradeForm;
