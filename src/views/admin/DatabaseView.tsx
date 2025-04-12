
import React, { useState } from 'react';
import { useMongoDBContext } from '@/contexts/MongoDBContext';
import { 
  Table, 
  TableHeader, 
  TableRow, 
  TableHead, 
  TableBody, 
  TableCell 
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';

const DatabaseView = () => {
  const { 
    isConnected, 
    isConfigured, 
    connectionStatus, 
    config, 
    collections, 
    setConfig, 
    connect, 
    disconnect, 
    fetchCollections, 
    executeQuery 
  } = useMongoDBContext();
  
  const { toast } = useToast();
  const [query, setQuery] = useState('');
  const [queryResult, setQueryResult] = useState<any>(null);
  const [queryError, setQueryError] = useState<string | null>(null);

  const handleConnect = async () => {
    try {
      const connected = await connect();
      if (connected) {
        toast({
          title: 'Connection successful',
          description: 'Connected to MongoDB database',
          variant: 'default',
        });
      } else {
        toast({
          title: 'Connection failed',
          description: 'Unable to connect to MongoDB database',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Connection error',
        description: error instanceof Error ? error.message : 'Unknown error occurred',
        variant: 'destructive',
      });
    }
  };

  const handleDisconnect = () => {
    disconnect();
    toast({
      title: 'Disconnected',
      description: 'Disconnected from MongoDB database',
      variant: 'default',
    });
  };

  const handleExecuteQuery = async () => {
    try {
      setQueryError(null);
      const result = await executeQuery(query);
      if (result.success) {
        setQueryResult(result.data);
        toast({
          title: 'Query executed',
          description: 'MongoDB query executed successfully',
          variant: 'default',
        });
      } else {
        setQueryError(result.error || 'Unknown error');
        toast({
          title: 'Query failed',
          description: result.error || 'Unknown error occurred',
          variant: 'destructive',
        });
      }
    } catch (error) {
      setQueryError(error instanceof Error ? error.message : 'Unknown error');
      toast({
        title: 'Query error',
        description: error instanceof Error ? error.message : 'Unknown error occurred',
        variant: 'destructive',
      });
    }
  };

  return (
    <Tabs defaultValue="connection" className="w-full space-y-5">
      <TabsList>
        <TabsTrigger value="connection">Connection</TabsTrigger>
        <TabsTrigger value="collections">Collections</TabsTrigger>
        <TabsTrigger value="query">Query</TabsTrigger>
      </TabsList>

      <TabsContent value="connection" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>MongoDB Connection</CardTitle>
            <CardDescription>Configure your MongoDB connection settings</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="connectionString">Connection String</Label>
              <Input 
                id="connectionString" 
                value={config.connectionString} 
                onChange={(e) => setConfig({...config, connectionString: e.target.value})}
                placeholder="mongodb://localhost:27017"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="database">Database</Label>
              <Input 
                id="database" 
                value={config.database} 
                onChange={(e) => setConfig({...config, database: e.target.value})}
                placeholder="my_database"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="username">Username (optional)</Label>
                <Input 
                  id="username" 
                  value={config.username} 
                  onChange={(e) => setConfig({...config, username: e.target.value})}
                  placeholder="username"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password (optional)</Label>
                <Input 
                  id="password" 
                  type="password"
                  value={config.password} 
                  onChange={(e) => setConfig({...config, password: e.target.value})}
                  placeholder="password"
                />
              </div>
            </div>
            <div className="flex items-center gap-2 pt-4">
              <Button onClick={handleConnect} disabled={!isConfigured || isConnected}>
                Connect
              </Button>
              <Button 
                onClick={handleDisconnect} 
                disabled={!isConnected} 
                variant="outline"
              >
                Disconnect
              </Button>
              <div className="ml-4 flex items-center gap-2">
                <div className={`h-3 w-3 rounded-full ${connectionStatus === 'connected' ? 'bg-green-500' : connectionStatus === 'error' ? 'bg-red-500' : 'bg-gray-300'}`}></div>
                <span className="text-sm text-muted-foreground">
                  {connectionStatus === 'connected' ? 'Connected' : connectionStatus === 'error' ? 'Connection Error' : 'Disconnected'}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="collections" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Database Collections</CardTitle>
            <CardDescription>View all collections in your MongoDB database</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-4">
              <Button onClick={fetchCollections} disabled={!isConnected}>Refresh Collections</Button>
            </div>
            
            {collections.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Collection Name</TableHead>
                    <TableHead>Document Count</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {collections.map((collection) => (
                    <TableRow key={collection.name}>
                      <TableCell>{collection.name}</TableCell>
                      <TableCell>{collection.documentCount}</TableCell>
                      <TableCell>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => {
                            setQuery(`db.${collection.name}.find({})`);
                            // Switch to query tab
                            document.querySelector('[data-value="query"]')?.click();
                          }}
                        >
                          Query
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="flex h-[200px] items-center justify-center border rounded-md">
                <p className="text-center text-muted-foreground">
                  {isConnected 
                    ? "No collections found. Click 'Refresh Collections' to try again." 
                    : "Connect to database to view collections"}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="query" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>MongoDB Query</CardTitle>
            <CardDescription>Execute MongoDB queries and view results</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="query">Query</Label>
                <Textarea 
                  id="query" 
                  placeholder="db.collection.find({})"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  disabled={!isConnected}
                  className="font-mono min-h-[100px]"
                />
              </div>
              
              <Button onClick={handleExecuteQuery} disabled={!isConnected || !query.trim()}>
                Execute Query
              </Button>
              
              <Separator />
              
              <div>
                <Label>Results</Label>
                {queryError ? (
                  <div className="mt-2 p-4 bg-red-50 border border-red-200 rounded-md text-red-600">
                    <p className="font-medium">Error:</p>
                    <p>{queryError}</p>
                  </div>
                ) : queryResult ? (
                  <div className="mt-2 overflow-auto max-h-[400px]">
                    <pre className="p-4 bg-gray-50 border rounded-md font-mono text-sm whitespace-pre-wrap">
                      {JSON.stringify(queryResult, null, 2)}
                    </pre>
                  </div>
                ) : (
                  <div className="flex h-[200px] items-center justify-center border rounded-md mt-2">
                    <p className="text-center text-muted-foreground">
                      Execute a query to see results
                    </p>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
};

export default DatabaseView;
