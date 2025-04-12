
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AdminController } from '@/controllers/AdminController';
import AdminLayout from '@/components/layouts/AdminLayout';
import { useToast } from '@/hooks/use-toast';

import { 
  UserCheck, 
  UserX, 
  Database, 
  FileUp, 
  Settings, 
  Users,
  AlertTriangle,
  Server,
  FileText,
  BarChart3
} from 'lucide-react';

import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';

import { Button } from '@/components/ui/button';
import StatCard from '@/components/StatCard';

const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<any>({
    totalUsers: 0,
    activeUsers: 0,
    blockedUsers: 0,
    totalTrades: 0,
    recentTrades: 0,
    totalProfitLoss: 0,
    totalTags: 0,
    popularTags: [],
    systemHealth: {
      databaseStatus: 'online',
      lastBackup: null,
      errorCount: 0
    }
  });
  
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();
  const adminController = new AdminController();

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setLoading(true);
      const dashboardStats = await adminController.getDashboardStats();
      setStats(dashboardStats);
    } catch (error) {
      console.error("Error loading admin stats:", error);
      toast({
        title: "Error",
        description: "Failed to load dashboard statistics",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleBackupDatabase = async () => {
    try {
      const result = await adminController.backupDatabase();
      if (result) {
        toast({
          title: "Backup Successful",
          description: "Database backup has been created"
        });
      } else {
        throw new Error("Backup failed");
      }
    } catch (error) {
      console.error("Error backing up database:", error);
      toast({
        title: "Backup Failed",
        description: "Could not create database backup",
        variant: "destructive"
      });
    }
  };

  const handleExportReports = async () => {
    try {
      // Generate a simple report CSV
      const headers = "Metric,Value\n";
      const reportData = [
        `Total Users,${stats.totalUsers}`,
        `Active Users,${stats.activeUsers}`,
        `Blocked Users,${stats.blockedUsers}`,
        `Total Trades,${stats.totalTrades}`,
        `Recent Trades,${stats.recentTrades}`,
        `Total P&L,$${stats.totalProfitLoss.toFixed(2)}`
      ].join("\n");
      
      const csv = headers + reportData;
      
      // Create download link
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.setAttribute('hidden', '');
      a.setAttribute('href', url);
      a.setAttribute('download', 'admin-report.csv');
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      
      toast({
        title: "Export Complete",
        description: "Admin reports exported to CSV"
      });
    } catch (error) {
      console.error("Error exporting reports:", error);
      toast({
        title: "Export Failed",
        description: "Could not export reports",
        variant: "destructive"
      });
    }
  };

  const handleManageUsers = () => {
    navigate('/admin/users');
  };

  const handleSystemSettings = () => {
    navigate('/admin/settings');
  };

  // Card for Quick Actions
  const QuickActions = () => (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">Quick Actions</CardTitle>
        <CardDescription>Frequently used administrative tools</CardDescription>
      </CardHeader>
      <CardContent className="grid grid-cols-2 gap-4">
        <Button 
          variant="outline" 
          className="flex flex-col items-center justify-center h-24 text-center p-2" 
          onClick={handleBackupDatabase}
        >
          <Database className="h-8 w-8 mb-2 text-blue-600" />
          <span>Backup Database</span>
        </Button>
        
        <Button 
          variant="outline" 
          className="flex flex-col items-center justify-center h-24 text-center p-2"
          onClick={handleExportReports}
        >
          <FileUp className="h-8 w-8 mb-2 text-green-600" />
          <span>Export Reports</span>
        </Button>
        
        <Button 
          variant="outline" 
          className="flex flex-col items-center justify-center h-24 text-center p-2"
          onClick={handleManageUsers}
        >
          <Users className="h-8 w-8 mb-2 text-purple-600" />
          <span>Manage Users</span>
        </Button>
        
        <Button 
          variant="outline" 
          className="flex flex-col items-center justify-center h-24 text-center p-2"
          onClick={handleSystemSettings}
        >
          <Settings className="h-8 w-8 mb-2 text-gray-600" />
          <span>System Settings</span>
        </Button>
      </CardContent>
    </Card>
  );

  // System Health Card
  const SystemHealth = () => (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">System Health</CardTitle>
        <CardDescription>Current system status and metrics</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Server className="h-5 w-5 text-blue-600" />
            <span>Database Status</span>
          </div>
          <div className={`font-medium ${stats.systemHealth.databaseStatus === 'online' ? 'text-green-600' : 'text-red-600'}`}>
            {stats.systemHealth.databaseStatus === 'online' ? 'Online' : 'Offline'}
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Database className="h-5 w-5 text-blue-600" />
            <span>Last Backup</span>
          </div>
          <div className="font-medium">
            {stats.systemHealth.lastBackup 
              ? new Date(stats.systemHealth.lastBackup).toLocaleString() 
              : 'Never'}
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-600" />
            <span>Error Count (24h)</span>
          </div>
          <div className={`font-medium ${stats.systemHealth.errorCount > 0 ? 'text-amber-600' : 'text-green-600'}`}>
            {stats.systemHealth.errorCount}
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button variant="outline" className="w-full" onClick={handleBackupDatabase}>
          Create New Backup
        </Button>
      </CardFooter>
    </Card>
  );

  return (
    <AdminLayout>
      <div className="space-y-6">
        <header>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">Admin Dashboard</h1>
          <p className="mt-1 text-sm md:text-base text-gray-500 dark:text-gray-400">
            Overview of system status and operations.
          </p>
        </header>

        {loading ? (
          <div className="p-8 text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
            <p className="mt-2 text-gray-500 dark:text-gray-400">Loading dashboard statistics...</p>
          </div>
        ) : (
          <>
            {/* Stats Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard 
                title="Total Users"
                value={stats.totalUsers}
                icon={<Users className="h-5 w-5" />}
                color="default"
                description={`Active: ${stats.activeUsers}`}
              />
              
              <StatCard 
                title="Total Trades"
                value={stats.totalTrades}
                icon={<BarChart3 className="h-5 w-5" />}
                color="default"
                description={`Recent: ${stats.recentTrades}`}
              />
              
              <StatCard 
                title="Total P&L"
                value={`$${stats.totalProfitLoss.toFixed(2)}`}
                icon={<FileText className="h-5 w-5" />}
                color={stats.totalProfitLoss > 0 ? "green" : stats.totalProfitLoss < 0 ? "red" : "default"}
                trend={stats.totalProfitLoss > 0 ? 'up' : stats.totalProfitLoss < 0 ? 'down' : 'neutral'}
              />
              
              <StatCard 
                title="Blocked Users"
                value={stats.blockedUsers}
                icon={<UserX className="h-5 w-5" />}
                color="red"
                description={stats.blockedUsers > 0 ? `${stats.blockedUsers} of ${stats.totalUsers}` : 'None'}
              />
            </div>

            {/* Quick Actions & System Health */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <QuickActions />
              <SystemHealth />
            </div>
          </>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
