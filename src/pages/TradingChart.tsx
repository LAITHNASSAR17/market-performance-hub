
import React, { useEffect, useRef, useState } from 'react';
import Layout from '@/components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useLanguage } from '@/contexts/LanguageContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { useTrade, Trade } from '@/contexts/TradeContext';
import { useLocation } from 'react-router-dom';
import { Play, Pause, SkipBack, SkipForward, Calendar } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';

declare global {
  interface Window {
    TradingView: any;
  }
}

const TradingChart: React.FC = () => {
  const { t } = useLanguage();
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetRef = useRef<any>(null);
  const [symbolType, setSymbolType] = useState("forex");
  const [replayMode, setReplayMode] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [replaySpeed, setReplaySpeed] = useState(1);
  const [currentTrade, setCurrentTrade] = useState<Trade | null>(null);
  const { trades, getTrade } = useTrade();
  const location = useLocation();

  useEffect(() => {
    // Check if a trade ID was passed in the URL
    const params = new URLSearchParams(location.search);
    const tradeId = params.get('trade');
    
    if (tradeId) {
      const trade = getTrade(tradeId);
      if (trade) {
        setCurrentTrade(trade);
        // Set symbol type based on the pair
        if (trade.pair.includes('/USD') || trade.pair.includes('USD/')) {
          setSymbolType('forex');
        } else if (trade.pair.includes('BTC') || trade.pair.includes('ETH')) {
          setSymbolType('crypto');
        }
        
        // Enable replay mode
        setReplayMode(true);
        
        toast({
          title: t('chart.tradeLoaded') || "تم تحميل الصفقة",
          description: `${trade.pair} - ${trade.type} - ${trade.date}`,
        });
      }
    }

    const script = document.createElement('script');
    script.src = 'https://s3.tradingview.com/tv.js';
    script.async = true;
    script.onload = initWidget;
    document.head.appendChild(script);

    return () => {
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
      if (widgetRef.current) {
        // Clean up isn't typically required, but good practice
        try {
          widgetRef.current = null;
        } catch (e) {
          console.error('Error cleaning up TradingView widget:', e);
        }
      }
    };
  }, [location, getTrade]);

  useEffect(() => {
    if (window.TradingView && containerRef.current) {
      initWidget();
    }
  }, [symbolType, currentTrade]);

  const initWidget = () => {
    if (!window.TradingView || !containerRef.current) return;

    // Clean up previous widget if it exists
    if (widgetRef.current) {
      containerRef.current.innerHTML = '';
    }

    let symbol = getDefaultSymbol();
    
    // If we have a current trade, use its pair
    if (currentTrade) {
      symbol = convertPairToTradingViewSymbol(currentTrade.pair);
    }

    widgetRef.current = new window.TradingView.widget({
      width: '100%',
      height: 600,
      symbol: symbol,
      interval: 'D',
      timezone: 'Etc/UTC',
      theme: 'dark',
      style: '1',
      locale: 'ar',
      toolbar_bg: '#f1f3f6',
      enable_publishing: false,
      withdateranges: true,
      hide_side_toolbar: false,
      allow_symbol_change: true,
      details: true,
      hotlist: true,
      calendar: true,
      studies: [
        'MASimple@tv-basicstudies',
        'RSI@tv-basicstudies',
        'MACD@tv-basicstudies'
      ],
      container_id: containerRef.current.id,
    });

    // If in replay mode and we have a trade, initialize the chart with the trade date
    if (replayMode && currentTrade && widgetRef.current) {
      // TradingView widget doesn't expose a direct API to set the time, 
      // but we can attempt to navigate to the specific date once the widget is loaded
      widgetRef.current.onChartReady(() => {
        try {
          // This is a workaround - actual implementation would depend on TradingView's API
          const tradeDate = new Date(currentTrade.date);
          console.log("Setting chart to trade date:", tradeDate);
          
          // Display trade entry/exit on the chart
          displayTradeOnChart(currentTrade);
        } catch (error) {
          console.error("Error setting up trade replay:", error);
        }
      });
    }
  };

  const displayTradeOnChart = (trade: Trade) => {
    if (!widgetRef.current) return;
    
    // This would typically involve using TradingView's drawing tools API
    // to add markers for entry, exit, SL, TP points
    widgetRef.current.onChartReady(() => {
      console.log("Displaying trade on chart:", trade);
      // In a real implementation, we would use TradingView's API to:
      // 1. Create shapes for entry/exit points
      // 2. Add lines for stop loss and take profit levels
      // 3. Add annotations for trade details
      
      toast({
        title: t('chart.tradeDisplayed') || "تم عرض الصفقة على الشارت",
        description: t('chart.useControls') || "استخدم أدوات التحكم لمشاهدة الصفقة",
      });
    });
  };

  const convertPairToTradingViewSymbol = (pair: string): string => {
    // Convert pairs like "EUR/USD" to TradingView format "FX:EURUSD"
    if (pair.includes('/')) {
      if (pair.startsWith('BTC') || pair.startsWith('ETH')) {
        return `BINANCE:${pair.replace('/', '')}`;
      } else {
        return `FX:${pair.replace('/', '')}`;
      }
    }
    return pair;
  };

  const getDefaultSymbol = () => {
    switch(symbolType) {
      case 'crypto':
        return 'BINANCE:BTCUSDT';
      case 'stock':
        return 'NASDAQ:AAPL';
      case 'index':
        return 'FOREXCOM:SPXUSD';
      case 'forex':
      default:
        return 'FX:EURUSD';
    }
  };

  const changeSymbolType = (type: string) => {
    setSymbolType(type);
  };

  const togglePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const handleSpeedChange = (value: number[]) => {
    setReplaySpeed(value[0]);
  };

  const skipBackward = () => {
    console.log("Skip backward");
    // Implementation would depend on TradingView's API
    toast({
      title: t('chart.skipBackward') || "الرجوع للخلف",
      description: t('chart.movingBackward') || "جاري الرجوع للخلف في الوقت",
    });
  };

  const skipForward = () => {
    console.log("Skip forward");
    // Implementation would depend on TradingView's API
    toast({
      title: t('chart.skipForward') || "التقدم للأمام",
      description: t('chart.movingForward') || "جاري التقدم للأمام في الوقت",
    });
  };

  const exitReplayMode = () => {
    setReplayMode(false);
    setCurrentTrade(null);
    setIsPlaying(false);
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold tracking-tight">{t('chart.title') || 'الشارت'}</h1>
          {replayMode && (
            <Button variant="outline" onClick={exitReplayMode}>
              {t('chart.exitReplay') || 'إنهاء إعادة التشغيل'}
            </Button>
          )}
        </div>

        <Card>
          <CardHeader>
            <CardTitle>{replayMode ? (t('chart.tradeReplay') || 'إعادة تشغيل الصفقة') : (t('chart.tradingViewChart') || 'مخطط التداول')}</CardTitle>
            <CardDescription>
              {replayMode 
                ? (currentTrade ? `${currentTrade.pair} - ${currentTrade.type} - ${currentTrade.date}` : '') 
                : (t('chart.description') || 'استخدم مخطط TradingView للتحليل الفني وتتبع الأسواق المالية')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!replayMode && (
              <div className="mb-4 flex flex-wrap gap-2">
                <Button 
                  variant={symbolType === 'forex' ? 'default' : 'outline'} 
                  onClick={() => changeSymbolType('forex')}
                >
                  {t('chart.forex') || 'العملات'}
                </Button>
                <Button 
                  variant={symbolType === 'crypto' ? 'default' : 'outline'} 
                  onClick={() => changeSymbolType('crypto')}
                >
                  {t('chart.crypto') || 'العملات الرقمية'}
                </Button>
                <Button 
                  variant={symbolType === 'stock' ? 'default' : 'outline'} 
                  onClick={() => changeSymbolType('stock')}
                >
                  {t('chart.stocks') || 'الأسهم'}
                </Button>
                <Button 
                  variant={symbolType === 'index' ? 'default' : 'outline'} 
                  onClick={() => changeSymbolType('index')}
                >
                  {t('chart.indices') || 'المؤشرات'}
                </Button>
              </div>
            )}
            
            {replayMode && (
              <div className="mb-4 space-y-4">
                <div className="flex items-center justify-center space-x-2 rtl:space-x-reverse">
                  <Button variant="outline" size="icon" onClick={skipBackward}>
                    <SkipBack className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="icon" onClick={togglePlayPause}>
                    {isPlaying ? (
                      <Pause className="h-4 w-4" />
                    ) : (
                      <Play className="h-4 w-4" />
                    )}
                  </Button>
                  <Button variant="outline" size="icon" onClick={skipForward}>
                    <SkipForward className="h-4 w-4" />
                  </Button>
                </div>
                
                <div className="flex items-center space-x-4 rtl:space-x-reverse">
                  <span className="text-sm">{t('chart.speed') || 'السرعة'}:</span>
                  <Slider
                    defaultValue={[1]}
                    max={5}
                    min={0.25}
                    step={0.25}
                    value={[replaySpeed]}
                    onValueChange={handleSpeedChange}
                    className="w-[200px]"
                  />
                  <span className="text-sm">x{replaySpeed}</span>
                </div>
                
                {currentTrade && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                    <div>
                      <span className="font-medium">{t('trade.entry') || 'نقطة الدخول'}:</span> {currentTrade.entry}
                    </div>
                    <div>
                      <span className="font-medium">{t('trade.exit') || 'نقطة الخروج'}:</span> {currentTrade.exit}
                    </div>
                    <div>
                      <span className="font-medium">{t('trade.stopLoss') || 'وقف الخسارة'}:</span> {currentTrade.stopLoss || '-'}
                    </div>
                    <div>
                      <span className="font-medium">{t('trade.takeProfit') || 'جني الأرباح'}:</span> {currentTrade.takeProfit || '-'}
                    </div>
                  </div>
                )}
              </div>
            )}
            
            <div id="tradingview_chart" ref={containerRef} className="w-full rounded-lg overflow-hidden border border-border" />
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default TradingChart;
