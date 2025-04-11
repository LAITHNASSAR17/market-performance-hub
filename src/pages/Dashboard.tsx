import React from 'react';
import Layout from '@/components/Layout';
import { useTrade, Trade } from '@/contexts/TradeContext';
import StatCard from '@/components/StatCard';
import { BarChart2, TrendingUp, TrendingDown, DollarSign, Activity, CalendarDays, BarChart } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  BarChart as RechartBarChart,
  Bar
} from 'recharts';

const Dashboard: React.FC = () => {
  const { trades } = useTrade();

  // Calculate some basic stats
  const totalTrades = trades.length;
  const totalProfit = trades.reduce((sum, trade) => sum + trade.profitLoss, 0);
  const winningTrades = trades.filter(trade => trade.profitLoss > 0).length;
  const losingTrades = trades.filter(trade => trade.profitLoss < 0).length;
  const winRate = totalTrades > 0 ? (winningTrades / totalTrades) * 100 : 0;
  
  const bestTrade = trades.reduce(
    (best, trade) => (trade.profitLoss > best.profitLoss ? trade : best),
    trades[0] || { profitLoss: 0, pair: 'N/A', id: '', userId: '', account: '', date: '', type: 'Buy', entry: 0, exit: 0, lotSize: 0, stopLoss: 0, takeProfit: 0, riskPercentage: 0, returnPercentage: 0, durationMinutes: 0, notes: '', imageUrl: null, hashtags: [], createdAt: '' }
  );
  
  const worstTrade = trades.reduce(
    (worst, trade) => (trade.profitLoss < worst.profitLoss ? trade : worst),
    trades[0] || { profitLoss: 0, pair: 'N/A', id: '', userId: '', account: '', date: '', type: 'Buy', entry: 0, exit: 0, lotSize: 0, stopLoss: 0, takeProfit: 0, riskPercentage: 0, returnPercentage: 0, durationMinutes: 0, notes: '', imageUrl: null, hashtags: [], createdAt: '' }
  );

  // Prepare data for charts
  const getLast7Days = () => {
    const result = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      result.push({
        date: date.toISOString().slice(0, 10),
        label: new Date(date).toLocaleDateString('en-US', { weekday: 'short' })
      });
    }
    return result;
  };

  const dailyPerformanceData = getLast7Days().map(dayInfo => {
    const dayTrades = trades.filter(trade => trade.date === dayInfo.date);
    const dayProfit = dayTrades.reduce((sum, trade) => sum + trade.profitLoss, 0);
    
    return {
      day: dayInfo.label,
      profit: dayProfit
    };
  });

  // Prepare pair distribution data
  const pairDistribution = trades.reduce((acc, trade) => {
    if (!acc[trade.pair]) {
      acc[trade.pair] = { pair: trade.pair, count: 0, profit: 0 };
    }
    acc[trade.pair].count++;
    acc[trade.pair].profit += trade.profitLoss;
    return acc;
  }, {} as Record<string, { pair: string; count: number; profit: number }>);

  const pairData = Object.values(pairDistribution).sort((a, b) => b.count - a.count);

  return (
    <Layout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-1">Trading Dashboard</h1>
        <p className="text-gray-500">Overview of your trading performance</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Total Profit/Loss"
          value={`$${totalProfit.toFixed(2)}`}
          trend={totalProfit > 0 ? 'up' : totalProfit < 0 ? 'down' : 'neutral'}
          icon={<DollarSign className="h-5 w-5" />}
          className={totalProfit > 0 ? "border-l-4 border-profit" : totalProfit < 0 ? "border-l-4 border-loss" : ""}
        />
        <StatCard
          title="Win Rate"
          value={`${winRate.toFixed(1)}%`}
          description={`${winningTrades} out of ${totalTrades} trades`}
          icon={<Activity className="h-5 w-5" />}
        />
        <StatCard
          title="Best Trade"
          value={`$${bestTrade.profitLoss?.toFixed(2) || '0.00'}`}
          description={bestTrade.pair}
          icon={<TrendingUp className="h-5 w-5" />}
          className="border-l-4 border-profit"
        />
        <StatCard
          title="Worst Trade"
          value={`$${worstTrade.profitLoss?.toFixed(2) || '0.00'}`}
          description={worstTrade.pair}
          icon={<TrendingDown className="h-5 w-5" />}
          className="border-l-4 border-loss"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Daily Performance Chart */}
        <Card className="overflow-hidden">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Daily Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <RechartBarChart
                  data={dailyPerformanceData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" />
                  <YAxis />
                  <Tooltip formatter={(value) => [`$${Number(value).toFixed(2)}`, 'Profit/Loss']} />
                  <Bar
                    dataKey="profit"
                    fill="#3b82f6"
                    name="Profit/Loss"
                    radius={[4, 4, 0, 0]}
                  />
                </RechartBarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Currency Pair Analysis */}
        <Card className="overflow-hidden">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Currency Pair Analysis</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <RechartBarChart
                  data={pairData.slice(0, 5)}
                  layout="vertical"
                  margin={{ top: 20, right: 30, left: 50, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis type="category" dataKey="pair" />
                  <Tooltip formatter={(value, name) => [name === 'count' ? value : `$${Number(value).toFixed(2)}`, name === 'count' ? 'Trades' : 'Profit/Loss']} />
                  <Bar dataKey="count" fill="#3b82f6" name="Trades" radius={[0, 4, 4, 0]} />
                  <Bar dataKey="profit" fill={pairData.some(d => d.profit < 0) ? '#ef4444' : '#22c55e'} name="Profit/Loss" radius={[0, 4, 4, 0]} />
                </RechartBarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {/* Calendar Performance (simplified version) */}
        <Card className="overflow-hidden">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Recent Trade Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-7 gap-2">
              {getLast7Days().map((day, index) => {
                const dayTrades = trades.filter(trade => trade.date === day.date);
                const dayProfit = dayTrades.reduce((sum, trade) => sum + trade.profitLoss, 0);
                const tradeCount = dayTrades.length;
                
                return (
                  <div 
                    key={index}
                    className={`p-3 rounded-lg border ${
                      dayProfit > 0 
                        ? 'bg-green-50 border-green-200' 
                        : dayProfit < 0 
                          ? 'bg-red-50 border-red-200' 
                          : 'bg-gray-50 border-gray-200'
                    }`}
                  >
                    <div className="text-center">
                      <div className="text-sm font-medium">{day.label}</div>
                      {tradeCount > 0 ? (
                        <>
                          <div className={`text-lg font-bold ${
                            dayProfit > 0 ? 'text-profit' : dayProfit < 0 ? 'text-loss' : 'text-gray-500'
                          }`}>
                            ${Math.abs(dayProfit).toFixed(0)}
                          </div>
                          <div className="text-xs text-gray-500">{tradeCount} trade{tradeCount !== 1 ? 's' : ''}</div>
                        </>
                      ) : (
                        <div className="text-xs mt-2 text-gray-400">No trades</div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Dashboard;
