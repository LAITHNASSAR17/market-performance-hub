
import React, { useRef } from 'react';
import { Button } from '@/components/ui/button';
import { FileUp } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { Trade } from '@/types/trade';
import Papa from 'papaparse';

interface MetaTraderImportProps {
  onImport: (trades: Partial<Trade>[]) => void;
}

const MetaTraderImport: React.FC<MetaTraderImportProps> = ({ onImport }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    Papa.parse(file, {
      complete: (results) => {
        try {
          const trades = results.data.slice(1).map((row: any) => {
            const [ticket, openTime, type, size, symbol, openPrice, sl, tp, closeTime, closePrice, commission, swap, profit] = row;
            
            return {
              pair: symbol,
              type: type.toLowerCase().includes('buy') ? 'Buy' : 'Sell',
              entry: parseFloat(openPrice),
              exit: parseFloat(closePrice),
              lotSize: parseFloat(size),
              stopLoss: sl ? parseFloat(sl) : null,
              takeProfit: tp ? parseFloat(tp) : null,
              profitLoss: parseFloat(profit),
              date: new Date(openTime).toISOString().split('T')[0],
              durationMinutes: Math.round((new Date(closeTime).getTime() - new Date(openTime).getTime()) / (1000 * 60)),
              commission: Math.abs(parseFloat(commission || '0') + parseFloat(swap || '0')),
              account: 'Main Trading',
              notes: `Imported from MetaTrader - Ticket: ${ticket}`,
              hashtags: ['imported']
            } as Partial<Trade>;
          }).filter(trade => trade.pair && trade.entry && trade.exit);

          onImport(trades);
          toast({
            title: "تم استيراد الصفقات",
            description: `تم استيراد ${trades.length} صفقة بنجاح`,
          });
        } catch (error) {
          toast({
            title: "خطأ في الاستيراد",
            description: "تأكد من تنسيق الملف",
            variant: "destructive"
          });
        }
      },
      error: () => {
        toast({
          title: "خطأ في قراءة الملف",
          description: "تأكد من تنسيق الملف",
          variant: "destructive"
        });
      }
    });
  };

  return (
    <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg mb-6">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileUpload}
        accept=".csv"
        className="hidden"
      />
      <Button 
        variant="outline" 
        onClick={() => fileInputRef.current?.click()}
        className="flex items-center gap-2"
      >
        <FileUp className="h-4 w-4" />
        استيراد من MetaTrader
      </Button>
      <div className="text-sm text-muted-foreground">
        قم بتصدير سجل الصفقات من MetaTrader بصيغة CSV وارفعه هنا
      </div>
    </div>
  );
};

export default MetaTraderImport;
