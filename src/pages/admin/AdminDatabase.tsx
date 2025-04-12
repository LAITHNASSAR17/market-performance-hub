
import React, { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Database, HardDrive, RefreshCw, Download, Play, AlertCircle } from 'lucide-react';
import { AdminController } from '@/controllers/AdminController';

interface TableStructure {
  Field: string;
  Type: string;
  Null: string;
  Key: string;
  Default: string | null;
  Extra: string;
}

const AdminDatabase: React.FC = () => {
  const [tables, setTables] = useState<string[]>([
    'users', 'trades', 'tags', 'settings', 'notes', 'calendar_events'
  ]);
  const [selectedTable, setSelectedTable] = useState<string>('users');
  const [tableStructure, setTableStructure] = useState<TableStructure[]>([]);
  const [tableData, setTableData] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const { toast } = useToast();
  
  const adminController = new AdminController();

  const loadTableStructure = async (tableName: string) => {
    setLoading(true);
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
    } finally {
      setLoading(false);
    }
  };

  const handleSelectTable = (tableName: string) => {
    setSelectedTable(tableName);
    loadTableStructure(tableName);
  };

  const handleRefresh = () => {
    loadTableStructure(selectedTable);
    toast({
      title: "Refreshed",
      description: `Table ${selectedTable} refreshed`
    });
  };

  const handleBackupDatabase = async () => {
    try {
      const result = await adminController.createSystemBackup();
      if (result.success) {
        toast({
          title: "Backup Created",
          description: `Backup file: ${result.filename}`
        });
      }
    } catch (error) {
      console.error("Error creating backup:", error);
      toast({
        title: "Error",
        description: "Failed to create backup",
        variant: "destructive"
      });
    }
  };

  const handleRunQuery = () => {
    toast({
      title: "Feature Not Available",
      description: "SQL query execution is not available in this demo",
      variant: "destructive"
    });
  };

  return (
    <>
      <header className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
          Database Management
        </h1>
        <div className="flex justify-between items-center mt-1">
          <p className="text-sm md:text-base text-gray-500 dark:text-gray-400">
            Manage database tables and run queries.
          </p>
          <div className="space-x-2">
            <Button 
              onClick={handleBackupDatabase}
              variant="outline"
              size="sm"
            >
              <Download className="h-4 w-4 mr-2" />
              Backup Database
            </Button>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Database Tables</CardTitle>
            <CardDescription>Select a table to view</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              {tables.map((table) => (
                <Button
                  key={table}
                  variant={selectedTable === table ? "default" : "outline"}
                  className="w-full justify-start mb-1"
                  onClick={() => handleSelectTable(table)}
                >
                  <Database className="h-4 w-4 mr-2" />
                  {table}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="lg:col-span-3 space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Table: {selectedTable}</CardTitle>
                <CardDescription>Structure and data</CardDescription>
              </div>
              <Button variant="outline" size="sm" onClick={handleRefresh}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="structure">
                <TabsList className="mb-4">
                  <TabsTrigger value="structure">Structure</TabsTrigger>
                  <TabsTrigger value="data">Data</TabsTrigger>
                  <TabsTrigger value="query">SQL Query</TabsTrigger>
                </TabsList>
                
                <TabsContent value="structure">
                  {loading ? (
                    <div className="p-8 text-center">
                      <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
                      <p className="mt-2 text-gray-500">Loading table structure...</p>
                    </div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Field</TableHead>
                          <TableHead>Type</TableHead>
                          <TableHead>Null</TableHead>
                          <TableHead>Key</TableHead>
                          <TableHead>Default</TableHead>
                          <TableHead>Extra</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {tableStructure.map((column, index) => (
                          <TableRow key={index}>
                            <TableCell className="font-medium">{column.Field}</TableCell>
                            <TableCell>{column.Type}</TableCell>
                            <TableCell>{column.Null}</TableCell>
                            <TableCell>{column.Key}</TableCell>
                            <TableCell>{column.Default}</TableCell>
                            <TableCell>{column.Extra}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </TabsContent>
                
                <TabsContent value="data">
                  {loading ? (
                    <div className="p-8 text-center">
                      <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
                      <p className="mt-2 text-gray-500">Loading table data...</p>
                    </div>
                  ) : tableData.length > 0 ? (
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            {Object.keys(tableData[0]).map((key) => (
                              <TableHead key={key}>{key}</TableHead>
                            ))}
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {tableData.map((row, rowIndex) => (
                            <TableRow key={rowIndex}>
                              {Object.entries(row).map(([key, value], cellIndex) => (
                                <TableCell key={cellIndex}>
                                  {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                                </TableCell>
                              ))}
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  ) : (
                    <div className="p-8 text-center text-gray-500">No data available</div>
                  )}
                </TabsContent>
                
                <TabsContent value="query">
                  <div className="space-y-4">
                    <textarea 
                      className="w-full h-32 p-3 border border-gray-300 rounded"
                      placeholder="Enter SQL query here..."
                    />
                    <div className="flex justify-between">
                      <div className="flex items-center text-amber-600">
                        <AlertCircle className="h-4 w-4 mr-2" />
                        <span className="text-xs">Use with caution. Changes may affect your application.</span>
                      </div>
                      <Button onClick={handleRunQuery}>
                        <Play className="h-4 w-4 mr-2" />
                        Run Query
                      </Button>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
};

export default AdminDatabase;
