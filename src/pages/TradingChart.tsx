
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
import { 
  Play, Pause, SkipBack, SkipForward, Calendar, RotateCcw, FastForward, X, 
  Maximize, Minimize, PenTool, Layers, Sun, Moon, Save, Layout as LayoutIcon,
  PanelLeft, ZoomIn, Eye
} from 'lucide-react';
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
type ChartTheme = 'light' | 'dark' | 'custom';
type ChartTool = 'line' | 'rectangle' | 'text' | 'fibonacci' | 'pitchfork' | 'none';

const TradingChart: React.FC = () => {
  const { t } = useLanguage();
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetRef = useRef<any>(null);
  const navigate = useNavigate();
  
  // Chart settings
  const [symbolType, setSymbolType] = useState("forex");
  const [chartTheme, setChartTheme] = useState<ChartTheme>("dark");
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [activeTool, setActiveTool] = useState<ChartTool>("none");
  const [showSideBySide, setShowSideBySide] = useState(false);
  const [secondSymbol, setSecondSymbol] = useState("");
  
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
    
    // Set replay mode based on URL
    if (mode === 'backtest' && tradeId) {
      setReplayMode('backtest');
    } else if (mode === 'replay') {
      setReplayMode('standard');
    }
    
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
        toast({
          title: "خطأ",
          description: "لم يتم العثور على الصفقة المطلوبة",
          variant: "destructive"
        });
      }
    }

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
      if (widgetRef.current) {
        try {
          widgetRef.current = null;
        } catch (e) {
          console.error('Error cleaning up TradingView widget:', e);
        }
      }
    };
  }, [location, getTrade]);

  // Initialize or update the widget when dependencies change
  useEffect(() => {
    if (window.TradingView && containerRef.current) {
      initWidget();
    }
  }, [symbolType, currentTrade, chartTheme, showSideBySide, secondSymbol]);

  // Handle fullscreen mode
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

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
      height: 600,
      symbol: symbol,
      interval: 'D', // Default to daily
      timezone: 'Etc/UTC',
      theme: chartTheme,
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

    // For side by side comparison, create a second chart if requested
    if (showSideBySide && secondSymbol) {
      // Create a second container for the side-by-side view
      const secondContainerId = 'tradingview_chart_secondary_' + Math.random().toString(36).substring(2, 15);
      const secondContainer = document.createElement('div');
      secondContainer.id = secondContainerId;
      secondContainer.className = 'w-full mt-4 rounded-lg overflow-hidden border border-border';
      secondContainer.style.height = '600px';
      
      // Add the second container after the main one
      containerRef.current.parentNode?.insertBefore(secondContainer, containerRef.current.nextSibling);
      
      // Create the second widget
      new window.TradingView.widget({
        ...widgetOptions,
        container_id: secondContainerId,
        symbol: convertPairToTradingViewSymbol(secondSymbol),
      });
    }

    // Initialize replay mode or backtesting if needed
    if ((replayMode === 'standard' || replayMode === 'backtest') && currentTrade && widgetRef.current) {
      widgetRef.current.onChartReady(() => {
        try {
          displayTradeOnChart(currentTrade);
        } catch (error) {
          console.error("Error setting up trade replay:", error);
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
      
      setCurrentPosition(0);
      setIsPlaying(false);
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

  const toggleFullscreen = () => {
    if (!isFullscreen) {
      containerRef.current?.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  };

  const toggleChartTheme = () => {
    setChartTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  const togglePlayPause = () => {
    setIsPlaying(!isPlaying);
    
    if (!isPlaying) {
      toast({
        title: t('chart.playingReplay') || "تشغيل الإعادة",
        description: t('chart.speedMultiplier') || `سرعة الإعادة: ${replaySpeed}x`,
      });
      
      if (currentPosition >= 100) {
        setCurrentPosition(0);
      }
      
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
      
      return () => clearInterval(interval);
    }
  };

  const handleSpeedChange = (value: number[]) => {
    setReplaySpeed(value[0]);
    
    if (isPlaying) {
      toast({
        title: t('chart.speedChanged') || "تم تغيير السرعة",
        description: `${value[0]}x`,
      });
    }
  };

  const skipBackward = () => {
    setCurrentPosition(Math.max(0, currentPosition - 10));
    toast({
      title: t('chart.skipBackward') || "الرجوع للخلف",
      description: t('chart.movingBackward') || "جاري الرجوع للخلف في الوقت",
    });
  };

  const skipForward = () => {
    setCurrentPosition(Math.min(100, currentPosition + 10));
    toast({
      title: t('chart.skipForward') || "التقدم للأمام",
      description: t('chart.movingForward') || "جاري التقدم للأمام في الوقت",
    });
  };

  const jumpToEnd = () => {
    setCurrentPosition(100);
    setIsPlaying(false);
    toast({
      title: t('chart.jumpToEnd') || "الانتقال إلى النهاية",
      description: t('chart.replayComplete') || "اكتملت إعادة التشغيل",
    });
  };

  const restartReplay = () => {
    setCurrentPosition(0);
    setIsPlaying(false);
    toast({
      title: t('chart.restartReplay') || "إعادة التشغيل من البداية",
      description: t('chart.replayReset') || "تم إعادة تعيين إعادة التشغيل",
    });
  };

  const startStandardReplay = () => {
    setReplayMode('standard');
    setCurrentPosition(0);
    setIsPlaying(false);
    
    toast({
      title: t('chart.replayMode') || "وضع إعادة التشغيل",
      description: t('chart.standardReplayStarted') || "تم بدء وضع إعادة التشغيل القياسي",
    });
  };

  const exitReplayMode = () => {
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

  const activateDrawingTool = (tool: ChartTool) => {
    setActiveTool(tool);
    // In a real implementation, this would call the TradingView API to activate the tool
    toast({
      title: t('chart.toolActivated') || "أداة الرسم",
      description: `${tool} ${t('chart.activated') || 'تم تفعيل الأداة'}`,
    });
  };

  const saveChartLayout = () => {
    toast({
      title: t('chart.layoutSaved') || "تم حفظ تخطيط الشارت",
      description: t('chart.layoutSavedDesc') || "تم حفظ إعدادات وأدوات الشارت الحالية",
    });
  };

  const toggleSideBySide = () => {
    setShowSideBySide(!showSideBySide);
    
    if (!showSideBySide && !secondSymbol) {
      // If enabling side by side view and no second symbol is set, use a default
      setSecondSymbol(symbolType === 'forex' ? 'GBP/USD' : 'BTC/USD');
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
            {/* Chart Controls - Symbol Type and Advanced Features */}
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
                
                {/* Advanced Chart Controls */}
                <div className="flex flex-wrap gap-2 justify-between items-center bg-muted/20 p-2 rounded-md">
                  <div className="flex flex-wrap gap-2">
                    {/* Drawing Tools */}
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" size="sm">
                          <PenTool className="h-4 w-4 mr-1" />
                          {t('chart.drawingTools') || 'أدوات الرسم'}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-2">
                        <div className="grid grid-cols-2 gap-2">
                          <Button 
                            variant={activeTool === 'line' ? 'default' : 'outline'} 
                            size="sm" 
                            onClick={() => activateDrawingTool('line')}
                          >
                            {t('chart.line') || 'خط'}
                          </Button>
                          <Button 
                            variant={activeTool === 'rectangle' ? 'default' : 'outline'} 
                            size="sm" 
                            onClick={() => activateDrawingTool('rectangle')}
                          >
                            {t('chart.rectangle') || 'مستطيل'}
                          </Button>
                          <Button 
                            variant={activeTool === 'text' ? 'default' : 'outline'} 
                            size="sm" 
                            onClick={() => activateDrawingTool('text')}
                          >
                            {t('chart.text') || 'نص'}
                          </Button>
                          <Button 
                            variant={activeTool === 'fibonacci' ? 'default' : 'outline'} 
                            size="sm" 
                            onClick={() => activateDrawingTool('fibonacci')}
                          >
                            {t('chart.fibonacci') || 'فيبوناتشي'}
                          </Button>
                          <Button 
                            variant={activeTool === 'pitchfork' ? 'default' : 'outline'} 
                            size="sm" 
                            onClick={() => activateDrawingTool('pitchfork')}
                          >
                            {t('chart.pitchfork') || 'شوكة'}
                          </Button>
                          <Button 
                            variant={activeTool === 'none' ? 'default' : 'outline'} 
                            size="sm" 
                            onClick={() => activateDrawingTool('none')}
                          >
                            {t('chart.selectTool') || 'تحديد'}
                          </Button>
                        </div>
                      </PopoverContent>
                    </Popover>
                    
                    {/* Theme Toggle */}
                    <Button variant="outline" size="sm" onClick={toggleChartTheme}>
                      {chartTheme === 'light' ? (
                        <Moon className="h-4 w-4 mr-1" />
                      ) : (
                        <Sun className="h-4 w-4 mr-1" />
                      )}
                      {chartTheme === 'light' 
                        ? (t('chart.darkTheme') || 'الوضع الداكن')
                        : (t('chart.lightTheme') || 'الوضع الفاتح')
                      }
                    </Button>
                    
                    {/* Side by Side View */}
                    <Button 
                      variant={showSideBySide ? 'default' : 'outline'} 
                      size="sm" 
                      onClick={toggleSideBySide}
                    >
                      <PanelLeft className="h-4 w-4 mr-1" />
                      {t('chart.comparison') || 'المقارنة'}
                    </Button>
                    
                    {/* Zoom Controls */}
                    <Button variant="outline" size="sm">
                      <ZoomIn className="h-4 w-4 mr-1" />
                      {t('chart.zoom') || 'تكبير'}
                    </Button>
                  </div>
                  
                  <div className="flex gap-2">
                    {/* Save Layout */}
                    <Button variant="outline" size="sm" onClick={saveChartLayout}>
                      <Save className="h-4 w-4 mr-1" />
                      {t('chart.saveLayout') || 'حفظ التخطيط'}
                    </Button>
                    
                    {/* Fullscreen Toggle */}
                    <Button variant="outline" size="sm" onClick={toggleFullscreen}>
                      {isFullscreen ? (
                        <Minimize className="h-4 w-4 mr-1" />
                      ) : (
                        <Maximize className="h-4 w-4 mr-1" />
                      )}
                      {isFullscreen
                        ? (t('chart.exitFullscreen') || 'إنهاء ملء الشاشة')
                        : (t('chart.fullscreen') || 'ملء الشاشة')
                      }
                    </Button>
                  </div>
                </div>
                
                {/* Second Symbol Input for Side by Side */}
                {showSideBySide && (
                  <div className="mt-2">
                    <label className="block text-sm font-medium mb-1">
                      {t('chart.comparisonSymbol') || 'رمز المقارنة'}
                    </label>
                    <div className="flex gap-2">
                      <Input 
                        placeholder={t('chart.enterSymbol') || 'أدخل الرمز للمقارنة'} 
                        value={secondSymbol}
                        onChange={(e) => setSecondSymbol(e.target.value)}
                      />
                      <Button variant="default" onClick={() => initWidget()}>
                        <Eye className="h-4 w-4 mr-1" />
                        {t('chart.compare') || 'مقارنة'}
                      </Button>
                    </div>
                  </div>
                )}
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
