import React, { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { FileUp, Loader2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import Papa from 'papaparse';
import { Trade } from '@/types/trade';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface MetaTraderImportProps {
  onImport: (trades: Partial<Trade>[]) => void;
}

const MetaTraderImport: React.FC<MetaTraderImportProps> = ({ onImport }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

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
    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(htmlText, 'text/html');
      
      const tables = doc.querySelectorAll('table');
      if (tables.length === 0) {
        console.log("No tables found in HTML");
        return [];
      }
      
      let targetTable = tables[0];
      for (const table of tables) {
        if (table.querySelectorAll('tr').length > 1) {
          targetTable = table;
          break;
        }
      }
      
      const rows = targetTable.querySelectorAll('tr');
      console.log(`Found ${rows.length} rows in the table`);
      
      if (rows.length <= 1) {
        return [];
      }
      
      return Array.from(rows).slice(1).map(row => {
        const cells = row.querySelectorAll('td');
        
        if (cells.length < 7) {
          console.log(`Row has only ${cells.length} cells, skipping`);
          return null;
        }
        
        let ticket = '', openTime = '', type = '', size = '', symbol = '', openPrice = '', 
            sl = '', tp = '', closeTime = '', closePrice = '', commission = '', swap = '', profit = '';
        
        if (cells.length >= 13) {
          [ticket, openTime, type, size, symbol, openPrice, sl, tp, closeTime, closePrice, commission, swap, profit] = 
            Array.from(cells).map(cell => cell.textContent?.trim() || '');
        } else if (cells.length >= 10) {
          [ticket, openTime, type, size, symbol, openPrice, closeTime, closePrice, commission, profit] = 
            Array.from(cells).map(cell => cell.textContent?.trim() || '');
        } else if (cells.length >= 7) {
          [ticket, openTime, type, size, symbol, openPrice, closePrice] = 
            Array.from(cells).map(cell => cell.textContent?.trim() || '');
          profit = cells[cells.length - 1]?.textContent?.trim() || '0';
        }
        
        const tradeType = type.toLowerCase().includes('buy') || type.toLowerCase().includes('شراء') 
          ? 'Buy' as const 
          : 'Sell' as const;
        
        console.log(`Processing trade: ${symbol} ${tradeType} ${openPrice} -> ${closePrice}`);
        
        if (!symbol || !openPrice) {
          console.log("Missing symbol or price data, skipping row");
          return null;
        }
        
        return {
          pair: symbol,
          type: tradeType,
          entry: parseFloat(openPrice.replace(/,/g, '')) || 0,
          exit: parseFloat(closePrice.replace(/,/g, '')) || 0,
          lotSize: parseFloat(size.replace(/,/g, '')) || 0.01,
          stopLoss: sl ? parseFloat(sl.replace(/,/g, '')) : null,
          takeProfit: tp ? parseFloat(tp.replace(/,/g, '')) : null,
          profitLoss: parseFloat(profit.replace(/,/g, '')) || 0,
          date: tryParseDate(openTime),
          durationMinutes: calculateDuration(openTime, closeTime),
          commission: Math.abs(
            parseFloat(commission?.replace(/,/g, '') || '0') + 
            parseFloat(swap?.replace(/,/g, '') || '0')
          ),
          account: 'Main Trading',
          notes: `Imported from MetaTrader - Ticket: ${ticket}`,
          hashtags: ['imported']
        };
      }).filter(Boolean);
    } catch (error) {
      console.error("Error parsing HTML data:", error);
      return [];
    }
  };

  const tryParseDate = (dateStr: string): string => {
    try {
      let date: Date;
      
      dateStr = dateStr.trim().replace(/\s+/g, ' ');
      
      if (dateStr.includes('/')) {
        const parts = dateStr.split(' ')[0].split('/');
        if (parts.length === 3) {
          date = new Date(`${parts[2]}-${parts[1]}-${parts[0]}`);
        } else {
          date = new Date(dateStr);
        }
      } else {
        date = new Date(dateStr);
      }
      
      if (isNaN(date.getTime())) {
        console.log(`Invalid date format: ${dateStr}, using current date`);
        return new Date().toISOString().split('T')[0];
      }
      
      return date.toISOString().split('T')[0];
    } catch {
      return new Date().toISOString().split('T')[0];
    }
  };

  const calculateDuration = (startDateStr: string, endDateStr: string): number => {
    try {
      const startDate = new Date(startDateStr);
      const endDate = new Date(endDateStr);
      
      if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
        return 0;
      }
      
      return Math.round((endDate.getTime() - startDate.getTime()) / (1000 * 60));
    } catch {
      return 0;
    }
  };

  const convertHTMLToCSV = (htmlContent: string): string => {
    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(htmlContent, 'text/html');
      
      const tables = doc.querySelectorAll('table');
      if (tables.length === 0) {
        console.log("No tables found for CSV conversion");
        return '';
      }
      
      let targetTable = tables[0];
      for (const table of tables) {
        if (table.querySelectorAll('tr').length > 1) {
          targetTable = table;
          break;
        }
      }
      
      const rows = Array.from(targetTable.querySelectorAll('tr'));
      console.log(`Converting ${rows.length} rows to CSV`);
      
      if (rows.length <= 1) {
        return '';
      }
      
      const csvRows = rows.map(row => {
        const cells = Array.from(row.querySelectorAll('td, th'));
        return cells.map(cell => {
          let text = cell.textContent?.trim() || '';
          text = text.replace(/"/g, '""');
          return `"${text}"`;
        }).join(',');
      });
      
      return csvRows.join('\n');
    } catch (error) {
      console.error("Error converting HTML to CSV:", error);
      return '';
    }
  };

  const saveImportedTradesToDB = async (trades: Partial<Trade>[]) => {
    if (!user) {
      toast({
        title: "خطأ في الحفظ",
        description: "يجب تسجيل الدخول لحفظ الصفقات",
        variant: "destructive"
      });
      return [];
    }

    try {
      const savedTrades: Partial<Trade>[] = [];
      const existingTrades = new Set<string>();
      
      const { data: existingTradesData } = await supabase
        .from('trades')
        .select('symbol, entry_price, exit_price, entry_date, direction')
        .eq('user_id', user.id);
      
      if (existingTradesData) {
        existingTradesData.forEach(trade => {
          const tradeKey = `${trade.symbol}-${trade.entry_price}-${trade.exit_price}-${trade.entry_date.split('T')[0]}-${trade.direction}`;
          existingTrades.add(tradeKey);
        });
      }

      const batchSize = 10;
      for (let i = 0; i < trades.length; i += batchSize) {
        const batch = trades.slice(i, i + batchSize);
        const tradesToInsert = [];
        
        for (const trade of batch) {
          if (!trade.pair || !trade.entry || !trade.date) continue;
          
          const tradeType = trade.type === 'Buy' ? 'long' : 'short';
          const tradeKey = `${trade.pair}-${trade.entry}-${trade.exit}-${trade.date}-${tradeType}`;
          
          if (existingTrades.has(tradeKey)) {
            console.log(`Skipping duplicate trade: ${tradeKey}`);
            continue;
          }
          
          tradesToInsert.push({
            user_id: user.id,
            symbol: trade.pair,
            entry_price: trade.entry,
            exit_price: trade.exit || null,
            quantity: trade.lotSize,
            direction: trade.type === 'Buy' ? 'long' : 'short',
            entry_date: new Date(trade.date).toISOString(),
            exit_date: trade.exit ? new Date(trade.date).toISOString() : null,
            profit_loss: trade.profitLoss,
            fees: trade.commission || 0,
            notes: trade.notes,
            tags: trade.hashtags
          });
          
          existingTrades.add(tradeKey);
        }
        
        if (tradesToInsert.length > 0) {
          const { data, error } = await supabase
            .from('trades')
            .insert(tradesToInsert)
            .select();
            
          if (error) {
            console.error('Error inserting trades:', error);
            toast({
              title: "خطأ في الحفظ",
              description: `تم حفظ ${savedTrades.length} صفقة، وفشل البعض: ${error.message}`,
              variant: "destructive"
            });
          } else if (data) {
            const newSavedTrades = data.map(dbTrade => ({
              id: dbTrade.id,
              userId: dbTrade.user_id,
              pair: dbTrade.symbol,
              type: dbTrade.direction === 'long' ? 'Buy' as const : 'Sell' as const,
              entry: dbTrade.entry_price,
              exit: dbTrade.exit_price || 0,
              lotSize: dbTrade.quantity,
              stopLoss: null,
              takeProfit: null,
              profitLoss: dbTrade.profit_loss || 0,
              date: new Date(dbTrade.entry_date).toISOString().split('T')[0],
              durationMinutes: 0,
              commission: dbTrade.fees || 0,
              account: 'Main Trading',
              notes: dbTrade.notes || '',
              hashtags: dbTrade.tags || [],
              riskPercentage: 0,
              returnPercentage: 0,
              imageUrl: null,
              beforeImageUrl: null,
              afterImageUrl: null,
              createdAt: dbTrade.created_at
            }));
            
            savedTrades.push(...newSavedTrades);
          }
        }
      }
      
      return savedTrades;
    } catch (error) {
      console.error('Error saving trades to database:', error);
      toast({
        title: "خطأ في الحفظ",
        description: "حدث خطأ أثناء حفظ الصفقات في قاعدة البيانات",
        variant: "destructive"
      });
      return [];
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setLoading(true);
    const reader = new FileReader();
    reader.onload = async (e) => {
      const content = e.target?.result as string;
      let trades: Partial<Trade>[] = [];

      try {
        console.log(`Processing file: ${file.name}, size: ${file.size} bytes`);
        
        if (file.name.endsWith('.csv')) {
          const results = Papa.parse(content, { header: false });
          trades = results.data.slice(1).map((row: any) => {
            if (!Array.isArray(row) || row.length < 7) return null;
            
            const [ticket, openTime, type, size, symbol, openPrice, sl, tp, closeTime, closePrice, commission, swap, profit] = row;
            
            if (!symbol || !openPrice || !type) return null;
            
            const tradeType = type.toLowerCase().includes('buy') ? 'Buy' as const : 'Sell' as const;
            
            return {
              pair: symbol,
              type: tradeType,
              entry: parseFloat(openPrice.replace(/,/g, '')),
              exit: parseFloat(closePrice?.replace(/,/g, '') || '0'),
              lotSize: parseFloat(size.replace(/,/g, '')),
              stopLoss: sl ? parseFloat(sl.replace(/,/g, '')) : null,
              takeProfit: tp ? parseFloat(tp.replace(/,/g, '')) : null,
              profitLoss: parseFloat(profit?.replace(/,/g, '') || '0'),
              date: tryParseDate(openTime),
              durationMinutes: calculateDuration(openTime, closeTime || ''),
              commission: Math.abs(
                parseFloat(commission?.replace(/,/g, '') || '0') + 
                parseFloat(swap?.replace(/,/g, '') || '0')
              ),
              account: 'Main Trading',
              notes: `Imported from MetaTrader - Ticket: ${ticket}`,
              hashtags: ['imported']
            };
          }).filter(Boolean);
        } else if (file.name.endsWith('.xml')) {
          trades = parseXMLData(content);
        } else if (file.name.endsWith('.html') || file.name.endsWith('.htm')) {
          trades = parseHTMLData(content);
          console.log(`Direct HTML parsing found ${trades.length} trades`);
          
          if (trades.length === 0) {
            console.log("No trades found, trying HTML to CSV conversion");
            const csvContent = convertHTMLToCSV(content);
            
            if (csvContent) {
              console.log("CSV conversion successful, parsing CSV content");
              const results = Papa.parse(csvContent, { header: false });
              
              trades = results.data.slice(1).map((row: any) => {
                if (!Array.isArray(row) || row.length < 7) return null;
                
                let ticket = '', openTime = '', type = '', size = '', symbol = '', openPrice = '', 
                    closePrice = '', profit = '';
                
                if (row.length >= 13) {
                  [ticket, openTime, type, size, symbol, openPrice, , , , closePrice, , , profit] = row;
                } else if (row.length >= 7) {
                  [ticket, openTime, type, size, symbol, openPrice, closePrice] = row;
                  profit = row[row.length - 1] || '0';
                }
                
                if (!symbol || !openPrice || !type) return null;
                
                const tradeType = type.toLowerCase().includes('buy') ? 'Buy' as const : 'Sell' as const;
                
                return {
                  pair: symbol,
                  type: tradeType,
                  entry: parseFloat(openPrice.replace(/,/g, '')),
                  exit: parseFloat(closePrice?.replace(/,/g, '') || '0'),
                  lotSize: parseFloat(size.replace(/,/g, '')) || 0.01,
                  stopLoss: null,
                  takeProfit: null,
                  profitLoss: parseFloat(profit?.replace(/,/g, '') || '0'),
                  date: tryParseDate(openTime),
                  durationMinutes: 0,
                  commission: 0,
                  account: 'Main Trading',
                  notes: `Imported from MetaTrader - Ticket: ${ticket}`,
                  hashtags: ['imported']
                };
              }).filter(Boolean);
              
              console.log(`CSV parsing found ${trades.length} trades`);
            }
          }
        } else {
          throw new Error('صيغة الملف غير مدعومة');
        }

        trades = trades.filter(trade => 
          trade && trade.pair && trade.entry && !isNaN(trade.entry)
        );

        if (trades.length === 0) {
          throw new Error('لم يتم العثور على صفقات صالحة');
        }

        console.log(`Successfully imported ${trades.length} trades`);
        
        const savedTrades = await saveImportedTradesToDB(trades);
        
        if (savedTrades.length > 0) {
          onImport(savedTrades);
          toast({
            title: "تم استيراد الصفقات",
            description: `تم استيراد ${savedTrades.length} صفقة بنجاح من أصل ${trades.length} صفقة`,
          });
        } else if (trades.length > 0 && savedTrades.length === 0) {
          toast({
            title: "تنبيه",
            description: "لم يتم استيراد أي صفقات جديدة، قد تكون الصفقات موجودة مسبقًا",
            variant: "default"
          });
        }
      } catch (error) {
        console.error('Import error:', error);
        toast({
          title: "خطأ في الاستيراد",
          description: "تأكد من تنسيق الملف",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
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
        disabled={loading}
      >
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <FileUp className="h-4 w-4" />
        )}
        {loading ? 'جاري المعالجة...' : 'استيراد من MetaTrader'}
      </Button>
      <div className="text-sm text-muted-foreground">
        قم بتصدير سجل الصفقات من MetaTrader بصيغة CSV, HTML, أو XML وارفعه هنا
      </div>
    </div>
  );
};

export default MetaTraderImport;
