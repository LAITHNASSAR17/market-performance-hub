
import React, { useState } from 'react';
import { useMySQL } from '@/contexts/MySQLContext';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Loader2, DatabaseIcon, TableIcon, PlayIcon } from "lucide-react";

const DatabaseView: React.FC = () => {
  const {
    config,
    setConfig,
    connect,
    disconnect,
    connectionStatus,
    tables,
    executeQuery,
    fetchTableData,
    fetchTableStructure,
  } = useMySQL();

  const [selectedTable, setSelectedTable] = useState<string>("");
  const [sqlQuery, setSqlQuery] = useState<string>("");
  const [queryResults, setQueryResults] = useState<any[] | null>(null);
  const [tableStructure, setTableStructure] = useState<any[] | null>(null);
  const [tableData, setTableData] = useState<any[] | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const handleConnect = async () => {
    setLoading(true);
    try {
      await connect();
    } finally {
      setLoading(false);
    }
  };

  const handleDisconnect = () => {
    disconnect();
    setSelectedTable("");
    setTableStructure(null);
    setTableData(null);
    setQueryResults(null);
  };

  const handleTableSelect = async (tableName: string) => {
    if (!tableName) return;
    
    setLoading(true);
    setSelectedTable(tableName);
    
    try {
      const structure = await fetchTableStructure(tableName);
      setTableStructure(structure);
      
      const data = await fetchTableData(tableName);
      setTableData(data);
    } catch (error) {
      console.error("Error fetching table details:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleExecuteQuery = async () => {
    if (!sqlQuery.trim()) return;
    
    setLoading(true);
    try {
      const result = await executeQuery(sqlQuery);
      if (result.success && result.data) {
        setQueryResults(Array.isArray(result.data) ? result.data : [result.data]);
      } else {
        setQueryResults([{ message: "Query executed successfully", ...result }]);
      }
    } catch (error) {
      console.error("Error executing query:", error);
      setQueryResults([{ error: error instanceof Error ? error.message : "Unknown error" }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <DatabaseIcon className="mr-2" size={20} />
            MySQL Connection
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium mb-1">Host</label>
              <Input
                value={config.host}
                onChange={(e) => setConfig({ ...config, host: e.target.value })}
                placeholder="localhost"
                disabled={connectionStatus === 'connected'}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Port</label>
              <Input
                value={config.port}
                onChange={(e) => setConfig({ ...config, port: e.target.value })}
                placeholder="3306"
                disabled={connectionStatus === 'connected'}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Username</label>
              <Input
                value={config.username}
                onChange={(e) => setConfig({ ...config, username: e.target.value })}
                placeholder="root"
                disabled={connectionStatus === 'connected'}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Password</label>
              <Input
                type="password"
                value={config.password}
                onChange={(e) => setConfig({ ...config, password: e.target.value })}
                placeholder="••••••••"
                disabled={connectionStatus === 'connected'}
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1">Database Name</label>
              <Input
                value={config.database}
                onChange={(e) => setConfig({ ...config, database: e.target.value })}
                placeholder="mydatabase"
                disabled={connectionStatus === 'connected'}
              />
            </div>
          </div>
          <div className="flex justify-between items-center">
            <div>
              Status: 
              <Badge variant={
                connectionStatus === 'connected' ? "success" : 
                connectionStatus === 'error' ? "destructive" : "secondary"
              } className="ml-2">
                {connectionStatus === 'connected' ? 'Connected' : 
                 connectionStatus === 'error' ? 'Error' : 'Disconnected'}
              </Badge>
            </div>
            {connectionStatus === 'connected' ? (
              <Button variant="destructive" onClick={handleDisconnect}>
                Disconnect
              </Button>
            ) : (
              <Button onClick={handleConnect} disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Connecting...
                  </>
                ) : (
                  "Connect"
                )}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {connectionStatus === 'connected' && (
        <Tabs defaultValue="tables">
          <TabsList className="mb-4">
            <TabsTrigger value="tables">Tables</TabsTrigger>
            <TabsTrigger value="query">SQL Query</TabsTrigger>
          </TabsList>
          
          <TabsContent value="tables">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card className="md:col-span-1">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center">
                    <TableIcon className="mr-2" size={18} />
                    Tables
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-1">
                    {tables.map((table) => (
                      <Button
                        key={table.name}
                        variant={selectedTable === table.name ? "default" : "ghost"}
                        className="w-full justify-start"
                        onClick={() => handleTableSelect(table.name)}
                      >
                        {table.name}
                        <Badge variant="outline" className="ml-auto">
                          {table.rowCount}
                        </Badge>
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>
              
              <Card className="md:col-span-3">
                <CardHeader>
                  <CardTitle className="text-lg">
                    {selectedTable ? `Table: ${selectedTable}` : "Select a table"}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="flex justify-center py-8">
                      <Loader2 className="h-8 w-8 animate-spin" />
                    </div>
                  ) : selectedTable ? (
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-sm font-semibold mb-2">Structure</h3>
                        <div className="rounded border overflow-auto">
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Column</TableHead>
                                <TableHead>Type</TableHead>
                                <TableHead>Nullable</TableHead>
                                <TableHead>Key</TableHead>
                                <TableHead>Default</TableHead>
                                <TableHead>Extra</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {tableStructure?.map((col, i) => (
                                <TableRow key={i}>
                                  <TableCell className="font-medium">{col.name}</TableCell>
                                  <TableCell>{col.type}</TableCell>
                                  <TableCell>{col.nullable ? 'YES' : 'NO'}</TableCell>
                                  <TableCell>{col.key}</TableCell>
                                  <TableCell>{col.default || 'NULL'}</TableCell>
                                  <TableCell>{col.extra}</TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </div>
                      </div>
                      
                      <Separator />
                      
                      <div>
                        <h3 className="text-sm font-semibold mb-2">Data</h3>
                        {tableData && tableData.length > 0 ? (
                          <div className="rounded border overflow-auto">
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
                                        {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                                      </TableCell>
                                    ))}
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          </div>
                        ) : (
                          <p className="text-muted-foreground text-center py-4">No data available</p>
                        )}
                      </div>
                    </div>
                  ) : (
                    <p className="text-muted-foreground text-center py-8">
                      Select a table from the list to view its structure and data
                    </p>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="query">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center">
                  <PlayIcon className="mr-2" size={18} />
                  SQL Query Executor
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Textarea
                    value={sqlQuery}
                    onChange={(e) => setSqlQuery(e.target.value)}
                    placeholder="Enter your SQL query here... (e.g., SELECT * FROM users LIMIT 10)"
                    className="font-mono h-32"
                  />
                  
                  <div className="flex justify-end">
                    <Button 
                      onClick={handleExecuteQuery} 
                      disabled={loading || !sqlQuery.trim()}
                    >
                      {loading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Executing...
                        </>
                      ) : (
                        "Execute Query"
                      )}
                    </Button>
                  </div>
                  
                  {queryResults && (
                    <div className="mt-6">
                      <h3 className="text-sm font-semibold mb-2">Results</h3>
                      
                      {queryResults.length > 0 ? (
                        <div className="rounded border overflow-auto">
                          <Table>
                            <TableHeader>
                              <TableRow>
                                {Object.keys(queryResults[0]).map((key) => (
                                  <TableHead key={key}>{key}</TableHead>
                                ))}
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {queryResults.map((row, i) => (
                                <TableRow key={i}>
                                  {Object.values(row).map((value: any, j) => (
                                    <TableCell key={j}>
                                      {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                                    </TableCell>
                                  ))}
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </div>
                      ) : (
                        <p className="text-muted-foreground text-center py-4">
                          Query executed successfully but returned no results
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
};

export default DatabaseView;
