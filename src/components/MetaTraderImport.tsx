
import React, { useRef } from 'react';
import { Button } from '@/components/ui/button';
import { FileUp } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import Papa from 'papaparse';
import { Trade } from '@/types/trade';

interface MetaTraderImportProps {
  onImport: (trades: Partial<Trade>[]) => void;
}

const MetaTraderImport: React.FC<MetaTraderImportProps> = ({ onImport }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const parseXMLData = (xmlText: string) => {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlText, 'text/xml');
    const orders = xmlDoc.getElementsByTagName('order');
    
    return Array.from(orders).map(order => ({
      pair: order.getAttribute('symbol') || '',
      type: (order.getAttribute('type') || '').toLowerCase().includes('buy') ? 'Buy' as const : 'Sell' as const,
      entry: parseFloat(order.getAttribute('open_price') || '0'),
      exit: parseFloat(order.getAttribute('close_price') || '0'),
      lotSize: parseFloat(order.getAttribute('lots') || '0'),
      stopLoss: parseFloat(order.getAttribute('sl') || '0') || null,
      takeProfit: parseFloat(order.getAttribute('tp') || '0') || null,
      profitLoss: parseFloat(order.getAttribute('profit') || '0'),
      date: new Date(order.getAttribute('open_time') || '').toISOString().split('T')[0],
      durationMinutes: Math.round(
        (new Date(order.getAttribute('close_time') || '').getTime() - 
         new Date(order.getAttribute('open_time') || '').getTime()) / (1000 * 60)
      ),
      commission: Math.abs(
        parseFloat(order.getAttribute('commission') || '0') + 
        parseFloat(order.getAttribute('swap') || '0')
      ),
      account: 'Main Trading',
      notes: `Imported from MetaTrader - Ticket: ${order.getAttribute('ticket')}`,
      hashtags: ['imported']
    }));
  };

  const parseHTMLData = (htmlText: string) => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlText, 'text/html');
    const rows = doc.querySelectorAll('tr');
    
    return Array.from(rows).slice(1).map(row => {
      const cells = row.getElementsByTagName('td');
      if (cells.length < 12) return null;

      const [ticket, openTime, type, size, symbol, openPrice, sl, tp, closeTime, closePrice, commission, swap, profit] = 
        Array.from(cells).map(cell => cell.textContent?.trim() || '');

      return {
        pair: symbol,
        type: (type || '').toLowerCase().includes('buy') ? 'Buy' as const : 'Sell' as const,
        entry: parseFloat(openPrice || '0'),
        exit: parseFloat(closePrice || '0'),
        lotSize: parseFloat(size || '0'),
        stopLoss: parseFloat(sl || '0') || null,
        takeProfit: parseFloat(tp || '0') || null,
        profitLoss: parseFloat(profit || '0'),
        date: new Date(openTime || '').toISOString().split('T')[0],
        durationMinutes: Math.round(
          (new Date(closeTime || '').getTime() - new Date(openTime || '').getTime()) / (1000 * 60)
        ),
        commission: Math.abs(
          parseFloat(commission || '0') + parseFloat(swap || '0')
        ),
        account: 'Main Trading',
        notes: `Imported from MetaTrader - Ticket: ${ticket}`,
        hashtags: ['imported']
      };
    }).filter(Boolean);
  };

  // تحويل HTML إلى CSV
  const convertHTMLToCSV = (htmlContent: string): string => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlContent, 'text/html');
    const table = doc.querySelector('table');
    
    if (!table) return '';
    
    const rows = Array.from(table.querySelectorAll('tr'));
    const csvRows = rows.map(row => {
      const cells = Array.from(row.querySelectorAll('td, th'));
      return cells.map(cell => `"${cell.textContent?.trim().replace(/"/g, '""') || ''}"`).join(',');
    });
    
    return csvRows.join('\n');
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      const content = e.target?.result as string;
      let trades: Partial<Trade>[] = [];

      try {
        if (file.name.endsWith('.csv')) {
          const results = Papa.parse(content, { header: false });
          trades = results.data.slice(1).map((row: any) => {
            if (!Array.isArray(row) || row.length < 7) return null;
            
            const [ticket, openTime, type, size, symbol, openPrice, sl, tp, closeTime, closePrice, commission, swap, profit] = row;
            
            if (!symbol || !openPrice || !closePrice || !type) return null;
            
            return {
              pair: symbol,
              type: type.toLowerCase().includes('buy') ? 'Buy' as const : 'Sell' as const,
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
            };
          }).filter(Boolean);
        } else if (file.name.endsWith('.xml')) {
          trades = parseXMLData(content);
        } else if (file.name.endsWith('.html') || file.name.endsWith('.htm')) {
          // محاولة تحليل HTML مباشرة
          const htmlTrades = parseHTMLData(content);
          
          // إذا لم يتم العثور على صفقات، حاول تحويل HTML إلى CSV ثم تحليله
          if (htmlTrades.length === 0) {
            const csvContent = convertHTMLToCSV(content);
            if (csvContent) {
              const results = Papa.parse(csvContent, { header: false });
              trades = results.data.slice(1).map((row: any) => {
                if (!Array.isArray(row) || row.length < 7) return null;
                
                const [ticket, openTime, type, size, symbol, openPrice, sl, tp, closeTime, closePrice, commission, swap, profit] = row;
                
                if (!symbol || !openPrice || !closePrice || !type) return null;
                
                return {
                  pair: symbol,
                  type: type.toLowerCase().includes('buy') ? 'Buy' as const : 'Sell' as const,
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
                };
              }).filter(Boolean);
            } else {
              trades = htmlTrades;
            }
          } else {
            trades = htmlTrades;
          }
        } else {
          throw new Error('Unsupported file format');
        }

        trades = trades.filter(trade => 
          trade && trade.pair && trade.entry && trade.exit && !isNaN(trade.entry) && !isNaN(trade.exit)
        );

        if (trades.length === 0) {
          throw new Error('No valid trades found');
        }

        onImport(trades);
        toast({
          title: "تم استيراد الصفقات",
          description: `تم استيراد ${trades.length} صفقة بنجاح`,
        });
      } catch (error) {
        console.error('Import error:', error);
        toast({
          title: "خطأ في الاستيراد",
          description: "تأكد من تنسيق الملف",
          variant: "destructive"
        });
      }
    };

    reader.readAsText(file);
  };

  return (
    <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg mb-6">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileUpload}
        accept=".csv,.xml,.html,.htm"
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
        قم بتصدير سجل الصفقات من MetaTrader بصيغة CSV, HTML, أو XML وارفعه هنا
      </div>
    </div>
  );
};

export default MetaTraderImport;
