import React, { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import AdminLayout from '@/components/layouts/AdminLayout';
import { AdminController } from '@/controllers/AdminController';
import { useMongoDBContext } from '@/contexts/MongoDBContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Database, Save, RefreshCw, Table, FileDown, FilePlus2, Play } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

const AdminDatabase: React.FC = () => {
  const { toast } = useToast();
  const adminController = new AdminController();
  const { 
    connect, 
    disconnect, 
    isConfigured, 
    config, 
    setConfig, 
    connectionStatus, 
    collections, 
    fetchCollections, 
    executeQuery 
  } = useMongoDBContext();

  const [dbStatus, setDbStatus] = useState<{status: string, tables: number, size: string} | null>(null);
  const [loading, setLoading] = useState(false);
  const [backupLoading, setBackupLoading] = useState(false);
  const [sqlQuery, setSqlQuery] = useState('');
  const [queryResult, setQueryResult] = useState<any>(null);
  const [selectedTable, setSelectedTable] = useState<string>('');
  const [tableData, setTableData] = useState<any[]>([]);
  const [tableColumns, setTableColumns] = useState<string[]>([]);

  useEffect(() => {
    loadDbStatus();
  }, []);

  const loadDbStatus = async () => {
    try {
      const status = await adminController.getDatabaseStatus();
      setDbStatus(status);
    } catch (error) {
      console.error("Error loading database status:", error);
    }
  };

  const handleConnect = async () => {
    setLoading(true);
    try {
      await connect();
      if (connectionStatus === 'connected') {
        await fetchCollections();
      }
    } catch (error) {
      console.error("Error connecting to database:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDisconnect = () => {
    disconnect();
    setSelectedTable('');
    setTableData([]);
    setTableColumns([]);
  };

  const handleBackupDatabase = async () => {
    setBackupLoading(true);
    try {
      const result = await adminController.backupDatabase();
      if (result) {
        toast({
          title: "Backup Successful",
          description: "Database has been backed up successfully"
        });
      } else {
        throw new Error("Backup failed");
      }
    } catch (error) {
      console.error("Error backing up database:", error);
      toast({
        title: "Backup Failed",
        description: "Failed to backup database",
        variant: "destructive"
      });
    } finally {
      setBackupLoading(false);
    }
  };

  const handleExecuteQuery = async () => {
    if (!sqlQuery.trim()) {
      toast({
        title: "Empty Query",
        description: "Please enter a MongoDB query",
        variant: "destructive"
      });
      return;
    }

    try {
      const result = await executeQuery(sqlQuery);
      setQueryResult(result);
      if (result.success) {
        toast({
          title: "Query Executed",
          description: result.data ? `Returned ${Array.isArray(result.data) ? result.data.length : 1} results` 
            : `Affected ${result.modifiedCount || 0} documents`
        });
      } else {
        toast({
          title: "Query Failed",
          description: result.error || "Unknown error",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Error executing query:", error);
      setQueryResult({ success: false, error: error instanceof Error ? error.message : "Unknown error" });
    }
  };

  const handleSelectTable = async (collectionName: string) => {
    setSelectedTable(collectionName);
    try {
      // Fetch collection structure to get fields
      const structure = await adminController.getDatabaseTableStructure(collectionName);
      if (structure && Array.isArray(structure)) {
        setTableColumns(structure.map(col => col.Field || col.name));
      } else {
        setTableColumns([]);
      }
      
      // Fetch sample data
      const data = await adminController.getDatabaseTableData(collectionName);
      setTableData(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error(`Error fetching data for collection ${collectionName}:`, error);
      setTableColumns([]);
      setTableData([]);
    }
  };

  return (
    <AdminLayout>
      <header className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
          Database Management
        </h1>
        <p className="mt-1 text-sm md:text-base text-gray-500 dark:text-gray-400">
          Connect to MongoDB database and perform operations.
        </p>
      </header>

      <div className="grid gap-6">
        {/* Connection Status Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Database className="mr-2 h-5 w-5" />
              MongoDB Connection
            </CardTitle>
            <CardDescription>
              {connectionStatus === 'connected' 
                ? `Connected to ${config.database}`
                : 'Configure your MongoDB connection'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {connectionStatus !== 'connected' ? (
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium mb-1">Connection String</label>
                  <Input
                    value={config.connectionString}
                    onChange={(e) => setConfig({ ...config, connectionString: e.target.value })}
                    placeholder="mongodb://localhost:27017"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Database</label>
                  <Input
                    value={config.database}
                    onChange={(e) => setConfig({ ...config, database: e.target.value })}
                    placeholder="trading_journal"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Username</label>
                  <Input
                    value={config.username}
                    onChange={(e) => setConfig({ ...config, username: e.target.value })}
                    placeholder="admin"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Password</label>
                  <Input
                    type="password"
                    value={config.password}
                    onChange={(e) => setConfig({ ...config, password: e.target.value })}
                    placeholder="********"
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">Status:</span>
                  <span className="text-green-600 dark:text-green-400">Connected</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">Database:</span>
                  <span>{config.database}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">Collections:</span>
                  <span>{collections.length}</span>
                </div>
              </div>
            )}
          </CardContent>
          <CardFooter className="flex justify-between">
            {connectionStatus === 'connected' ? (
              <>
                <Button variant="outline" onClick={handleDisconnect}>
                  Disconnect
                </Button>
                <Button 
                  variant="outline" 
                  onClick={handleBackupDatabase} 
                  disabled={backupLoading}
                  className="flex items-center"
                >
                  {backupLoading ? (
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="mr-2 h-4 w-4" />
                  )}
                  Backup Database
                </Button>
              </>
            ) : (
              <Button 
                onClick={handleConnect} 
                disabled={loading || !isConfigured}
                className="flex items-center"
              >
                {loading ? (
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Database className="mr-2 h-4 w-4" />
                )}
                Connect
              </Button>
            )}
          </CardFooter>
        </Card>

        {/* Database Tools */}
        {connectionStatus === 'connected' && (
          <Tabs defaultValue="query" className="w-full">
            <TabsList className="mb-6">
              <TabsTrigger value="query" className="flex items-center">
                <Play className="mr-2 h-4 w-4" />
                MongoDB Query
              </TabsTrigger>
              <TabsTrigger value="collections" className="flex items-center">
                <Table className="mr-2 h-4 w-4" />
                Collections
              </TabsTrigger>
              <TabsTrigger value="export" className="flex items-center">
                <FileDown className="mr-2 h-4 w-4" />
                Export
              </TabsTrigger>
              <TabsTrigger value="import" className="flex items-center">
                <FilePlus2 className="mr-2 h-4 w-4" />
                Import
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="query">
              <Card>
                <CardHeader>
                  <CardTitle>MongoDB Query</CardTitle>
                  <CardDescription>
                    Execute custom MongoDB queries on the database
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <Textarea
                      value={sqlQuery}
                      onChange={(e) => setSqlQuery(e.target.value)}
                      placeholder='db.users.find({isAdmin: true})'
                      className="font-mono h-32"
                    />
                    
                    {queryResult && (
                      <div className="border rounded-md overflow-hidden">
                        {queryResult.success ? (
                          queryResult.data && Array.isArray(queryResult.data) ? (
                            <div className="overflow-x-auto">
                              <table className="w-full text-sm">
                                <thead className="bg-gray-100 dark:bg-gray-800">
                                  <tr>
                                    {queryResult.data.length > 0 && 
                                      Object.keys(queryResult.data[0]).map((col, i) => (
                                        <th key={i} className="px-4 py-2 text-left font-medium">{col}</th>
                                      ))
                                    }
                                  </tr>
                                </thead>
                                <tbody>
                                  {queryResult.data.map((row, i) => (
                                    <tr key={i} className="border-t">
                                      {Object.values(row).map((cell, j) => (
                                        <td key={j} className="px-4 py-2">{String(cell)}</td>
                                      ))}
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          ) : (
                            <div className="p-4 text-green-600">
                              Query executed successfully. {queryResult.modifiedCount && `Modified documents: ${queryResult.modifiedCount}`}
                            </div>
                          )
                        ) : (
                          <div className="p-4 text-red-600">
                            {queryResult.error || 'Error executing query'}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </CardContent>
                <CardFooter className="flex justify-end">
                  <Button onClick={handleExecuteQuery}>Execute Query</Button>
                </CardFooter>
              </Card>
            </TabsContent>
            
            <TabsContent value="collections">
              <Card>
                <CardHeader>
                  <CardTitle>Database Collections</CardTitle>
                  <CardDescription>
                    Browse collections in the MongoDB database
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-4 gap-6">
                    <div className="border rounded-md overflow-hidden">
                      <div className="p-3 bg-gray-50 dark:bg-gray-800 font-medium">
                        Collections
                      </div>
                      <div className="p-2 max-h-96 overflow-y-auto">
                        <ul className="space-y-1">
                          {collections.map((collection) => (
                            <li key={collection.name}>
                              <button
                                onClick={() => handleSelectTable(collection.name)}
                                className={`w-full text-left px-3 py-2 rounded text-sm ${
                                  selectedTable === collection.name 
                                    ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400' 
                                    : 'hover:bg-gray-50 dark:hover:bg-gray-800'
                                }`}
                              >
                                {collection.name}
                              </button>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                    
                    <div className="md:col-span-3 border rounded-md overflow-hidden">
                      {selectedTable ? (
                        <div>
                          <div className="p-3 bg-gray-50 dark:bg-gray-800 font-medium flex items-center justify-between">
                            <span>Collection: {selectedTable}</span>
                            <span className="text-sm text-gray-500">
                              {tableData.length} documents
                            </span>
                          </div>
                          <div className="overflow-x-auto">
                            {tableColumns.length > 0 && tableData.length > 0 ? (
                              <table className="w-full text-sm">
                                <thead className="bg-gray-50 dark:bg-gray-800">
                                  <tr>
                                    {tableColumns.map((col, i) => (
                                      <th key={i} className="px-4 py-2 text-left font-medium">{col}</th>
                                    ))}
                                  </tr>
                                </thead>
                                <tbody>
                                  {tableData.slice(0, 10).map((row, i) => (
                                    <tr key={i} className="border-t">
                                      {tableColumns.map((col, j) => (
                                        <td key={j} className="px-4 py-2">{String(row[col] !== undefined ? row[col] : '')}</td>
                                      ))}
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            ) : (
                              <div className="p-4 text-center text-gray-500">
                                {tableData.length === 0 ? 'No data in collection' : 'Loading collection data...'}
                              </div>
                            )}
                          </div>
                          {tableData.length > 10 && (
                            <div className="p-2 text-center text-sm text-gray-500">
                              Showing 10 of {tableData.length} documents
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="p-8 text-center text-gray-500">
                          Select a collection to view its data
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="export">
              <Card>
                <CardHeader>
                  <CardTitle>Export Database</CardTitle>
                  <CardDescription>
                    Export database collections to JSON files
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="border rounded-md p-4">
                      <h3 className="font-medium mb-2">Select collections to export</h3>
                      <div className="grid grid-cols-3 gap-2 mb-4">
                        {collections.map((collection) => (
                          <label key={collection.name} className="flex items-center space-x-2">
                            <input type="checkbox" className="rounded" />
                            <span>{collection.name}</span>
                          </label>
                        ))}
                      </div>
                      <div className="flex space-x-4">
                        <div>
                          <label className="block text-sm font-medium mb-1">Export format</label>
                          <select className="w-full rounded-md border border-input px-3 py-2">
                            <option value="json">JSON</option>
                            <option value="csv">CSV</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1">Options</label>
                          <select className="w-full rounded-md border border-input px-3 py-2">
                            <option value="data">Data only</option>
                            <option value="structure">Structure only</option>
                            <option value="both">Both structure and data</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-end">
                  <Button>
                    <FileDown className="mr-2 h-4 w-4" />
                    Export Database
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>
            
            <TabsContent value="import">
              <Card>
                <CardHeader>
                  <CardTitle>Import Data</CardTitle>
                  <CardDescription>
                    Import data from JSON or CSV files
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="border-2 border-dashed rounded-md p-8 text-center">
                      <FilePlus2 className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                      <p className="mb-2 text-sm">Drag and drop JSON or CSV files here</p>
                      <p className="text-xs text-gray-500 mb-4">Or click to browse files</p>
                      <Button variant="outline" size="sm">
                        Choose File
                      </Button>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Import options</label>
                      <div className="grid grid-cols-2 gap-4">
                        <select className="rounded-md border border-input px-3 py-2">
                          <option value="add">Add to existing data</option>
                          <option value="replace">Replace existing data</option>
                        </select>
                        <select className="rounded-md border border-input px-3 py-2">
                          <option value="ignore">Ignore errors</option>
                          <option value="stop">Stop on error</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-end">
                  <Button disabled>
                    Import Data
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>
          </Tabs>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminDatabase;
