
import React, { useEffect, useRef, useState } from 'react';
import Layout from '@/components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useLanguage } from '@/contexts/LanguageContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { useTrade, Trade } from '@/contexts/TradeContext';
import { useLocation, useNavigate } from 'react-router-dom';
import { Play, Pause, SkipBack, SkipForward, Calendar, RotateCcw, FastForward, X } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { 
  ChartContainer, 
  ChartTooltip, 
  ChartTooltipContent
} from '@/components/ui/chart';
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from '@/lib/utils';

declare global {
  interface Window {
    TradingView: any;
  }
}

type ReplayMode = 'standard' | 'backtest';
type TimeFrame = '1m' | '5m' | '15m' | '30m' | '1h' | '4h' | '1d';

const TradingChart: React.FC = () => {
  const { t } = useLanguage();
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetRef = useRef<any>(null);
  const navigate = useNavigate();
  
  // Chart settings
  const [symbolType, setSymbolType] = useState("forex");
  const [timeFrame, setTimeFrame] = useState<TimeFrame>("15m");
  
  // Replay state
  const [replayMode, setReplayMode] = useState<ReplayMode | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [replaySpeed, setReplaySpeed] = useState(1);
  const [currentPosition, setCurrentPosition] = useState(0); // 0-100 for progress
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  
  // Trade data
  const [currentTrade, setCurrentTrade] = useState<Trade | null>(null);
  const { trades, getTrade } = useTrade();
  const location = useLocation();

  // Initialize the chart and load trade if specified
  useEffect(() => {
    console.log("TradingChart initialized, checking for trade params");
    
    // Check if a trade ID was passed in the URL
    const params = new URLSearchParams(location.search);
    const tradeId = params.get('trade');
    const mode = params.get('mode');
    
    console.log("URL params:", { tradeId, mode });
    
    // Set replay mode based on URL
    if (mode === 'backtest' && tradeId) {
      console.log("Setting mode to backtest");
      setReplayMode('backtest');
    } else if (mode === 'replay') {
      console.log("Setting mode to standard replay");
      setReplayMode('standard');
    }
    
    if (tradeId) {
      const trade = getTrade(tradeId);
      console.log("Found trade:", trade);
      
      if (trade) {
        setCurrentTrade(trade);
        // Set symbol type based on the pair
        if (trade.pair.includes('/USD') || trade.pair.includes('USD/')) {
          setSymbolType('forex');
        } else if (trade.pair.includes('BTC') || trade.pair.includes('ETH')) {
          setSymbolType('crypto');
        }
        
        // Set dates for the trade replay
        setStartDate(trade.date);
        
        // Calculate end date (trade date + duration in minutes)
        const tradeDate = new Date(trade.date);
        const endDate = new Date(tradeDate);
        endDate.setMinutes(endDate.getMinutes() + trade.durationMinutes);
        setEndDate(endDate.toISOString().split('T')[0]);
        
        toast({
          title: t('chart.tradeLoaded') || "تم تحميل الصفقة",
          description: `${trade.pair} - ${trade.type} - ${trade.date}`,
        });
      } else {
        console.error("Trade not found with ID:", tradeId);
        toast({
          title: "خطأ",
          description: "لم يتم العثور على الصفقة المطلوبة",
          variant: "destructive"
        });
      }
    }

    // Load TradingView script
    if (!window.TradingView) {
      console.log("Loading TradingView script");
      const script = document.createElement('script');
      script.src = 'https://s3.tradingview.com/tv.js';
      script.async = true;
      script.onload = () => {
        console.log("TradingView script loaded");
        initWidget();
      };
      document.head.appendChild(script);

      return () => {
        if (script.parentNode) {
          script.parentNode.removeChild(script);
        }
      };
    } else {
      console.log("TradingView already loaded");
      initWidget();
    }

    return () => {
      if (widgetRef.current) {
        try {
          console.log("Cleaning up TradingView widget");
          widgetRef.current = null;
        } catch (e) {
          console.error('Error cleaning up TradingView widget:', e);
        }
      }
    };
  }, [location, getTrade]);

  // Initialize or update the widget when dependencies change
  useEffect(() => {
    console.log("Dependencies changed, reinitializing widget if needed");
    if (window.TradingView && containerRef.current) {
      initWidget();
    }
  }, [symbolType, currentTrade, timeFrame]);

  const initWidget = () => {
    console.log("Initializing TradingView widget");
    if (!window.TradingView || !containerRef.current) {
      console.log("TradingView or container not available yet");
      return;
    }

    // Clean up previous widget if it exists
    if (widgetRef.current) {
      console.log("Cleaning up previous widget");
      containerRef.current.innerHTML = '';
    }

    let symbol = getDefaultSymbol();
    
    // If we have a current trade, use its pair
    if (currentTrade) {
      symbol = convertPairToTradingViewSymbol(currentTrade.pair);
      console.log("Using trade pair for symbol:", symbol);
    }

    // Determine interval based on timeFrame
    const interval = timeFrameToInterval(timeFrame);
    console.log("Using interval:", interval);

    // Create a unique ID for the container
    const containerId = containerRef.current.id || 'tradingview_chart_' + Math.random().toString(36).substring(2, 15);
    containerRef.current.id = containerId;
    
    console.log("Creating widget with container ID:", containerId);

    widgetRef.current = new window.TradingView.widget({
      width: '100%',
      height: 600,
      symbol: symbol,
      interval: interval,
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
      debug: true // Enable debug mode for more console logs
    });

    // Initialize replay mode or backtesting if needed
    if ((replayMode === 'standard' || replayMode === 'backtest') && currentTrade && widgetRef.current) {
      console.log("Setting up trade replay/backtest");
      widgetRef.current.onChartReady(() => {
        try {
          console.log("Chart is ready, displaying trade");
          displayTradeOnChart(currentTrade);
        } catch (error) {
          console.error("Error setting up trade replay:", error);
        }
      });
    }
  };

  const timeFrameToInterval = (tf: TimeFrame): string => {
    switch(tf) {
      case '1m': return '1';
      case '5m': return '5';
      case '15m': return '15';
      case '30m': return '30';
      case '1h': return '60';
      case '4h': return '240';
      case '1d': return 'D';
      default: return '15';
    }
  };

  const displayTradeOnChart = (trade: Trade) => {
    console.log("Displaying trade on chart:", trade);
    if (!widgetRef.current) {
      console.error("Widget not available for displaying trade");
      return;
    }
    
    // This would typically use TradingView's drawing tools API
    widgetRef.current.onChartReady(() => {
      console.log("Chart ready for displaying trade");
      
      // For demonstration, we're simulating the display with a toast
      toast({
        title: t('chart.tradeDisplayed') || "تم عرض الصفقة على الشارت",
        description: t('chart.useControls') || "استخدم أدوات التحكم لمشاهدة الصفقة",
      });
      
      // In a real implementation with TradingView API access you would:
      // 1. Create a vertical line at entry point with color based on trade type
      // 2. Create a vertical line at exit point
      // 3. Add horizontal lines for stop loss and take profit levels
      // 4. Add a label with trade details
      
      // Simulate this by setting replay position to start
      setCurrentPosition(0);
      setIsPlaying(false);
      
      // Example of what would be done with real TradingView API access:
      /*
      const chart = widgetRef.current.chart();
      
      // Convert dates to unix timestamps
      const entryTime = new Date(trade.date).getTime() / 1000;
      
      // Calculate exit time based on duration
      const exitDate = new Date(trade.date);
      exitDate.setMinutes(exitDate.getMinutes() + trade.durationMinutes);
      const exitTime = exitDate.getTime() / 1000;
      
      // Add entry line - green for buy, red for sell
      chart.createShape(
        { time: entryTime, price: trade.entry },
        { shape: 'vertical_line', color: trade.type === 'Buy' ? '#22c55e' : '#ef4444' }
      );
      
      // Add exit line
      chart.createShape(
        { time: exitTime, price: trade.exit },
        { shape: 'vertical_line', color: '#94a3b8' }
      );
      
      // Add stop loss line if available
      if (trade.stopLoss) {
        chart.createShape(
          { time: entryTime, price: trade.stopLoss },
          { shape: 'horizontal_line', color: '#ef4444' }
        );
      }
      
      // Add take profit line if available
      if (trade.takeProfit) {
        chart.createShape(
          { time: entryTime, price: trade.takeProfit },
          { shape: 'horizontal_line', color: '#22c55e' }
        );
      }
      */
    });
  };

  const convertPairToTradingViewSymbol = (pair: string): string => {
    // Convert pairs like "EUR/USD" to TradingView format "FX:EURUSD"
    console.log("Converting pair to TradingView symbol:", pair);
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
    console.log("Getting default symbol for type:", symbolType);
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
    console.log("Changing symbol type to:", type);
    setSymbolType(type);
  };

  const togglePlayPause = () => {
    console.log("Toggling play/pause, current state:", isPlaying);
    setIsPlaying(!isPlaying);
    
    if (!isPlaying) {
      // Start replay animation
      toast({
        title: t('chart.playingReplay') || "تشغيل الإعادة",
        description: t('chart.speedMultiplier') || `سرعة الإعادة: ${replaySpeed}x`,
      });
      
      // Simulate progression with interval
      if (currentPosition >= 100) {
        setCurrentPosition(0);
      }
      
      // In real implementation with TradingView this would control their replay API
      
      // For demo, let's simulate progression
      const interval = setInterval(() => {
        setCurrentPosition(prev => {
          const newPosition = prev + (replaySpeed * 0.5);
          if (newPosition >= 100) {
            clearInterval(interval);
            setIsPlaying(false);
            return 100;
          }
          return newPosition;
        });
      }, 200);
      
      // Store the interval ID to clean it up later
      return () => clearInterval(interval);
    }
  };

  const handleSpeedChange = (value: number[]) => {
    console.log("Changing replay speed to:", value[0]);
    setReplaySpeed(value[0]);
    
    if (isPlaying) {
      toast({
        title: t('chart.speedChanged') || "تم تغيير السرعة",
        description: `${value[0]}x`,
      });
    }
  };

  const skipBackward = () => {
    // Move the replay back (e.g. 10%)
    console.log("Skipping backward");
    setCurrentPosition(Math.max(0, currentPosition - 10));
    toast({
      title: t('chart.skipBackward') || "الرجوع للخلف",
      description: t('chart.movingBackward') || "جاري الرجوع للخلف في الوقت",
    });
  };

  const skipForward = () => {
    // Move the replay forward (e.g. 10%)
    console.log("Skipping forward");
    setCurrentPosition(Math.min(100, currentPosition + 10));
    toast({
      title: t('chart.skipForward') || "التقدم للأمام",
      description: t('chart.movingForward') || "جاري التقدم للأمام في الوقت",
    });
  };

  const jumpToEnd = () => {
    // Jump to end of replay
    console.log("Jumping to end");
    setCurrentPosition(100);
    setIsPlaying(false);
    toast({
      title: t('chart.jumpToEnd') || "الانتقال إلى النهاية",
      description: t('chart.replayComplete') || "اكتملت إعادة التشغيل",
    });
  };

  const restartReplay = () => {
    // Restart replay from beginning
    console.log("Restarting replay");
    setCurrentPosition(0);
    setIsPlaying(false);
    toast({
      title: t('chart.restartReplay') || "إعادة التشغيل من البداية",
      description: t('chart.replayReset') || "تم إعادة تعيين إعادة التشغيل",
    });
  };

  const startStandardReplay = () => {
    console.log("Starting standard replay");
    setReplayMode('standard');
    setCurrentPosition(0);
    setIsPlaying(false);
    
    toast({
      title: t('chart.replayMode') || "وضع إعادة التشغيل",
      description: t('chart.standardReplayStarted') || "تم بدء وضع إعادة التشغيل القياسي",
    });
  };

  const exitReplayMode = () => {
    console.log("Exiting replay mode");
    setReplayMode(null);
    setCurrentTrade(null);
    setIsPlaying(false);
    setCurrentPosition(0);
    navigate('/chart');
  };

  const getTradeDuration = (): string => {
    if (!currentTrade) return "";
    
    const mins = currentTrade.durationMinutes;
    if (mins < 60) {
      return `${mins} ${t('chart.minutes') || 'دقائق'}`;
    } else if (mins < 1440) {
      const hours = Math.floor(mins / 60);
      const remainingMins = mins % 60;
      return `${hours} ${t('chart.hours') || 'ساعات'} ${remainingMins > 0 ? `${remainingMins} ${t('chart.minutes') || 'دقائق'}` : ''}`;
    } else {
      const days = Math.floor(mins / 1440);
      const remainingHours = Math.floor((mins % 1440) / 60);
      return `${days} ${t('chart.days') || 'أيام'} ${remainingHours > 0 ? `${remainingHours} ${t('chart.hours') || 'ساعات'}` : ''}`;
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold tracking-tight">{t('chart.title') || 'الشارت'}</h1>
          
          <div className="flex space-x-2 rtl:space-x-reverse">
            {!replayMode && (
              <Button variant="outline" onClick={startStandardReplay}>
                <RotateCcw className="h-4 w-4 mr-2" />
                {t('chart.startReplay') || 'وضع إعادة التشغيل'}
              </Button>
            )}
            
            {replayMode && (
              <Button variant="outline" onClick={exitReplayMode}>
                <X className="h-4 w-4 mr-2" />
                {t('chart.exitReplay') || 'إنهاء إعادة التشغيل'}
              </Button>
            )}
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>
              {replayMode === 'backtest' 
                ? (t('chart.tradeBacktest') || 'اختبار الصفقة السابقة') 
                : replayMode === 'standard'
                  ? (t('chart.replayMode') || 'وضع إعادة التشغيل')
                  : (t('chart.tradingViewChart') || 'مخطط التداول')
              }
            </CardTitle>
            <CardDescription>
              {replayMode && currentTrade 
                ? `${currentTrade.pair} - ${currentTrade.type} - ${currentTrade.date}` 
                : (t('chart.description') || 'استخدم مخطط TradingView للتحليل الفني وتتبع الأسواق المالية')}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Symbol & Timeframe Selection (when not in replay mode) */}
            {!replayMode && (
              <div className="space-y-4">
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
                
                <div className="flex flex-wrap gap-2">
                  <Select value={timeFrame} onValueChange={(v) => setTimeFrame(v as TimeFrame)}>
                    <SelectTrigger className="w-32">
                      <SelectValue placeholder={t('chart.timeframe') || 'الإطار الزمني'} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1m">1 {t('chart.minute') || 'دقيقة'}</SelectItem>
                      <SelectItem value="5m">5 {t('chart.minutes') || 'دقائق'}</SelectItem>
                      <SelectItem value="15m">15 {t('chart.minutes') || 'دقيقة'}</SelectItem>
                      <SelectItem value="30m">30 {t('chart.minutes') || 'دقيقة'}</SelectItem>
                      <SelectItem value="1h">1 {t('chart.hour') || 'ساعة'}</SelectItem>
                      <SelectItem value="4h">4 {t('chart.hours') || 'ساعات'}</SelectItem>
                      <SelectItem value="1d">1 {t('chart.day') || 'يوم'}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}
            
            {/* Replay Date Range Selector (for standard replay) */}
            {replayMode === 'standard' && (
              <div className="flex flex-wrap gap-4 mb-4">
                <div className="space-y-1 flex-1">
                  <label className="text-sm font-medium" htmlFor="startDate">
                    {t('chart.startDate') || 'تاريخ البدء'}
                  </label>
                  <Input
                    id="startDate"
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                </div>
                <div className="space-y-1 flex-1">
                  <label className="text-sm font-medium" htmlFor="endDate">
                    {t('chart.endDate') || 'تاريخ الانتهاء'}
                  </label>
                  <Input
                    id="endDate" 
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                  />
                </div>
                <div className="space-y-1 flex-1">
                  <label className="text-sm font-medium">
                    {t('chart.timeframe') || 'الإطار الزمني'}
                  </label>
                  <Select value={timeFrame} onValueChange={(v) => setTimeFrame(v as TimeFrame)}>
                    <SelectTrigger>
                      <SelectValue placeholder={t('chart.selectTimeframe') || 'اختر الإطار الزمني'} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1m">1 {t('chart.minute') || 'دقيقة'}</SelectItem>
                      <SelectItem value="5m">5 {t('chart.minutes') || 'دقائق'}</SelectItem>
                      <SelectItem value="15m">15 {t('chart.minutes') || 'دقيقة'}</SelectItem>
                      <SelectItem value="30m">30 {t('chart.minutes') || 'دقيقة'}</SelectItem>
                      <SelectItem value="1h">1 {t('chart.hour') || 'ساعة'}</SelectItem>
                      <SelectItem value="4h">4 {t('chart.hours') || 'ساعات'}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}
            
            {/* Replay Controls */}
            {replayMode && (
              <div className="mb-4 space-y-4 p-4 border rounded-lg bg-muted/20">
                {/* Progress Bar */}
                <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700 overflow-hidden">
                  <div 
                    className="bg-primary h-2.5 rounded-full transition-all duration-300 ease-in-out" 
                    style={{ width: `${currentPosition}%` }}
                  ></div>
                </div>
                
                {/* Playback Controls */}
                <div className="flex items-center justify-center space-x-2 rtl:space-x-reverse">
                  <Button variant="outline" size="icon" onClick={restartReplay} title={t('chart.restart') || 'إعادة البدء'}>
                    <RotateCcw className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="icon" onClick={skipBackward} title={t('chart.skipBackward') || 'الرجوع للخلف'}>
                    <SkipBack className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="outline" 
                    size="icon" 
                    onClick={togglePlayPause}
                    title={isPlaying ? (t('chart.pause') || 'إيقاف مؤقت') : (t('chart.play') || 'تشغيل')}
                  >
                    {isPlaying ? (
                      <Pause className="h-4 w-4" />
                    ) : (
                      <Play className="h-4 w-4" />
                    )}
                  </Button>
                  <Button variant="outline" size="icon" onClick={skipForward} title={t('chart.skipForward') || 'التقدم للأمام'}>
                    <SkipForward className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="icon" onClick={jumpToEnd} title={t('chart.jumpToEnd') || 'الانتقال إلى النهاية'}>
                    <FastForward className="h-4 w-4" />
                  </Button>
                </div>
                
                {/* Speed Control */}
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
                
                {/* Trade Details (for backtest mode) */}
                {replayMode === 'backtest' && currentTrade && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 p-3 bg-card rounded-lg mt-2">
                    <div>
                      <span className="text-muted-foreground text-xs block mb-1">{t('trade.type') || 'نوع الصفقة'}</span>
                      <div className={cn(
                        "flex items-center font-medium",
                        currentTrade.type === 'Buy' ? "text-green-500" : "text-red-500"
                      )}>
                        {currentTrade.type}
                      </div>
                    </div>
                    <div>
                      <span className="text-muted-foreground text-xs block mb-1">{t('trade.entry') || 'نقطة الدخول'}</span>
                      <div className="font-medium">{currentTrade.entry}</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground text-xs block mb-1">{t('trade.exit') || 'نقطة الخروج'}</span>
                      <div className="font-medium">{currentTrade.exit}</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground text-xs block mb-1">{t('trade.profitLoss') || 'الربح/الخسارة'}</span>
                      <div className={cn(
                        "font-medium",
                        currentTrade.profitLoss > 0 ? "text-green-500" : "text-red-500"
                      )}>
                        {currentTrade.profitLoss > 0 ? '+' : ''}{currentTrade.profitLoss.toFixed(2)}
                      </div>
                    </div>
                    <div>
                      <span className="text-muted-foreground text-xs block mb-1">{t('trade.stopLoss') || 'وقف الخسارة'}</span>
                      <div className="font-medium">{currentTrade.stopLoss || '-'}</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground text-xs block mb-1">{t('trade.takeProfit') || 'جني الأرباح'}</span>
                      <div className="font-medium">{currentTrade.takeProfit || '-'}</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground text-xs block mb-1">{t('trade.duration') || 'المدة'}</span>
                      <div className="font-medium">{getTradeDuration()}</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground text-xs block mb-1">{t('trade.date') || 'التاريخ'}</span>
                      <div className="font-medium">{currentTrade.date}</div>
                    </div>
                  </div>
                )}
              </div>
            )}
            
            {/* Chart */}
            <div id="tradingview_chart" ref={containerRef} className="w-full rounded-lg overflow-hidden border border-border" />
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default TradingChart;
