import React, { useEffect, useRef } from 'react';
import { Helmet } from 'react-helmet';
import Layout from '@/components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useLanguage } from '@/contexts/LanguageContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from '@/components/ui/button';

declare global {
  interface Window {
    TradingView: any;
  }
}

const TradingChart: React.FC = () => {
  const { t } = useLanguage();
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetRef = useRef<any>(null);
  const [symbolType, setSymbolType] = React.useState("forex");

  useEffect(() => {
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
  }, []);

  useEffect(() => {
    if (window.TradingView && containerRef.current) {
      initWidget();
    }
  }, [symbolType]);

  const initWidget = () => {
    if (!window.TradingView || !containerRef.current) return;

    // Clean up previous widget if it exists
    if (widgetRef.current) {
      containerRef.current.innerHTML = '';
    }

    const defaultSymbol = getDefaultSymbol();

    widgetRef.current = new window.TradingView.widget({
      width: '100%',
      height: 600,
      symbol: defaultSymbol,
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
      <Helmet>
        <title>{t('chart.title') || 'الشارت'} | {t('nav.platform')}</title>
      </Helmet>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold tracking-tight">{t('chart.title') || 'الشارت'}</h1>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>{t('chart.tradingViewChart') || 'مخطط التداول'}</CardTitle>
            <CardDescription>
              {t('chart.description') || 'استخدم مخطط TradingView للتحليل الفني وتتبع الأسواق المالية'}
            </CardDescription>
          </CardHeader>
          <CardContent>
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
            <div id="tradingview_chart" ref={containerRef} className="w-full rounded-lg overflow-hidden border border-border" />
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default TradingChart;
