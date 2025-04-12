
import React, { useState, useEffect, useRef } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useMongoDB } from '@/contexts/MongoDBContext';
import {
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
  Table
} from '@/components/ui/table';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Database,
  Table as TableIcon,
  Play,
  Save,
  RefreshCw,
  Settings,
  AlertCircle,
  Check,
  Loader2,
  Plug2,
  ShieldAlert
} from 'lucide-react';

interface DatabaseViewProps {
  adminController: any;
}

const DatabaseView: React.FC<DatabaseViewProps> = ({ adminController }) => {
  const [activeTab, setActiveTab] = useState('connect');
  const [dbStatus, setDbStatus] = useState<any>(null);
  const [tables, setTables] = useState<any[]>([]);
  const [selectedTable, setSelectedTable] = useState<string | null>(null);
  const [tableData, setTableData] = useState<any[]>([]);
  const [tableStructure, setTableStructure] = useState<any[]>([]);
  const [queryResult, setQueryResult] = useState<any>(null);
  const [queryError, setQueryError] = useState<string | null>(null);
  const [queryLoading, setQueryLoading] = useState(false);
  const [queryHistory, setQueryHistory] = useState<string[]>([]);
  const [selectedHistoryIndex, setSelectedHistoryIndex] = useState(-1);
  
  const { 
    isConnected, 
    isConfigured, 
    connectionStatus, 
    config, 
    collections,
    connect, 
    disconnect, 
    fetchCollections,
    executeQuery,
    setConfig 
  } = useMongoDB();
  
  const queryTextareaRef = useRef<HTMLTextAreaElement>(null);
  const [query, setQuery] = useState(`db.collection.find({}).limit(10);`);
  
  useEffect(() => {
    if (isConnected) {
      fetchDatabaseStatus();
      fetchTables();
    }
  }, [isConnected]);
  
  const fetchDatabaseStatus = async () => {
    try {
      const status = await adminController.getDatabaseStatus();
      setDbStatus(status);
    } catch (error) {
      console.error('Error fetching database status:', error);
    }
  };
  
  const fetchTables = async () => {
    try {
      // In MongoDB context, we'd use collections instead of tables
      setTables(collections);
    } catch (error) {
      console.error('Error fetching tables:', error);
    }
  };
  
  const selectTable = async (tableName: string) => {
    setSelectedTable(tableName);
    try {
      // Get table structure (MongoDB schema)
      const structure = await adminController.getDatabaseTableStructure(tableName);
      setTableStructure(structure);
      
      // Get table data (MongoDB documents)
      const data = await adminController.getDatabaseTableData(tableName);
      setTableData(data);
    } catch (error) {
      console.error(`Error fetching data for table ${tableName}:`, error);
    }
  };
  
  const runQuery = async () => {
    setQueryLoading(true);
    setQueryError(null);
    setQueryResult(null);
    
    try {
      const result = await executeQuery(query);
      
      if (result.success) {
        setQueryResult(result.data);
        // Add to history if not already there
        if (!queryHistory.includes(query)) {
          setQueryHistory([...queryHistory, query]);
        }
      } else {
        setQueryError(result.error);
      }
    } catch (error) {
      setQueryError(error instanceof Error ? error.message : 'Unknown error executing query');
    } finally {
      setQueryLoading(false);
    }
  };
  
  const handleHistoryClick = (index: number) => {
    setSelectedHistoryIndex(index);
    setQuery(queryHistory[index]);
  };
  
  const handleConfigSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await connect();
    } catch (error) {
      console.error('Connection error:', error);
    }
  };
  
  const handleDisconnect = () => {
    disconnect();
    setSelectedTable(null);
    setTableData([]);
    setTableStructure([]);
  };
  
  const handleRefresh = () => {
    if (selectedTable) {
      selectTable(selectedTable);
    }
  };
  
  const copyQueryToClipboard = () => {
    if (queryTextareaRef.current) {
      queryTextareaRef.current.select();
      document.execCommand('copy');
      // Modern clipboard API
      if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(query);
      }
    }
  };

  return (
    <div className="grid grid-cols-12 gap-4 h-full">
      <Card className="col-span-12 lg:col-span-3 h-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database size={18} />
            Database Explorer
          </CardTitle>
          <CardDescription>
            {isConnected 
              ? `Connected to ${config.database || 'database'}`
              : 'Not connected to database'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-between mb-4">
            <Badge variant={connectionStatus === 'connected' ? 'default' : 'destructive'}>
              {connectionStatus === 'connected' ? 'Connected' : 'Disconnected'}
            </Badge>
            
            {isConnected ? (
              <Button size="sm" variant="outline" onClick={handleDisconnect}>
                Disconnect
              </Button>
            ) : (
              <Button size="sm" variant="outline" onClick={() => setActiveTab('connect')}>
                Connect
              </Button>
            )}
          </div>
          
          {isConnected && (
            <ScrollArea className="h-[400px]">
              <div className="space-y-1">
                {tables.map((table) => (
                  <div 
                    key={table.name}
                    className={`flex items-center gap-2 px-2 py-1.5 text-sm rounded-md cursor-pointer
                      ${selectedTable === table.name ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'}`}
                    onClick={() => selectTable(table.name)}
                  >
                    <TableIcon size={14} />
                    <span>{table.name}</span>
                    <Badge variant="outline" className="ml-auto">
                      {table.documentCount}
                    </Badge>
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>
      
      <div className="col-span-12 lg:col-span-9 space-y-4">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="connect">Connection</TabsTrigger>
            <TabsTrigger value="browse" disabled={!isConnected}>Browse Data</TabsTrigger>
            <TabsTrigger value="query" disabled={!isConnected}>Query</TabsTrigger>
            <TabsTrigger value="status" disabled={!isConnected}>Status</TabsTrigger>
          </TabsList>
          
          <TabsContent value="connect" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Database Connection</CardTitle>
                <CardDescription>Configure your MongoDB connection settings</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleConfigSubmit} className="space-y-4">
                  <div className="grid gap-2">
                    <label htmlFor="connectionString" className="text-sm font-medium">Connection String</label>
                    <Input
                      id="connectionString"
                      value={config.connectionString}
                      onChange={(e) => setConfig({...config, connectionString: e.target.value})}
                      placeholder="mongodb://localhost:27017"
                    />
                  </div>
                  
                  <div className="grid gap-2">
                    <label htmlFor="database" className="text-sm font-medium">Database Name</label>
                    <Input
                      id="database"
                      value={config.database}
                      onChange={(e) => setConfig({...config, database: e.target.value})}
                      placeholder="mydatabase"
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <label htmlFor="username" className="text-sm font-medium">Username</label>
                      <Input
                        id="username"
                        value={config.username}
                        onChange={(e) => setConfig({...config, username: e.target.value})}
                        placeholder="(Optional)"
                      />
                    </div>
                    
                    <div className="grid gap-2">
                      <label htmlFor="password" className="text-sm font-medium">Password</label>
                      <Input
                        id="password"
                        type="password"
                        value={config.password}
                        onChange={(e) => setConfig({...config, password: e.target.value})}
                        placeholder="(Optional)"
                      />
                    </div>
                  </div>
                  
                  <Button type="submit" disabled={!isConfigured || connectionStatus === 'connected'} className="w-full">
                    {connectionStatus === 'connected' ? (
                      <>
                        <Check className="mr-2 h-4 w-4" />
                        Connected
                      </>
                    ) : connectionStatus === 'error' ? (
                      <>
                        <AlertCircle className="mr-2 h-4 w-4" />
                        Retry Connection
                      </>
                    ) : (
                      <>
                        <Plug2 className="mr-2 h-4 w-4" />
                        Connect
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="browse">
            <Card className="h-[600px] flex flex-col">
              <CardHeader className="flex-shrink-0">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    {selectedTable ? (
                      <>
                        <TableIcon size={18} />
                        {selectedTable}
                      </>
                    ) : (
                      'Select a collection to browse'
                    )}
                  </CardTitle>
                  
                  {selectedTable && (
                    <Button size="sm" variant="outline" onClick={handleRefresh}>
                      <RefreshCw size={14} className="mr-2" />
                      Refresh
                    </Button>
                  )}
                </div>
              </CardHeader>
              
              <CardContent className="flex-grow overflow-auto p-0">
                {selectedTable ? (
                  <div className="flex flex-col h-full">
                    <div className="p-4 border-b">
                      <h4 className="text-sm font-semibold mb-2">Collection Schema</h4>
                      <div className="bg-muted rounded-md p-2 overflow-x-auto">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Field</TableHead>
                              <TableHead>Type</TableHead>
                              <TableHead>Key</TableHead>
                              <TableHead>Extra</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {tableStructure.map((column, i) => (
                              <TableRow key={i}>
                                <TableCell className="font-medium">{column.Field}</TableCell>
                                <TableCell>{column.Type}</TableCell>
                                <TableCell>{column.Key}</TableCell>
                                <TableCell>{column.Extra}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    </div>
                    
                    <div className="p-4 flex-grow overflow-auto">
                      <h4 className="text-sm font-semibold mb-2">Documents</h4>
                      {tableData.length > 0 ? (
                        <div className="bg-muted rounded-md p-2 overflow-x-auto">
                          <Table>
                            <TableHeader>
                              <TableRow>
                                {Object.keys(tableData[0]).map((key) => (
                                  <TableHead key={key}>{key}</TableHead>
                                ))}
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {tableData.map((row, i) => (
                                <TableRow key={i}>
                                  {Object.values(row).map((value: any, j) => (
                                    <TableCell key={j}>
                                      {typeof value === 'object' 
                                        ? JSON.stringify(value)
                                        : String(value)}
                                    </TableCell>
                                  ))}
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </div>
                      ) : (
                        <div className="flex justify-center items-center p-8 text-muted-foreground">
                          No documents found in this collection
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full p-8 text-center text-muted-foreground">
                    <TableIcon size={48} className="mb-4 opacity-20" />
                    <p>Select a collection from the sidebar to view its data</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="query">
            <Card className="h-[600px] flex flex-col">
              <CardHeader className="flex-shrink-0">
                <CardTitle>MongoDB Query</CardTitle>
                <CardDescription>
                  Run MongoDB queries directly against the database
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-grow flex flex-col p-0">
                <div className="p-4 border-b">
                  <div className="flex gap-2 mb-2">
                    <Button
                      size="sm"
                      onClick={runQuery}
                      disabled={queryLoading}
                      className="gap-1"
                    >
                      {queryLoading ? (
                        <Loader2 size={14} className="animate-spin" />
                      ) : (
                        <Play size={14} />
                      )}
                      Run Query
                    </Button>
                    <Button size="sm" variant="outline" onClick={copyQueryToClipboard}>
                      Copy
                    </Button>
                  </div>
                  
                  <Textarea
                    ref={queryTextareaRef}
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    className="font-mono text-sm h-32 resize-none"
                  />
                </div>
                
                <div className="flex flex-col md:flex-row flex-grow overflow-hidden">
                  <div className="md:w-1/4 p-4 border-r overflow-auto">
                    <h4 className="text-sm font-semibold mb-2">Query History</h4>
                    {queryHistory.length > 0 ? (
                      <div className="space-y-1">
                        {queryHistory.map((historyItem, i) => (
                          <div
                            key={i}
                            onClick={() => handleHistoryClick(i)}
                            className={`text-xs font-mono p-2 rounded cursor-pointer truncate
                              ${selectedHistoryIndex === i ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'}`}
                          >
                            {historyItem.substring(0, 40)}{historyItem.length > 40 ? '...' : ''}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-xs text-muted-foreground">
                        Query history will appear here
                      </div>
                    )}
                  </div>
                  
                  <div className="md:w-3/4 p-4 overflow-auto">
                    <h4 className="text-sm font-semibold mb-2">Results</h4>
                    
                    {queryLoading && (
                      <div className="flex justify-center items-center p-4">
                        <Loader2 className="animate-spin mr-2" size={16} />
                        <span>Executing query...</span>
                      </div>
                    )}
                    
                    {queryError && (
                      <Alert variant="destructive" className="mb-4">
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>Query Error</AlertTitle>
                        <AlertDescription>
                          {queryError}
                        </AlertDescription>
                      </Alert>
                    )}
                    
                    {queryResult && (
                      <div className="bg-muted rounded-md p-2 overflow-x-auto">
                        {queryResult.length > 0 ? (
                          <Table>
                            <TableHeader>
                              <TableRow>
                                {Object.keys(queryResult[0]).map((key) => (
                                  <TableHead key={key}>{key}</TableHead>
                                ))}
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {queryResult.map((row: any, i: number) => (
                                <TableRow key={i}>
                                  {Object.values(row).map((value: any, j) => (
                                    <TableCell key={j}>
                                      {typeof value === 'object' 
                                        ? JSON.stringify(value)
                                        : String(value)}
                                    </TableCell>
                                  ))}
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        ) : (
                          <div className="p-4 text-center text-muted-foreground">
                            Query returned no results
                          </div>
                        )}
                      </div>
                    )}
                    
                    {!queryLoading && !queryError && !queryResult && (
                      <div className="flex flex-col items-center justify-center h-32 text-center text-muted-foreground">
                        <p>Run a query to see results here</p>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="status">
            <Card className="h-[600px]">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings size={18} />
                  Database Status
                </CardTitle>
                <CardDescription>
                  System information and database status
                </CardDescription>
              </CardHeader>
              <CardContent>
                {dbStatus ? (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm">Status</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="flex items-center">
                            <Badge className="bg-green-500">
                              {dbStatus.status}
                            </Badge>
                          </div>
                        </CardContent>
                      </Card>
                      
                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm">Tables</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-2xl font-bold">{dbStatus.tables}</p>
                        </CardContent>
                      </Card>
                      
                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm">Size</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-2xl font-bold">{dbStatus.size}</p>
                        </CardContent>
                      </Card>
                    </div>
                    
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-sm">Security Status</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center gap-2">
                          <ShieldAlert className="text-amber-500" />
                          <div>
                            <p className="font-medium">Authentication: Enabled</p>
                            <p className="text-sm text-muted-foreground">
                              Database is secured with authentication
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                    
                    <div className="space-y-2">
                      <h3 className="text-lg font-medium">System Logs</h3>
                      <ScrollArea className="h-[200px] w-full rounded-md border">
                        <div className="p-4 space-y-2">
                          <div className="flex items-start gap-2">
                            <Badge variant="outline">INFO</Badge>
                            <div>
                              <p className="text-sm">System started successfully</p>
                              <p className="text-xs text-muted-foreground">
                                {new Date().toISOString()}
                              </p>
                            </div>
                          </div>
                          
                          <div className="flex items-start gap-2">
                            <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                              WARN
                            </Badge>
                            <div>
                              <p className="text-sm">High memory usage detected</p>
                              <p className="text-xs text-muted-foreground">
                                {new Date().toISOString()}
                              </p>
                            </div>
                          </div>
                        </div>
                      </ScrollArea>
                    </div>
                  </div>
                ) : (
                  <div className="flex justify-center items-center h-[400px]">
                    <Loader2 className="animate-spin mr-2" />
                    <span>Loading database status...</span>
                  </div>
                )}
              </CardContent>
              <CardFooter>
                <Button onClick={fetchDatabaseStatus} variant="outline" className="w-full">
                  <RefreshCw size={14} className="mr-2" />
                  Refresh Status
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default DatabaseView;
