
import React, { useEffect, useRef } from 'react';
import Layout from '@/components/Layout';
import { Card, CardContent } from '@/components/ui/card';

declare global {
  interface Window {
    TradingView: any;
  }
}

const TradingChart: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetRef = useRef<any>(null);

  useEffect(() => {
    if (!window.TradingView) {
      const script = document.createElement('script');
      script.src = 'https://s3.tradingview.com/tv.js';
      script.async = true;
      script.onload = initWidget;
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
  }, []);

  const initWidget = () => {
    if (!window.TradingView || !containerRef.current) {
      return;
    }

    if (widgetRef.current) {
      containerRef.current.innerHTML = '';
    }

    const containerId = 'tradingview_chart';
    containerRef.current.id = containerId;

    widgetRef.current = new window.TradingView.widget({
      width: '100%',
      height: '100%',
      symbol: 'FX:EURUSD',
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
      container_id: containerId,
    });
  };

  return (
    <Layout>
      <div className="h-screen">
        <Card className="h-full border-0">
          <CardContent className="p-0 h-full">
            <div 
              ref={containerRef}
              className="w-full h-full"
            />
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default TradingChart;
