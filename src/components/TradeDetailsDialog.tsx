import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import { ITrade } from '@/services/tradeService';
import { format } from 'date-fns';
import { CalendarDays } from 'lucide-react';

interface TradeDetailsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  selectedDate: string | null;
  trades: ITrade[];
}

const TradeDetailsDialog: React.FC<TradeDetailsDialogProps> = ({
  isOpen,
  onClose,
  selectedDate,
  trades
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CalendarDays className="h-5 w-5" />
            Trade Details {selectedDate ? `- ${selectedDate}` : ''}
          </DialogTitle>
          <DialogDescription>
            View all trades executed on this date.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          {trades.length > 0 ? (
            trades.map((trade) => (
              <div key={trade.id} className="border rounded-md p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium">{trade.symbol}</h3>
                    <p className="text-sm text-gray-500">
                      {trade.direction === 'long' ? 'Buy' : 'Sell'} • {format(new Date(trade.entryDate), 'HH:mm')}
                    </p>
                  </div>
                  <div className={`font-medium ${(trade.profitLoss || 0) > 0 ? 'text-green-600' : 'text-red-600'}`}>
                    ${trade.profitLoss?.toFixed(2) || '0.00'}
                  </div>
                </div>
                
                <div className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
                  <div>
                    <span className="text-gray-500">Entry:</span> {trade.entryPrice.toFixed(2)}
                  </div>
                  <div>
                    <span className="text-gray-500">Exit:</span> {trade.exitPrice?.toFixed(2) || '-'}
                  </div>
                  <div>
                    <span className="text-gray-500">Quantity:</span> {trade.quantity}
                  </div>
                  <div>
                    <span className="text-gray-500">Status:</span> {trade.exitDate ? 'Closed' : 'Open'}
                  </div>
                </div>
                
                {trade.notes && (
                  <div className="mt-2 text-sm">
                    <span className="text-gray-500">Notes:</span> {trade.notes}
                  </div>
                )}
              </div>
            ))
          ) : (
            <p className="text-center text-gray-500 py-4">No trades found for this date.</p>
          )}
        </div>
        
        <DialogFooter>
          <Button onClick={onClose}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default TradeDetailsDialog;
