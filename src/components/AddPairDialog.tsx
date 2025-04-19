
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useTrade } from '@/contexts/TradeContext';

interface AddPairDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onPairAdded: (symbol: string) => void;
}

const AddPairDialog: React.FC<AddPairDialogProps> = ({ isOpen, onClose, onPairAdded }) => {
  const [symbol, setSymbol] = useState('');
  const [error, setError] = useState('');
  const { addSymbol } = useTrade();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!symbol) {
      setError('Please enter a symbol');
      return;
    }

    const formattedSymbol = symbol.toUpperCase();
    addSymbol(formattedSymbol);
    onPairAdded(formattedSymbol);
    setSymbol('');
    setError('');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Trading Pair</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="symbol">Symbol</Label>
              <Input
                id="symbol"
                value={symbol}
                onChange={(e) => setSymbol(e.target.value)}
                placeholder="Enter trading pair (e.g., EURUSD)"
              />
              {error && <p className="text-sm text-red-500">{error}</p>}
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">Add Pair</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddPairDialog;
