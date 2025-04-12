
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useMongoDB } from '@/contexts/MongoDBContext';
import { useToast } from '@/hooks/use-toast';
import { DatabaseIcon, TableIcon, RefreshCw, Play, Database } from 'lucide-react';
import DatabaseView from '@/views/admin/DatabaseView';

const AdminDatabase = () => {
  const { 
    config, 
    setConfig, 
    connect, 
    disconnect, 
    connectionStatus, 
    collections,
    executeQuery
  } = useMongoDB();
  
  const { toast } = useToast();
  const [customQuery, setCustomQuery] = useState('');
  const [queryResult, setQueryResult] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleConnect = async () => {
    setIsLoading(true);
    try {
      const success = await connect();
      if (!success) {
        toast({
          title: "Connection Failed",
          description: "Could not connect to MongoDB. Check your connection details.",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Connection Error",
        description: error instanceof Error ? error.message : "An unexpected error occurred",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDisconnect = () => {
    disconnect();
    setQueryResult(null);
  };

  const handleExecuteQuery = async () => {
    if (!customQuery.trim()) {
      toast({
        title: "Empty Query",
        description: "Please enter a query to execute",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      // Parse the query as best as possible
      const queryParts = customQuery.trim().split(' ');
      const operation = queryParts[0].toLowerCase();
      const collection = queryParts[1];
      
      let query = {};
      try {
        // Try to extract a JSON query if present
        const jsonStart = customQuery.indexOf('{');
        if (jsonStart !== -1) {
          const jsonStr = customQuery.slice(jsonStart);
          query = JSON.parse(jsonStr);
        }
      } catch (error) {
        console.error("Error parsing query JSON:", error);
      }
      
      // Execute the query
      const result = await executeQuery(collection, operation, query);
      setQueryResult(result);
      
      toast({
        title: "Query Executed",
        description: "Operation completed successfully"
      });
    } catch (error) {
      console.error("Query execution error:", error);
      toast({
        title: "Query Error",
        description: error instanceof Error ? error.message : "Failed to execute query",
        variant: "destructive"
      });
      setQueryResult({ error: error instanceof Error ? error.message : "Unknown error" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-4 md:py-6 px-4 md:px-6">
      <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white flex items-center mb-4">
        <Database className="mr-2 h-6 w-6 text-blue-500" />
        Database Management
      </h1>
      
      <Tabs defaultValue="connection" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="connection">Connection</TabsTrigger>
          <TabsTrigger value="explore">Explore Data</TabsTrigger>
          <TabsTrigger value="query">Custom Queries</TabsTrigger>
        </TabsList>
        
        <TabsContent value="connection">
          <Card>
            <CardHeader>
              <CardTitle>MongoDB Connection</CardTitle>
              <CardDescription>Configure and manage your MongoDB connection</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4">
                <div>
                  <label className="text-sm font-medium mb-1 block">Connection String</label>
                  <Input 
                    value={config.connectionString} 
                    onChange={(e) => setConfig({...config, connectionString: e.target.value})}
                    placeholder="mongodb://localhost:27017"
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">Database Name</label>
                  <Input 
                    value={config.database} 
                    onChange={(e) => setConfig({...config, database: e.target.value})}
                    placeholder="my_database"
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">Username (optional)</label>
                  <Input 
                    value={config.username} 
                    onChange={(e) => setConfig({...config, username: e.target.value})}
                    placeholder="username"
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">Password (optional)</label>
                  <Input 
                    type="password"
                    value={config.password} 
                    onChange={(e) => setConfig({...config, password: e.target.value})}
                    placeholder="••••••••"
                    className="w-full"
                  />
                </div>
              </div>
              
              <div className="flex space-x-2 pt-2">
                {connectionStatus !== 'connected' ? (
                  <Button 
                    onClick={handleConnect} 
                    className="flex items-center"
                    disabled={isLoading || !config.connectionString || !config.database}
                  >
                    {isLoading ? <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> : <DatabaseIcon className="h-4 w-4 mr-2" />}
                    Connect
                  </Button>
                ) : (
                  <Button 
                    onClick={handleDisconnect} 
                    variant="destructive"
                    className="flex items-center"
                  >
                    <DatabaseIcon className="h-4 w-4 mr-2" />
                    Disconnect
                  </Button>
                )}
                
                <div className="ml-auto flex items-center">
                  <span className="text-sm mr-2">Status:</span>
                  <span className={`text-sm font-medium ${
                    connectionStatus === 'connected' ? 'text-green-500' : 
                    connectionStatus === 'error' ? 'text-red-500' : 'text-yellow-500'
                  }`}>
                    {connectionStatus === 'connected' ? 'Connected' : 
                     connectionStatus === 'error' ? 'Error' : 'Disconnected'}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="explore">
          <DatabaseView />
        </TabsContent>
        
        <TabsContent value="query">
          <Card>
            <CardHeader>
              <CardTitle>Custom Queries</CardTitle>
              <CardDescription>Execute custom MongoDB operations</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-1 block">Enter MongoDB Operation</label>
                <div className="flex space-x-2">
                  <Input 
                    value={customQuery} 
                    onChange={(e) => setCustomQuery(e.target.value)}
                    placeholder="find users {}"
                    className="w-full"
                  />
                  <Button 
                    onClick={handleExecuteQuery} 
                    disabled={!connectionStatus || connectionStatus !== 'connected' || isLoading}
                    className="flex items-center"
                  >
                    {isLoading ? <RefreshCw className="h-4 w-4 mr-1 animate-spin" /> : <Play className="h-4 w-4 mr-1" />}
                    Execute
                  </Button>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Example: "find users {}" or "insertOne users {"name": "John"}"
                </p>
              </div>
              
              {queryResult && (
                <div className="mt-4">
                  <h3 className="text-sm font-medium mb-2">Result:</h3>
                  <pre className="bg-gray-100 dark:bg-gray-800 p-4 rounded-md overflow-auto max-h-96 text-xs">
                    {JSON.stringify(queryResult, null, 2)}
                  </pre>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminDatabase;
