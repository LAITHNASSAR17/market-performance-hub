
import React from 'react';
import Layout from '@/components/Layout';
import { Card, CardContent } from '@/components/ui/card';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  BarChart,
  Bar
} from 'recharts';
import { Activity, Users, DollarSign, UserPlus, Clock } from 'lucide-react';

const Dashboard = () => {
  // Sample data for charts
  const weeklyData = [
    { name: 'M', value: 45 },
    { name: 'T', value: 20 },
    { name: 'W', value: 10 },
    { name: 'T', value: 20 },
    { name: 'F', value: 45 },
    { name: 'S', value: 10 },
    { name: 'S', value: 40 }
  ];

  const monthlyData = [
    { name: 'Apr', value: 50 },
    { name: 'Jun', value: 150 },
    { name: 'Aug', value: 400 },
    { name: 'Oct', value: 300 },
    { name: 'Dec', value: 450 }
  ];

  return (
    <Layout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-semibold text-gray-800">Dashboard</h1>
          <div className="flex items-center gap-4">
            <input 
              type="search" 
              placeholder="Search here" 
              className="px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="bg-white shadow-lg rounded-xl">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <div className="h-12 w-12 bg-black rounded-lg flex items-center justify-center">
                    <Activity className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="mt-4 text-3xl font-bold">281</h3>
                  <p className="text-sm text-gray-500">Total Trades</p>
                </div>
                <span className="text-green-500 text-sm">+55% than last week</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-lg rounded-xl">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <div className="h-12 w-12 bg-blue-500 rounded-lg flex items-center justify-center">
                    <Users className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="mt-4 text-3xl font-bold">2,300</h3>
                  <p className="text-sm text-gray-500">Winning Trades</p>
                </div>
                <span className="text-green-500 text-sm">+3% than last month</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-lg rounded-xl">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <div className="h-12 w-12 bg-green-500 rounded-lg flex items-center justify-center">
                    <DollarSign className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="mt-4 text-3xl font-bold">34k</h3>
                  <p className="text-sm text-gray-500">Total Profit</p>
                </div>
                <span className="text-green-500 text-sm">+1% than yesterday</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-lg rounded-xl">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <div className="h-12 w-12 bg-pink-500 rounded-lg flex items-center justify-center">
                    <UserPlus className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="mt-4 text-3xl font-bold">91</h3>
                  <p className="text-sm text-gray-500">Win Rate</p>
                </div>
                <span className="text-gray-500 text-sm">Just updated</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="col-span-1 bg-blue-500 text-white rounded-xl">
            <CardContent className="p-6">
              <h3 className="font-semibold mb-4">Weekly Performance</h3>
              <div className="h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={weeklyData}>
                    <Bar dataKey="value" fill="#fff" />
                    <XAxis dataKey="name" stroke="#fff" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-4 flex items-center gap-2 text-sm">
                <Clock className="h-4 w-4" />
                <span>Last updated 2 days ago</span>
              </div>
            </CardContent>
          </Card>

          <Card className="col-span-1 bg-green-500 text-white rounded-xl">
            <CardContent className="p-6">
              <h3 className="font-semibold mb-4">Monthly Progress</h3>
              <div className="h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={monthlyData}>
                    <Line type="monotone" dataKey="value" stroke="#fff" strokeWidth={2} />
                    <XAxis dataKey="name" stroke="#fff" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-4 flex items-center gap-2 text-sm">
                <Clock className="h-4 w-4" />
                <span>Updated 4 min ago</span>
              </div>
            </CardContent>
          </Card>

          <Card className="col-span-1 bg-gray-900 text-white rounded-xl">
            <CardContent className="p-6">
              <h3 className="font-semibold mb-4">Overall Performance</h3>
              <div className="h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={monthlyData}>
                    <Line type="monotone" dataKey="value" stroke="#fff" strokeWidth={2} />
                    <XAxis dataKey="name" stroke="#fff" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-4 flex items-center gap-2 text-sm">
                <Clock className="h-4 w-4" />
                <span>Just updated</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;
