
import React, { useEffect, useRef, useState } from 'react';
import Layout from '@/components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTrade, Trade } from '@/contexts/TradeContext';
import { useLocation, useNavigate } from 'react-router-dom';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
  const navigate = useNavigate();
  const [containerHeight, setContainerHeight] = useState(600); // Default height
  
  // Chart settings
  const [symbolType, setSymbolType] = useState("forex");
  const [currentTrade, setCurrentTrade] = useState<Trade | null>(null);
  const { trades, getTrade } = useTrade();
  const location = useLocation();

  // Initialize the chart and load trade if specified
  useEffect(() => {
    console.log("TradingChart initialized, checking for trade params");
    
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
        
        toast({
          title: t('chart.tradeLoaded') || "تم تحميل الصفقة",
          description: `${trade.pair} - ${trade.type} - ${trade.date}`,
        });
      } else {
        toast({
          title: "خطأ",
          description: "لم يتم العثور على الصفقة المطلوبة",
          variant: "destructive"
        });
      }
    }

    // Calculate container height based on viewport
    updateContainerHeight();
    
    // Add resize event listener
    window.addEventListener('resize', updateContainerHeight);

    // Load TradingView script
    if (!window.TradingView) {
      const script = document.createElement('script');
      script.src = 'https://s3.tradingview.com/tv.js';
      script.async = true;
      script.onload = () => {
        initWidget();
      };
      document.head.appendChild(script);

      return () => {
        if (script.parentNode) {
          script.parentNode.removeChild(script);
        }
      };
    } else {
      initWidget();
    }

    return () => {
      window.removeEventListener('resize', updateContainerHeight);
      if (widgetRef.current) {
        try {
          widgetRef.current = null;
        } catch (e) {
          console.error('Error cleaning up TradingView widget:', e);
        }
      }
    };
  }, [location, getTrade]);

  // Calculate container height based on viewport
  const updateContainerHeight = () => {
    if (typeof window !== 'undefined') {
      // Calculate available height (viewport height minus header, padding, and other elements)
      const viewportHeight = window.innerHeight;
      const headerHeight = 150; // Approximate height of header and top elements
      const padding = 100; // Additional padding
      const newHeight = Math.max(400, viewportHeight - headerHeight - padding);
      setContainerHeight(newHeight);
      
      // If widget already exists, update its height
      if (widgetRef.current && containerRef.current) {
        containerRef.current.style.height = `${newHeight}px`;
        if (widgetRef.current.iframe) {
          widgetRef.current.iframe.style.height = `${newHeight}px`;
        }
      }
    }
  };

  // Initialize or update the widget when dependencies change
  useEffect(() => {
    if (window.TradingView && containerRef.current) {
      initWidget();
    }
  }, [symbolType, currentTrade, containerHeight]);

  const initWidget = () => {
    if (!window.TradingView || !containerRef.current) {
      return;
    }

    // Clean up previous widget if it exists
    if (widgetRef.current) {
      containerRef.current.innerHTML = '';
    }

    let symbol = getDefaultSymbol();
    
    // If we have a current trade, use its pair
    if (currentTrade) {
      symbol = convertPairToTradingViewSymbol(currentTrade.pair);
    }

    // Create a unique ID for the container
    const containerId = containerRef.current.id || 'tradingview_chart_' + Math.random().toString(36).substring(2, 15);
    containerRef.current.id = containerId;
    
    // Configure the widget settings
    const widgetOptions = {
      width: '100%',
      height: containerHeight,
      symbol: symbol,
      interval: 'D', // Default to daily
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
      container_id: containerId,
      debug: false
    };
    
    // Create the widget
    widgetRef.current = new window.TradingView.widget(widgetOptions);

    // Initialize replay mode or backtesting if needed
    if (currentTrade && widgetRef.current) {
      widgetRef.current.onChartReady(() => {
        try {
          displayTradeOnChart(currentTrade);
        } catch (error) {
          console.error("Error setting up trade display:", error);
        }
      });
    }
  };

  const displayTradeOnChart = (trade: Trade) => {
    if (!widgetRef.current) {
      return;
    }
    
    widgetRef.current.onChartReady(() => {
      toast({
        title: t('chart.tradeDisplayed') || "تم عرض الصفقة على الشارت",
        description: t('chart.useControls') || "استخدم أدوات التحكم لمشاهدة الصفقة",
      });
    });
  };

  const convertPairToTradingViewSymbol = (pair: string): string => {
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

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold tracking-tight">{t('chart.title') || 'الشارت'}</h1>
        </div>

        <Card className="overflow-hidden">
          <CardHeader>
            <CardTitle>
              {t('chart.tradingViewChart') || 'مخطط التداول'}
            </CardTitle>
            <CardDescription>
              {currentTrade 
                ? `${currentTrade.pair} - ${currentTrade.type} - ${currentTrade.date}` 
                : (t('chart.description') || 'استخدم مخطط TradingView للتحليل الفني وتتبع الأسواق المالية')}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 p-0">
            {/* Chart Symbol Type Selection */}
            <div className="p-4 border-b">
              <div className="mb-4 flex flex-wrap gap-2">
                <Select 
                  value={symbolType} 
                  onValueChange={changeSymbolType}
                >
                  <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder={t('chart.selectSymbolType') || 'اختر نوع الرمز'} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="forex">{t('chart.forex') || 'العملات'}</SelectItem>
                    <SelectItem value="crypto">{t('chart.crypto') || 'العملات الرقمية'}</SelectItem>
                    <SelectItem value="stock">{t('chart.stocks') || 'الأسهم'}</SelectItem>
                    <SelectItem value="index">{t('chart.indices') || 'المؤشرات'}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            {/* Chart */}
            <div 
              id="tradingview_chart" 
              ref={containerRef} 
              style={{ height: `${containerHeight}px` }}
              className="w-full" 
            />
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default TradingChart;
