
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useTrade } from '@/contexts/TradeContext';

type AddPairDialogProps = {
  isOpen: boolean;
  onClose: () => void;
  onPairAdded: (symbol: string) => void;
};

const AddPairDialog: React.FC<AddPairDialogProps> = ({
  isOpen,
  onClose,
  onPairAdded
}) => {
  const { addSymbol } = useTrade();
  const [symbol, setSymbol] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!symbol.trim()) return;
    
    // Only add the symbol, without additional details
    const newSymbol = {
      symbol,
      name: symbol,
      type: 'other' as const
    };
    
    addSymbol(newSymbol);
    onPairAdded(symbol);
    setSymbol('');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>إضافة زوج تداول جديد</DialogTitle>
          <DialogDescription>
            أدخل رمز التداول الجديد
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="symbol">رمز التداول</Label>
            <Input
              id="symbol"
              value={symbol}
              onChange={(e) => setSymbol(e.target.value)}
              placeholder="EUR/USD"
              required
            />
          </div>
          
          <DialogFooter className="pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              إلغاء
            </Button>
            <Button type="submit">
              إضافة
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddPairDialog;
