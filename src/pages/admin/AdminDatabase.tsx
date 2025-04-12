
import React, { useState, useEffect } from 'react';
import { Database, Table, RefreshCw, Download, Search, Server, List, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { AdminController } from '@/controllers/AdminController';
import { useToast } from '@/hooks/use-toast';

const AdminDatabase = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('status');
  const [loading, setLoading] = useState(false);
  const [dbStatus, setDbStatus] = useState<{status: string, tables: number, size: string}>({
    status: 'Unknown',
    tables: 0,
    size: '0 MB'
  });
  const [logs, setLogs] = useState<any[]>([]);
  const [tables, setTables] = useState<string[]>(['users', 'trades', 'tags', 'notes', 'settings']);
  const [currentTable, setCurrentTable] = useState<string>('');
  const [tableStructure, setTableStructure] = useState<any[]>([]);
  const [tableData, setTableData] = useState<any[]>([]);
  
  const adminController = new AdminController();

  useEffect(() => {
    loadDatabaseStatus();
    loadSystemLogs();
  }, []);

  const loadDatabaseStatus = async () => {
    setLoading(true);
    try {
      const status = await adminController.getDatabaseStatus();
      setDbStatus(status);
    } catch (error) {
      console.error("Error loading database status:", error);
      toast({
        title: "Error",
        description: "Failed to load database status",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const loadSystemLogs = async () => {
    try {
      const systemLogs = await adminController.getSystemLogs(100);
      setLogs(systemLogs);
    } catch (error) {
      console.error("Error loading system logs:", error);
      toast({
        title: "Error",
        description: "Failed to load system logs",
        variant: "destructive"
      });
    }
  };

  const handleTableSelect = async (tableName: string) => {
    setCurrentTable(tableName);
    try {
      const structure = await adminController.getDatabaseTableStructure(tableName);
      setTableStructure(structure);
      
      const data = await adminController.getDatabaseTableData(tableName);
      setTableData(data);
    } catch (error) {
      console.error(`Error loading table ${tableName}:`, error);
      toast({
        title: "Error",
        description: `Failed to load table ${tableName}`,
        variant: "destructive"
      });
    }
  };

  const handleBackup = async () => {
    setLoading(true);
    try {
      const result = await adminController.createSystemBackup();
      if (result.success) {
        toast({
          title: "Backup Successful",
          description: `Backup created: ${result.filename}`
        });
      } else {
        throw new Error("Failed to create backup");
      }
    } catch (error) {
      console.error("Error creating backup:", error);
      toast({
        title: "Backup Failed",
        description: "Failed to create system backup",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-6">
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Database Management
        </h1>
        <p className="text-gray-500 dark:text-gray-400">
          Monitor and manage the application database.
        </p>
      </header>
      
      <div className="flex flex-wrap gap-4 mb-6">
        <Button 
          variant="outline" 
          onClick={loadDatabaseStatus}
          disabled={loading}
          className="flex items-center gap-2"
        >
          <RefreshCw className="h-4 w-4" />
          Refresh Status
        </Button>
        
        <Button 
          onClick={handleBackup}
          disabled={loading}
          className="flex items-center gap-2"
        >
          <Download className="h-4 w-4" />
          Backup Database
        </Button>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="status" className="flex items-center gap-2">
            <Server className="h-4 w-4" />
            Status
          </TabsTrigger>
          <TabsTrigger value="structure" className="flex items-center gap-2">
            <Table className="h-4 w-4" />
            Tables
          </TabsTrigger>
          <TabsTrigger value="logs" className="flex items-center gap-2">
            <List className="h-4 w-4" />
            Logs
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="status" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Database Status</CardTitle>
              <CardDescription>Current status of the application database</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Status</h3>
                  <div className="mt-1 flex items-center">
                    <span className={`inline-block h-3 w-3 rounded-full mr-2 ${
                      dbStatus.status === 'Connected' ? 'bg-green-500' : 'bg-red-500'
                    }`}></span>
                    <span className="text-lg font-semibold">{dbStatus.status}</span>
                  </div>
                </div>
                
                <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Tables</h3>
                  <p className="mt-1 text-lg font-semibold">{dbStatus.tables}</p>
                </div>
                
                <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Size</h3>
                  <p className="mt-1 text-lg font-semibold">{dbStatus.size}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="structure" className="space-y-4">
          <div className="grid md:grid-cols-4 gap-4">
            <div className="md:col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle>Tables</CardTitle>
                </CardHeader>
                <CardContent>
                  <nav className="space-y-1">
                    {tables.map(table => (
                      <Button
                        key={table}
                        variant={currentTable === table ? "default" : "ghost"}
                        className="w-full justify-start text-left"
                        onClick={() => handleTableSelect(table)}
                      >
                        <Database className="h-4 w-4 mr-2" />
                        {table}
                      </Button>
                    ))}
                  </nav>
                </CardContent>
              </Card>
            </div>
            
            <div className="md:col-span-3">
              {currentTable ? (
                <Card>
                  <CardHeader>
                    <CardTitle>Table: {currentTable}</CardTitle>
                    <CardDescription>Structure and data</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {/* Table content would go here */}
                    <div className="text-center py-8 text-gray-500">
                      <p>Table preview is simulated in this demo.</p>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardContent className="text-center py-12">
                    <Database className="h-12 w-12 mx-auto text-gray-300 mb-4" />
                    <p className="text-gray-500">Select a table to view its structure and data</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="logs" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>System Logs</CardTitle>
              <CardDescription>Recent system and database events</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {logs.length > 0 ? (
                  logs.map((log, index) => (
                    <div 
                      key={index}
                      className="p-3 bg-gray-50 dark:bg-gray-800 rounded-md flex items-start gap-3"
                    >
                      {log.level === 'WARNING' ? (
                        <AlertTriangle className="h-5 w-5 text-amber-500 mt-1 flex-shrink-0" />
                      ) : (
                        <Database className="h-5 w-5 text-blue-500 mt-1 flex-shrink-0" />
                      )}
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant={log.level === 'WARNING' ? "outline" : "default"}>
                            {log.level}
                          </Badge>
                          <span className="text-xs text-gray-500">
                            {new Date(log.timestamp).toLocaleString()}
                          </span>
                        </div>
                        <p className="text-sm">{log.message}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <p>No logs available</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminDatabase;
