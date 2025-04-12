
import React, { useState } from 'react';
import Layout from '@/components/Layout';
import AccountsManager from '@/components/AccountsManager';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Briefcase, Wallet, BarChart4, Settings } from 'lucide-react';

const TradeTracking: React.FC = () => {
  const [activeTab, setActiveTab] = useState('accounts');

  return (
    <Layout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-1">Trade Tracking</h1>
        <p className="text-gray-500">Manage your trading accounts and track performance</p>
      </div>

      <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="bg-white p-1 rounded-md mb-6 overflow-x-auto flex whitespace-nowrap">
          <TabsTrigger value="accounts" className="flex items-center">
            <Briefcase className="mr-2 h-4 w-4" />
            <span>Trading Accounts</span>
          </TabsTrigger>
          <TabsTrigger value="funds" className="flex items-center">
            <Wallet className="mr-2 h-4 w-4" />
            <span>Funds Management</span>
          </TabsTrigger>
          <TabsTrigger value="metrics" className="flex items-center">
            <BarChart4 className="mr-2 h-4 w-4" />
            <span>Account Metrics</span>
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center">
            <Settings className="mr-2 h-4 w-4" />
            <span>Trading Settings</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="accounts">
          <AccountsManager />
        </TabsContent>

        <TabsContent value="funds">
          <Card>
            <CardHeader>
              <CardTitle>Funds Management</CardTitle>
              <CardDescription>Manage deposits, withdrawals and transfers</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="p-8 text-center text-gray-500">
                <Wallet className="mx-auto h-12 w-12 text-gray-300 mb-4" />
                <h3 className="text-lg font-medium mb-2">Coming Soon</h3>
                <p>The funds management feature is under development and will be available soon.</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="metrics">
          <Card>
            <CardHeader>
              <CardTitle>Account Metrics</CardTitle>
              <CardDescription>Performance metrics for your trading accounts</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="p-8 text-center text-gray-500">
                <BarChart4 className="mx-auto h-12 w-12 text-gray-300 mb-4" />
                <h3 className="text-lg font-medium mb-2">Coming Soon</h3>
                <p>The account metrics feature is under development and will be available soon.</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle>Trading Settings</CardTitle>
              <CardDescription>Configure your trading parameters</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="p-8 text-center text-gray-500">
                <Settings className="mx-auto h-12 w-12 text-gray-300 mb-4" />
                <h3 className="text-lg font-medium mb-2">Coming Soon</h3>
                <p>The trading settings feature is under development and will be available soon.</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </Layout>
  );
};

export default TradeTracking;
