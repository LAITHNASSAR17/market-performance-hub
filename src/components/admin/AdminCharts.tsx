
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  LineChart, 
  Line, 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend 
} from 'recharts';

// Sample data for charts
const userGrowthData = [
  { name: 'Jan', users: 4 },
  { name: 'Feb', users: 7 },
  { name: 'Mar', users: 10 },
  { name: 'Apr', users: 15 },
  { name: 'May', users: 22 },
  { name: 'Jun', users: 25 },
  { name: 'Jul', users: 30 },
];

const dailyActivityData = [
  { name: 'Mon', trades: 10, notes: 5 },
  { name: 'Tue', trades: 15, notes: 8 },
  { name: 'Wed', trades: 12, notes: 10 },
  { name: 'Thu', trades: 18, notes: 12 },
  { name: 'Fri', trades: 22, notes: 15 },
  { name: 'Sat', trades: 8, notes: 7 },
  { name: 'Sun', trades: 5, notes: 3 },
];

const tradedPairsData = [
  { name: 'EUR/USD', value: 35 },
  { name: 'GBP/USD', value: 25 },
  { name: 'USD/JPY', value: 20 },
  { name: 'AUD/USD', value: 10 },
  { name: 'USD/CAD', value: 10 },
];

const winLossRatioData = [
  { name: 'Winning', value: 65 },
  { name: 'Losing', value: 35 },
];

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];
const WIN_LOSS_COLORS = ['#00C49F', '#FF8042'];

interface AdminChartsProps {
  className?: string;
}

const AdminCharts: React.FC<AdminChartsProps> = ({ className }) => {
  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 gap-6 ${className}`}>
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-medium">Monthly User Growth</CardTitle>
        </CardHeader>
        <CardContent className="p-2">
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart
              data={userGrowthData}
              margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Area type="monotone" dataKey="users" stroke="#8884d8" fill="#8884d8" fillOpacity={0.2} />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-medium">Daily Activity</CardTitle>
        </CardHeader>
        <CardContent className="p-2">
          <ResponsiveContainer width="100%" height={200}>
            <BarChart
              data={dailyActivityData}
              margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="trades" fill="#8884d8" />
              <Bar dataKey="notes" fill="#82ca9d" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-medium">Most Traded Pairs</CardTitle>
        </CardHeader>
        <CardContent className="p-2">
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={tradedPairsData}
                cx="50%"
                cy="50%"
                innerRadius={25}
                outerRadius={60}
                fill="#8884d8"
                paddingAngle={2}
                dataKey="value"
                label={({name, percent}) => `${name} ${(percent * 100).toFixed(0)}%`}
              >
                {tradedPairsData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-medium">Win/Loss Ratio</CardTitle>
        </CardHeader>
        <CardContent className="p-2">
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={winLossRatioData}
                cx="50%"
                cy="50%"
                startAngle={180}
                endAngle={0}
                innerRadius={40}
                outerRadius={80}
                fill="#8884d8"
                paddingAngle={2}
                dataKey="value"
                label={({name, value}) => `${name} ${value}%`}
              >
                {winLossRatioData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={WIN_LOSS_COLORS[index % WIN_LOSS_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminCharts;
