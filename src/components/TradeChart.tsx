
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Trade } from '@/contexts/TradeContext';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine, ResponsiveContainer, Label } from 'recharts';
import { cn } from '@/lib/utils';

interface TradeChartProps {
  trade: Trade;
}

const TradeChart: React.FC<TradeChartProps> = ({ trade }) => {
  // Generate some chart data based on trade information
  const generateChartData = () => {
    const data = [];
    
    const range = trade.type === 'Buy' 
      ? trade.entry - (trade.stopLoss || trade.entry * 0.99) 
      : trade.stopLoss ? trade.stopLoss - trade.entry : trade.entry * 0.01;
    
    // Generate data points to simulate a chart
    // Starting point below the entry (for buy) or above entry (for sell)
    const startingPrice = trade.type === 'Buy' 
      ? trade.entry - range * 0.5 
      : trade.entry + range * 0.5;
    
    // Add data points before entry
    for (let i = 0; i < 10; i++) {
      data.push({
        time: i,
        price: startingPrice + (Math.random() - 0.5) * range * 0.5
      });
    }
    
    // Entry point
    data.push({
      time: 10,
      price: trade.entry,
      event: 'Entry'
    });
    
    // Simulate price movement after entry
    const direction = trade.type === 'Buy' ? 1 : -1;
    const midPoint = (trade.entry + trade.exit) / 2;
    
    // Add data points during the trade
    for (let i = 11; i < 20; i++) {
      // Create some random price action, trending toward the exit price
      const progress = (i - 10) / 10;
      const targetPrice = trade.entry + (trade.exit - trade.entry) * progress;
      const volatility = range * 0.3 * (1 - progress); // Reduce volatility as we get closer to exit
      
      data.push({
        time: i,
        price: targetPrice + (Math.random() - 0.5) * volatility
      });
    }
    
    // Exit point
    data.push({
      time: 20,
      price: trade.exit,
      event: 'Exit'
    });
    
    // Add some points after exit
    for (let i = 21; i < 25; i++) {
      data.push({
        time: i,
        price: trade.exit + (Math.random() - 0.5) * range * 0.5
      });
    }
    
    return data;
  };

  const chartData = generateChartData();
  
  // Determine min and max values for Y axis
  const prices = chartData.map(d => d.price);
  const minPrice = Math.min(...prices) * 0.999;
  const maxPrice = Math.max(...prices) * 1.001;

  // Determine if this was a winning or losing trade
  const isWinningTrade = trade.profitLoss > 0;
  
  // Calculate trend line points
  const trendLineData = [
    { time: 10, price: trade.entry },
    { time: 20, price: trade.exit }
  ];

  return (
    <ResponsiveContainer width="100%" height={500}>
      <LineChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 10 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="time" />
        <YAxis domain={[minPrice, maxPrice]} tickFormatter={(value) => value.toFixed(5)} />
        <Tooltip 
          formatter={(value) => [Number(value).toFixed(5), 'Price']}
          labelFormatter={(value) => `Time: ${value}`}
        />
        
        {/* Main price line */}
        <Line 
          type="monotone" 
          dataKey="price" 
          stroke="#8884d8" 
          dot={(props) => {
            const { cx, cy, payload } = props;
            if (payload.event) {
              return (
                <circle 
                  cx={cx} 
                  cy={cy} 
                  r={5} 
                  fill={payload.event === 'Entry' ? '#4CAF50' : '#FF5252'} 
                  stroke="none" 
                />
              );
            }
            return null;
          }}
        />
        
        {/* Entry line */}
        <ReferenceLine 
          y={trade.entry} 
          stroke="#4CAF50" 
          strokeDasharray="3 3"
          label={{ 
            value: 'Entry', 
            position: 'right',
            fill: '#4CAF50',
            fontSize: 12
          }} 
        />
        
        {/* Exit line */}
        <ReferenceLine 
          y={trade.exit} 
          stroke="#FF5252" 
          strokeDasharray="3 3"
          label={{ 
            value: 'Exit', 
            position: 'right',
            fill: '#FF5252',
            fontSize: 12
          }} 
        />
        
        {/* Stop loss if available */}
        {trade.stopLoss && (
          <ReferenceLine 
            y={trade.stopLoss} 
            stroke="#FF9800" 
            strokeDasharray="3 3"
            label={{ 
              value: 'Stop Loss', 
              position: 'left',
              fill: '#FF9800',
              fontSize: 12
            }} 
          />
        )}
        
        {/* Take profit if available */}
        {trade.takeProfit && (
          <ReferenceLine 
            y={trade.takeProfit} 
            stroke="#2196F3" 
            strokeDasharray="3 3"
            label={{ 
              value: 'Take Profit', 
              position: 'left',
              fill: '#2196F3',
              fontSize: 12
            }} 
          />
        )}
        
        {/* Trend Line connecting entry and exit */}
        <Line 
          data={trendLineData}
          type="linear" 
          dataKey="price" 
          stroke={isWinningTrade ? "#4CAF50" : "#FF5252"}
          strokeWidth={2}
          strokeDasharray="5 5"
          dot={false}
          isAnimationActive={false}
        />
      </LineChart>
    </ResponsiveContainer>
  );
};

export default TradeChart;
