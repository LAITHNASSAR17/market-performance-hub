
import React, { useState, useEffect } from 'react';
import { useMySQL, type MySQLTable } from '@/contexts/MySQLContext';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertCircle, Database, Server, Table2, RefreshCw, Download, Eye, Code } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';

const AdminDatabase: React.FC = () => {
  const { toast } = useToast();
  const { 
    config, 
    setConfig, 
    connectionStatus, 
    connect, 
    disconnect, 
    tables,
    executeQuery,
    fetchTableStructure,
    fetchTableData
  } = useMySQL();
  
  const [selectedTable, setSelectedTable] = useState<string>('');
  const [tableStructure, setTableStructure] = useState<any[]>([]);
  const [tableData, setTableData] = useState<any[]>([]);
  const [sqlQuery, setSqlQuery] = useState<string>('');
  const [queryResults, setQueryResults] = useState<any[] | null>(null);
  const [queryResultMessage, setQueryResultMessage] = useState<string>('');
  const [isLoadingData, setIsLoadingData] = useState<boolean>(false);

  // Handle table selection
  useEffect(() => {
    if (selectedTable && connectionStatus === 'connected') {
      loadTableDetails(selectedTable);
    }
  }, [selectedTable]);

  const loadTableDetails = async (tableName: string) => {
    try {
      setIsLoadingData(true);
      
      // Load table structure (columns)
      const structure = await fetchTableStructure(tableName);
      setTableStructure(structure);
      
      // Load table data (sample rows)
      const data = await fetchTableData(tableName, 10);
      setTableData(data);
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to load table details",
        variant: "destructive"
      });
    } finally {
      setIsLoadingData(false);
    }
  };

  const handleConnect = async () => {
    await connect();
  };

  const handleDisconnect = () => {
    disconnect();
    setSelectedTable('');
    setTableStructure([]);
    setTableData([]);
    setQueryResults(null);
  };

  const handleExecuteQuery = async () => {
    if (!sqlQuery.trim()) {
      toast({
        title: "Empty Query",
        description: "Please enter a SQL query to execute",
        variant: "destructive"
      });
      return;
    }

    try {
      setIsLoadingData(true);
      const result = await executeQuery(sqlQuery);
      
      // Handle different types of results
      if (Array.isArray(result)) {
        setQueryResults(result);
        setQueryResultMessage(`Query returned ${result.length} rows`);
      } else if (typeof result === 'object') {
        setQueryResults(null);
        if (result.affectedRows !== undefined) {
          setQueryResultMessage(`Query executed successfully. ${result.affectedRows} rows affected.`);
        } else {
          setQueryResultMessage('Query executed successfully.');
        }
      }
    } catch (error) {
      toast({
        title: "Query Error",
        description: error instanceof Error ? error.message : "Error executing query",
        variant: "destructive"
      });
      setQueryResults(null);
      setQueryResultMessage('');
    } finally {
      setIsLoadingData(false);
    }
  };

  return (
    <div>
      <header className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
          MySQL Database Management
        </h1>
        <p className="mt-1 text-sm md:text-base text-gray-500 dark:text-gray-400">
          Connect and manage MySQL database resources.
        </p>
      </header>

      <Alert className="mb-6">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Integration Note</AlertTitle>
        <AlertDescription>
          This is a simulated MySQL interface for demonstration. Full functionality requires backend integration.
        </AlertDescription>
      </Alert>

      <Tabs defaultValue="connection" className="w-full">
        <TabsList className="grid grid-cols-3 mb-4">
          <TabsTrigger value="connection">Connection</TabsTrigger>
          <TabsTrigger value="tables" disabled={connectionStatus !== 'connected'}>Tables</TabsTrigger>
          <TabsTrigger value="query" disabled={connectionStatus !== 'connected'}>Query</TabsTrigger>
        </TabsList>

        {/* Connection Tab */}
        <TabsContent value="connection">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Database className="mr-2 h-5 w-5" />
                MySQL Connection
              </CardTitle>
              <CardDescription>
                Configure your MySQL database connection settings.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="host">Host</Label>
                    <div className="flex items-center">
                      <Server className="mr-2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="host"
                        placeholder="localhost or IP address"
                        value={config.host}
                        onChange={(e) => setConfig({...config, host: e.target.value})}
                        disabled={connectionStatus === 'connected'}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="port">Port</Label>
                    <Input
                      id="port"
                      placeholder="3306"
                      value={config.port}
                      onChange={(e) => setConfig({...config, port: e.target.value})}
                      disabled={connectionStatus === 'connected'}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="username">Username</Label>
                  <Input
                    id="username"
                    placeholder="Database username"
                    value={config.username}
                    onChange={(e) => setConfig({...config, username: e.target.value})}
                    disabled={connectionStatus === 'connected'}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Database password"
                    value={config.password}
                    onChange={(e) => setConfig({...config, password: e.target.value})}
                    disabled={connectionStatus === 'connected'}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="database">Database Name</Label>
                  <Input
                    id="database"
                    placeholder="Database name"
                    value={config.database}
                    onChange={(e) => setConfig({...config, database: e.target.value})}
                    disabled={connectionStatus === 'connected'}
                  />
                </div>

                <div className="flex justify-end space-x-2">
                  {connectionStatus === 'connected' ? (
                    <Button variant="destructive" onClick={handleDisconnect}>
                      Disconnect
                    </Button>
                  ) : (
                    <Button onClick={handleConnect}>
                      Connect
                    </Button>
                  )}
                </div>

                {connectionStatus === 'connected' && (
                  <div className="mt-4 p-3 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-md text-green-700 dark:text-green-300">
                    Connected to database: {config.database} on {config.host}:{config.port}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tables Tab */}
        <TabsContent value="tables">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Table2 className="mr-2 h-5 w-5" />
                Database Tables
              </CardTitle>
              <CardDescription>
                View and manage tables in your MySQL database.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col space-y-4">
                <div className="flex space-x-4">
                  <div className="w-1/3">
                    <Label htmlFor="table-select" className="mb-2 block">Select Table</Label>
                    <Select value={selectedTable} onValueChange={setSelectedTable}>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose a table" />
                      </SelectTrigger>
                      <SelectContent>
                        {tables.map(table => (
                          <SelectItem key={table.name} value={table.name}>
                            {table.name} ({table.rowCount} rows)
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="flex items-end">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => selectedTable && loadTableDetails(selectedTable)}
                      disabled={!selectedTable || isLoadingData}
                      className="flex items-center"
                    >
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Refresh
                    </Button>
                  </div>
                </div>
                
                {selectedTable && (
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-lg font-medium mb-2">Table Structure</h3>
                      <div className="border rounded-md overflow-x-auto">
                        <table className="w-full">
                          <thead>
                            <tr className="bg-muted/50 border-b">
                              <th className="px-4 py-2 text-left">Column</th>
                              <th className="px-4 py-2 text-left">Type</th>
                              <th className="px-4 py-2 text-left">Null</th>
                              <th className="px-4 py-2 text-left">Key</th>
                              <th className="px-4 py-2 text-left">Default</th>
                              <th className="px-4 py-2 text-left">Extra</th>
                            </tr>
                          </thead>
                          <tbody>
                            {isLoadingData ? (
                              <tr>
                                <td colSpan={6} className="px-4 py-3 text-center">Loading structure...</td>
                              </tr>
                            ) : tableStructure.length > 0 ? (
                              tableStructure.map((column, index) => (
                                <tr key={index} className="border-b hover:bg-muted/20">
                                  <td className="px-4 py-2 font-medium">{column.name}</td>
                                  <td className="px-4 py-2">{column.type}</td>
                                  <td className="px-4 py-2">{column.nullable ? 'YES' : 'NO'}</td>
                                  <td className="px-4 py-2">{column.key}</td>
                                  <td className="px-4 py-2">{column.default || 'NULL'}</td>
                                  <td className="px-4 py-2">{column.extra}</td>
                                </tr>
                              ))
                            ) : (
                              <tr>
                                <td colSpan={6} className="px-4 py-3 text-center">No structure information available</td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                    
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <h3 className="text-lg font-medium">Table Data (Sample)</h3>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="flex items-center"
                          disabled={isLoadingData}
                        >
                          <Download className="h-4 w-4 mr-2" />
                          Export
                        </Button>
                      </div>
                      
                      <div className="border rounded-md overflow-x-auto">
                        {isLoadingData ? (
                          <div className="p-4 text-center">Loading data...</div>
                        ) : tableData.length > 0 ? (
                          <table className="w-full">
                            <thead>
                              <tr className="bg-muted/50 border-b">
                                {Object.keys(tableData[0]).map((column) => (
                                  <th key={column} className="px-4 py-2 text-left">{column}</th>
                                ))}
                              </tr>
                            </thead>
                            <tbody>
                              {tableData.map((row, rowIndex) => (
                                <tr key={rowIndex} className="border-b hover:bg-muted/20">
                                  {Object.values(row).map((value, colIndex) => (
                                    <td key={colIndex} className="px-4 py-2">
                                      {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                                    </td>
                                  ))}
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        ) : (
                          <div className="p-4 text-center">No data available</div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
                
                {!selectedTable && tables.length > 0 && (
                  <div className="border rounded-md divide-y">
                    {tables.map((table, index) => (
                      <div key={index} className="flex items-center justify-between p-3">
                        <span className="font-medium">{table.name}</span>
                        <div className="space-x-2">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => setSelectedTable(table.name)}
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            View
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                
                {!selectedTable && tables.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    No tables found in the database.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Query Tab */}
        <TabsContent value="query">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Code className="mr-2 h-5 w-5" />
                SQL Query
              </CardTitle>
              <CardDescription>
                Execute SQL queries directly on your MySQL database.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="query">SQL Query</Label>
                  <textarea
                    id="query"
                    rows={5}
                    className="w-full p-3 border rounded-md font-mono text-sm bg-slate-50 dark:bg-slate-900"
                    placeholder="SELECT * FROM users LIMIT 10;"
                    value={sqlQuery}
                    onChange={(e) => setSqlQuery(e.target.value)}
                  />
                </div>
                <div className="flex justify-end">
                  <Button 
                    onClick={handleExecuteQuery} 
                    disabled={!sqlQuery.trim() || isLoadingData}
                  >
                    {isLoadingData ? 'Executing...' : 'Execute Query'}
                  </Button>
                </div>
                
                {queryResultMessage && (
                  <div className="p-3 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-md text-blue-700 dark:text-blue-300">
                    {queryResultMessage}
                  </div>
                )}
                
                {queryResults && queryResults.length > 0 && (
                  <div className="border rounded-md overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="bg-muted/50 border-b">
                          {Object.keys(queryResults[0]).map((column) => (
                            <th key={column} className="px-4 py-2 text-left">{column}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {queryResults.map((row, rowIndex) => (
                          <tr key={rowIndex} className="border-b hover:bg-muted/20">
                            {Object.values(row).map((value, colIndex) => (
                              <td key={colIndex} className="px-4 py-2">
                                {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
                
                {queryResults && queryResults.length === 0 && (
                  <div className="p-4 text-center border rounded-md">
                    Query executed successfully, but returned no results.
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
