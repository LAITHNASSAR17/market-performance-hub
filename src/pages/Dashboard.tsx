
import React from 'react';
import Layout from '@/components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, LineChart, PieChart, TrendingUp, Users, DollarSign, Activity } from 'lucide-react';

const Dashboard: React.FC = () => {
  // Mock data for dashboard
  const recentTrades = [
    { id: 1, symbol: 'EURUSD', direction: 'long', profit: 120.50, date: '2023-04-20' },
    { id: 2, symbol: 'GBPJPY', direction: 'short', profit: -45.20, date: '2023-04-19' },
    { id: 3, symbol: 'USDCAD', direction: 'long', profit: 67.30, date: '2023-04-18' },
    { id: 4, symbol: 'AUDUSD', direction: 'short', profit: 33.80, date: '2023-04-17' },
  ];
  
  return (
    <Layout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Profit
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-2xl font-bold">$1,245.32</div>
                <DollarSign className="h-4 w-4 text-green-500" />
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                <span className="text-green-500">+12.5%</span> from last month
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Win Rate
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-2xl font-bold">68%</div>
                <Activity className="h-4 w-4 text-blue-500" />
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                <span className="text-green-500">+4%</span> from last month
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Trades
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-2xl font-bold">86</div>
                <TrendingUp className="h-4 w-4 text-indigo-500" />
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                <span className="text-blue-500">+8</span> new trades this week
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Risk/Reward
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-2xl font-bold">1:2.4</div>
                <PieChart className="h-4 w-4 text-purple-500" />
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                <span className="text-green-500">+0.3</span> from last month
              </p>
            </CardContent>
          </Card>
        </div>
        
        {/* Charts Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Profit/Loss Over Time</CardTitle>
              <CardDescription>Cumulative P&L over the last 30 days</CardDescription>
            </CardHeader>
            <CardContent className="h-[300px] flex items-center justify-center">
              <div className="text-center text-gray-500 flex flex-col items-center">
                <LineChart className="h-16 w-16 mb-2 opacity-50" />
                <p>Chart visualization would appear here</p>
                <p className="text-sm text-gray-400">Connect to your data source to see live charts</p>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Win/Loss Distribution</CardTitle>
              <CardDescription>Trading performance by market</CardDescription>
            </CardHeader>
            <CardContent className="h-[300px] flex items-center justify-center">
              <div className="text-center text-gray-500 flex flex-col items-center">
                <BarChart className="h-16 w-16 mb-2 opacity-50" />
                <p>Chart visualization would appear here</p>
                <p className="text-sm text-gray-400">Connect to your data source to see live charts</p>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Recent Trades */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Trades</CardTitle>
            <CardDescription>Your most recent trading activity</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4">Symbol</th>
                    <th className="text-left py-3 px-4">Direction</th>
                    <th className="text-left py-3 px-4">Profit/Loss</th>
                    <th className="text-left py-3 px-4">Date</th>
                    <th className="text-right py-3 px-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {recentTrades.map(trade => (
                    <tr key={trade.id} className="border-b">
                      <td className="py-3 px-4 font-medium">{trade.symbol}</td>
                      <td className="py-3 px-4">
                        <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          trade.direction === 'long' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {trade.direction}
                        </div>
                      </td>
                      <td className={`py-3 px-4 ${
                        trade.profit > 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {trade.profit > 0 ? '+' : ''}{trade.profit.toFixed(2)}
                      </td>
                      <td className="py-3 px-4 text-gray-500">{trade.date}</td>
                      <td className="py-3 px-4 text-right">
                        <button className="text-blue-600 hover:text-blue-800 text-sm">
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {recentTrades.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  No recent trades found. Start adding trades to see them here.
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Dashboard;
