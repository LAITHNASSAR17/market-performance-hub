
import React, { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import { useTrade, Trade } from '@/contexts/TradeContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import StatCard from '@/components/StatCard';
import { 
  BarChart, 
  Clock, 
  Calendar, 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  BarChart2,
  Lightbulb,
  AlertCircle,
  CheckCircle,
  CircleAlert,
  ArrowUp,
  ArrowDown,
  Zap,
  ThumbsUp,
  ThumbsDown,
  CalendarClock
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface Insight {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  type: 'positive' | 'negative' | 'neutral' | 'alert';
}

const Insights: React.FC = () => {
  const { trades } = useTrade();
  const [insights, setInsights] = useState<Insight[]>([]);

  useEffect(() => {
    if (trades.length === 0) {
      setInsights([
        {
          id: 'no-trades',
          title: 'No Trade Data Available',
          description: 'Add your first trades to get personalized insights about your trading performance.',
          icon: <AlertCircle className="h-5 w-5" />,
          type: 'neutral'
        }
      ]);
      return;
    }

    const generatedInsights: Insight[] = [];

    // Best trading day
    if (trades.length >= 5) {
      const dayMap = new Map<string, { count: number; profit: number }>();
      const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      
      trades.forEach(trade => {
        const date = new Date(trade.date);
        const dayOfWeek = date.getDay();
        const dayName = dayNames[dayOfWeek];
        
        if (!dayMap.has(dayName)) {
          dayMap.set(dayName, { count: 0, profit: 0 });
        }
        
        const dayData = dayMap.get(dayName)!;
        dayData.count += 1;
        dayData.profit += trade.profitLoss;
      });
      
      // Find best and worst day
      let bestDay = { name: '', profit: -Infinity, count: 0 };
      let worstDay = { name: '', profit: Infinity, count: 0 };
      
      dayMap.forEach((data, day) => {
        if (data.count >= 3) { // Require at least 3 trades for significance
          if (data.profit > bestDay.profit) {
            bestDay = { name: day, profit: data.profit, count: data.count };
          }
          
          if (data.profit < worstDay.profit) {
            worstDay = { name: day, profit: data.profit, count: data.count };
          }
        }
      });
      
      if (bestDay.name) {
        generatedInsights.push({
          id: 'best-day',
          title: `${bestDay.name} Is Your Best Trading Day`,
          description: `You've made $${bestDay.profit.toFixed(2)} across ${bestDay.count} trades on ${bestDay.name}s. Consider allocating more time to trading on this day.`,
          icon: <Calendar className="h-5 w-5" />,
          type: 'positive'
        });
      }
      
      if (worstDay.name && worstDay.profit < 0) {
        generatedInsights.push({
          id: 'worst-day',
          title: `Avoid Trading on ${worstDay.name}`,
          description: `You've lost $${Math.abs(worstDay.profit).toFixed(2)} across ${worstDay.count} trades on ${worstDay.name}s. Consider taking a break on this day or reviewing your strategy.`,
          icon: <AlertCircle className="h-5 w-5" />,
          type: 'negative'
        });
      }
    }
    
    // Most profitable pair
    if (trades.length >= 3) {
      const pairMap = new Map<string, { count: number; profit: number; winRate: number }>();
      
      trades.forEach(trade => {
        if (!pairMap.has(trade.pair)) {
          pairMap.set(trade.pair, { count: 0, profit: 0, winRate: 0 });
        }
        
        const pairData = pairMap.get(trade.pair)!;
        pairData.count += 1;
        pairData.profit += trade.profitLoss;
      });
      
      // Calculate win rates
      trades.forEach(trade => {
        const pairData = pairMap.get(trade.pair)!;
        const wins = trades.filter(t => t.pair === trade.pair && t.profitLoss > 0).length;
        pairData.winRate = (wins / pairData.count) * 100;
      });
      
      // Find most profitable and least profitable pairs with at least 3 trades
      const significantPairs = Array.from(pairMap.entries())
        .filter(([_, data]) => data.count >= 3)
        .map(([pair, data]) => ({ pair, ...data }));
      
      if (significantPairs.length > 0) {
        const mostProfitablePair = significantPairs.reduce(
          (best, current) => current.profit > best.profit ? current : best,
          significantPairs[0]
        );
        
        const highestWinRatePair = significantPairs.reduce(
          (best, current) => current.winRate > best.winRate ? current : best,
          significantPairs[0]
        );
        
        if (mostProfitablePair.profit > 0) {
          generatedInsights.push({
            id: 'profitable-pair',
            title: `${mostProfitablePair.pair} Is Your Most Profitable Pair`,
            description: `You've made $${mostProfitablePair.profit.toFixed(2)} across ${mostProfitablePair.count} trades with this pair. Consider focusing more on this instrument.`,
            icon: <TrendingUp className="h-5 w-5" />,
            type: 'positive'
          });
        }
        
        if (highestWinRatePair.winRate >= 60) {
          generatedInsights.push({
            id: 'high-winrate-pair',
            title: `High Win Rate with ${highestWinRatePair.pair}`,
            description: `You have a ${highestWinRatePair.winRate.toFixed(0)}% win rate with ${highestWinRatePair.pair} over ${highestWinRatePair.count} trades. This appears to be a strong instrument for your strategy.`,
            icon: <CheckCircle className="h-5 w-5" />,
            type: 'positive'
          });
        }
        
        // Find worst performing pair
        const leastProfitablePair = significantPairs.reduce(
          (worst, current) => current.profit < worst.profit ? current : worst,
          significantPairs[0]
        );
        
        if (leastProfitablePair.profit < 0) {
          generatedInsights.push({
            id: 'unprofitable-pair',
            title: `${leastProfitablePair.pair} Is Costing You Money`,
            description: `You've lost $${Math.abs(leastProfitablePair.profit).toFixed(2)} across ${leastProfitablePair.count} trades with this pair. Consider reducing exposure or revising your strategy.`,
            icon: <TrendingDown className="h-5 w-5" />,
            type: 'negative'
          });
        }
      }
    }
    
    // Trade type analysis
    if (trades.length >= 5) {
      const buyTrades = trades.filter(trade => trade.type === 'Buy');
      const sellTrades = trades.filter(trade => trade.type === 'Sell');
      
      const buyProfit = buyTrades.reduce((sum, trade) => sum + trade.profitLoss, 0);
      const sellProfit = sellTrades.reduce((sum, trade) => sum + trade.profitLoss, 0);
      
      const buyWins = buyTrades.filter(trade => trade.profitLoss > 0).length;
      const sellWins = sellTrades.filter(trade => trade.profitLoss > 0).length;
      
      const buyWinRate = buyTrades.length > 0 ? (buyWins / buyTrades.length) * 100 : 0;
      const sellWinRate = sellTrades.length > 0 ? (sellWins / sellTrades.length) * 100 : 0;
      
      const buyAvgProfit = buyTrades.length > 0 ? buyProfit / buyTrades.length : 0;
      const sellAvgProfit = sellTrades.length > 0 ? sellProfit / sellTrades.length : 0;
      
      // Significant difference in performance between buy and sell
      if (buyTrades.length >= 3 && sellTrades.length >= 3) {
        if (buyWinRate > sellWinRate + 15) {
          generatedInsights.push({
            id: 'better-at-buying',
            title: 'You Perform Better on Buy Trades',
            description: `Your win rate on buy trades (${buyWinRate.toFixed(0)}%) is significantly higher than on sell trades (${sellWinRate.toFixed(0)}%). Consider adjusting your strategy to focus more on buy opportunities.`,
            icon: <ArrowUp className="h-5 w-5" />,
            type: 'positive'
          });
        } else if (sellWinRate > buyWinRate + 15) {
          generatedInsights.push({
            id: 'better-at-selling',
            title: 'You Perform Better on Sell Trades',
            description: `Your win rate on sell trades (${sellWinRate.toFixed(0)}%) is significantly higher than on buy trades (${buyWinRate.toFixed(0)}%). Consider adjusting your strategy to focus more on sell opportunities.`,
            icon: <ArrowDown className="h-5 w-5" />,
            type: 'positive'
          });
        }
        
        if (buyAvgProfit > 0 && sellAvgProfit < 0) {
          generatedInsights.push({
            id: 'profitable-buys-losing-sells',
            title: 'Profitable on Buys, Losing on Sells',
            description: `You're making an average of $${buyAvgProfit.toFixed(2)} per buy trade but losing an average of $${Math.abs(sellAvgProfit).toFixed(2)} per sell trade. Consider reviewing your sell criteria.`,
            icon: <CircleAlert className="h-5 w-5" />,
            type: 'alert'
          });
        } else if (sellAvgProfit > 0 && buyAvgProfit < 0) {
          generatedInsights.push({
            id: 'profitable-sells-losing-buys',
            title: 'Profitable on Sells, Losing on Buys',
            description: `You're making an average of $${sellAvgProfit.toFixed(2)} per sell trade but losing an average of $${Math.abs(buyAvgProfit).toFixed(2)} per buy trade. Consider reviewing your buy criteria.`,
            icon: <CircleAlert className="h-5 w-5" />,
            type: 'alert'
          });
        }
      }
    }
    
    // Time-based analysis
    if (trades.length >= 5) {
      // Analyze trade duration and performance
      const shortTrades = trades.filter(trade => trade.durationMinutes <= 60);
      const mediumTrades = trades.filter(trade => trade.durationMinutes > 60 && trade.durationMinutes <= 240);
      const longTrades = trades.filter(trade => trade.durationMinutes > 240);
      
      const shortProfit = shortTrades.reduce((sum, trade) => sum + trade.profitLoss, 0);
      const mediumProfit = mediumTrades.reduce((sum, trade) => sum + trade.profitLoss, 0);
      const longProfit = longTrades.reduce((sum, trade) => sum + trade.profitLoss, 0);
      
      const shortAvgProfit = shortTrades.length > 0 ? shortProfit / shortTrades.length : 0;
      const mediumAvgProfit = mediumTrades.length > 0 ? mediumProfit / mediumTrades.length : 0;
      const longAvgProfit = longTrades.length > 0 ? longProfit / longTrades.length : 0;
      
      // Only compare if there are at least 3 trades in each category
      if (shortTrades.length >= 3 && mediumTrades.length >= 3) {
        if (shortAvgProfit > mediumAvgProfit * 1.5) {
          generatedInsights.push({
            id: 'better-short-term',
            title: 'You Perform Better in Shorter Timeframes',
            description: `Your average profit on trades under 1 hour ($${shortAvgProfit.toFixed(2)}) is significantly higher than on medium-term trades ($${mediumAvgProfit.toFixed(2)}). Consider focusing more on shorter timeframes.`,
            icon: <Clock className="h-5 w-5" />,
            type: 'positive'
          });
        } else if (mediumAvgProfit > shortAvgProfit * 1.5) {
          generatedInsights.push({
            id: 'better-medium-term',
            title: 'Medium-Duration Trades Are More Profitable',
            description: `Your average profit on trades between 1-4 hours ($${mediumAvgProfit.toFixed(2)}) is significantly higher than on short-term trades ($${shortAvgProfit.toFixed(2)}). Consider holding positions longer.`,
            icon: <CalendarClock className="h-5 w-5" />,
            type: 'positive'
          });
        }
      }
      
      if (longTrades.length >= 3) {
        if (longAvgProfit > shortAvgProfit * 1.5 && longAvgProfit > mediumAvgProfit * 1.5) {
          generatedInsights.push({
            id: 'better-long-term',
            title: 'Long-Term Trades Are Your Strength',
            description: `Your average profit on trades over 4 hours ($${longAvgProfit.toFixed(2)}) is significantly higher than on shorter timeframes. Consider a more position-oriented trading style.`,
            icon: <Calendar className="h-5 w-5" />,
            type: 'positive'
          });
        }
      }
    }
    
    // Risk management insights
    if (trades.length >= 5) {
      const riskyTrades = trades.filter(trade => trade.riskPercentage > 2);
      const conservativeTrades = trades.filter(trade => trade.riskPercentage <= 2);
      
      if (riskyTrades.length >= 3 && conservativeTrades.length >= 3) {
        const riskyProfit = riskyTrades.reduce((sum, trade) => sum + trade.profitLoss, 0);
        const conservativeProfit = conservativeTrades.reduce((sum, trade) => sum + trade.profitLoss, 0);
        
        const riskyAvgProfit = riskyProfit / riskyTrades.length;
        const conservativeAvgProfit = conservativeProfit / conservativeTrades.length;
        
        if (conservativeAvgProfit > riskyAvgProfit) {
          generatedInsights.push({
            id: 'lower-risk-better',
            title: 'Lower Risk Trades Are More Profitable',
            description: `Your trades with risk ≤2% average $${conservativeAvgProfit.toFixed(2)} profit, while higher risk trades average $${riskyAvgProfit.toFixed(2)}. Consider maintaining conservative position sizing.`,
            icon: <ThumbsUp className="h-5 w-5" />,
            type: 'positive'
          });
        } else if (riskyAvgProfit > conservativeAvgProfit && riskyAvgProfit > 0) {
          generatedInsights.push({
            id: 'higher-risk-better',
            title: 'Higher Risk Trades Are More Profitable',
            description: `Your trades with risk >2% average $${riskyAvgProfit.toFixed(2)} profit, while lower risk trades average $${conservativeAvgProfit.toFixed(2)}. Your high-conviction trades seem to perform well.`,
            icon: <Zap className="h-5 w-5" />,
            type: 'neutral'
          });
        }
      }
    }
    
    // General performance insights
    if (trades.length >= 10) {
      const winRate = (trades.filter(trade => trade.profitLoss > 0).length / trades.length) * 100;
      const totalProfit = trades.reduce((sum, trade) => sum + trade.profitLoss, 0);
      const averageProfit = totalProfit / trades.length;
      
      if (winRate < 40 && totalProfit > 0) {
        generatedInsights.push({
          id: 'profitable-despite-low-winrate',
          title: 'Profitable Despite Low Win Rate',
          description: `With a ${winRate.toFixed(0)}% win rate, you're still profitable overall. Your winning trades have excellent risk/reward ratios. Keep this edge but try to improve accuracy.`,
          icon: <Lightbulb className="h-5 w-5" />,
          type: 'positive'
        });
      } else if (winRate > 60 && totalProfit < 0) {
        generatedInsights.push({
          id: 'losing-despite-high-winrate',
          title: 'Losing Despite High Win Rate',
          description: `With a ${winRate.toFixed(0)}% win rate, you're still losing money overall. Your losses are likely too large compared to your wins. Focus on improving your risk management.`,
          icon: <ThumbsDown className="h-5 w-5" />,
          type: 'negative'
        });
      }
      
      if (winRate > 65) {
        generatedInsights.push({
          id: 'exceptional-winrate',
          title: 'Exceptional Win Rate',
          description: `Your ${winRate.toFixed(0)}% win rate is well above average. Continue with your current entry criteria while ensuring you're maximizing your profitable trades.`,
          icon: <CheckCircle className="h-5 w-5" />,
          type: 'positive'
        });
      } else if (winRate < 35) {
        generatedInsights.push({
          id: 'concerning-winrate',
          title: 'Low Win Rate Needs Attention',
          description: `Your ${winRate.toFixed(0)}% win rate suggests your entry criteria may need revision. Review your trading plan and consider more selective trade filtering.`,
          icon: <AlertCircle className="h-5 w-5" />,
          type: 'negative'
        });
      }
    }
    
    // Randomize and limit insights
    const shuffledInsights = [...generatedInsights].sort(() => Math.random() - 0.5);
    setInsights(shuffledInsights.slice(0, 6)); // Limit to 6 insights
    
  }, [trades]);

  // Function to get card background class based on insight type
  const getInsightCardClass = (type: string) => {
    switch (type) {
      case 'positive':
        return 'border-l-4 border-green-500';
      case 'negative':
        return 'border-l-4 border-red-500';
      case 'alert':
        return 'border-l-4 border-amber-500';
      default:
        return 'border-l-4 border-blue-500';
    }
  };

  // Function to get icon class based on insight type
  const getIconClass = (type: string) => {
    switch (type) {
      case 'positive':
        return 'text-green-500';
      case 'negative':
        return 'text-red-500';
      case 'alert':
        return 'text-amber-500';
      default:
        return 'text-blue-500';
    }
  };

  return (
    <Layout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-1">Trading Insights</h1>
        <p className="text-gray-500">AI-powered analysis of your trading patterns</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Total Trades"
          value={trades.length.toString()}
          description="Data points analyzed"
          icon={<BarChart2 className="h-5 w-5" />}
        />
        <StatCard
          title="Win Rate"
          value={`${trades.length > 0 
            ? ((trades.filter(t => t.profitLoss > 0).length / trades.length) * 100).toFixed(1) 
            : 0}%`}
          icon={<Percent className="h-5 w-5" />}
        />
        <StatCard
          title="Average Return"
          value={`${trades.length > 0 
            ? (trades.reduce((sum, t) => sum + t.returnPercentage, 0) / trades.length).toFixed(1) 
            : 0}%`}
          icon={<TrendingUp className="h-5 w-5" />}
        />
        <StatCard
          title="Avg. Trade Duration"
          value={`${trades.length > 0 
            ? Math.round(trades.reduce((sum, t) => sum + t.durationMinutes, 0) / trades.length) 
            : 0} min`}
          icon={<Clock className="h-5 w-5" />}
        />
      </div>

      {/* Insights List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {insights.length > 0 ? (
          insights.map(insight => (
            <Card 
              key={insight.id} 
              className={cn("overflow-hidden", getInsightCardClass(insight.type))}
            >
              <CardHeader className="pb-2">
                <div className="flex items-start">
                  <div className={cn("mr-2 mt-1", getIconClass(insight.type))}>
                    {insight.icon}
                  </div>
                  <CardTitle className="text-lg">{insight.title}</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">{insight.description}</p>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="col-span-2 text-center py-16 bg-gray-50 rounded-lg">
            <Lightbulb className="mx-auto h-10 w-10 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-600 mb-2">Generating insights...</h3>
            <p className="text-gray-500">
              Add more trades to receive personalized insights about your trading performance.
            </p>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Insights;
