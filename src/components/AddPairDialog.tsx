
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useTrade, Symbol } from '@/contexts/TradeContext';

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
  const [name, setName] = useState('');
  const [type, setType] = useState<'forex' | 'crypto' | 'stock' | 'index' | 'commodity' | 'other'>('forex');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!symbol || !name) return;
    
    const newSymbol: Symbol = {
      symbol,
      name,
      type
    };
    
    addSymbol(newSymbol);
    onPairAdded(symbol);
    resetForm();
    onClose();
  };
  
  const resetForm = () => {
    setSymbol('');
    setName('');
    setType('forex');
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>إضافة زوج تداول جديد</DialogTitle>
          <DialogDescription>
            أدخل تفاصيل زوج التداول أو الرمز الجديد
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="symbol">رمز التداول</Label>
            <Input
              id="symbol"
              value={symbol}
              onChange={(e) => setSymbol(e.target.value)}
              placeholder="EUR/USD, AAPL, BTC/USD"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="name">الاسم الكامل</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Euro / US Dollar, Apple Inc."
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="type">النوع</Label>
            <Select 
              value={type} 
              onValueChange={(value: 'forex' | 'crypto' | 'stock' | 'index' | 'commodity' | 'other') => setType(value)}
            >
              <SelectTrigger id="type">
                <SelectValue placeholder="اختر النوع" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="forex">عملات (فوركس)</SelectItem>
                <SelectItem value="crypto">عملات رقمية</SelectItem>
                <SelectItem value="stock">أسهم</SelectItem>
                <SelectItem value="index">مؤشرات</SelectItem>
                <SelectItem value="commodity">سلع</SelectItem>
                <SelectItem value="other">أخرى</SelectItem>
              </SelectContent>
            </Select>
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
