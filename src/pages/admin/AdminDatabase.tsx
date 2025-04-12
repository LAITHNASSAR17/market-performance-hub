
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Database, Download, RefreshCw, Shield, FileUp, Clock } from 'lucide-react';

// Sample table names
const tables = [
  'users',
  'trades',
  'notes',
  'hashtags',
  'settings',
  'subscriptions',
  'logs'
];

// Sample table structure
const tableStructure = [
  { Field: 'id', Type: 'int', Null: 'NO', Key: 'PRI', Default: null, Extra: 'auto_increment' },
  { Field: 'username', Type: 'varchar(255)', Null: 'NO', Key: '', Default: null, Extra: '' },
  { Field: 'email', Type: 'varchar(255)', Null: 'NO', Key: 'UNI', Default: null, Extra: '' },
  { Field: 'password', Type: 'varchar(255)', Null: 'NO', Key: '', Default: null, Extra: '' },
  { Field: 'isAdmin', Type: 'tinyint(1)', Null: 'NO', Key: '', Default: '0', Extra: '' },
  { Field: 'isBlocked', Type: 'tinyint(1)', Null: 'NO', Key: '', Default: '0', Extra: '' },
  { Field: 'createdAt', Type: 'timestamp', Null: 'NO', Key: '', Default: 'CURRENT_TIMESTAMP', Extra: '' },
  { Field: 'lastLogin', Type: 'timestamp', Null: 'YES', Key: '', Default: null, Extra: '' }
];

// Sample table data
const tableData = [
  { id: 1, username: 'admin', email: 'admin@example.com', isAdmin: 1, isBlocked: 0, createdAt: '2025-01-01 00:00:00', lastLogin: '2025-04-12 10:30:00' },
  { id: 2, username: 'user1', email: 'user1@example.com', isAdmin: 0, isBlocked: 0, createdAt: '2025-01-15 00:00:00', lastLogin: '2025-04-11 14:20:00' },
  { id: 3, username: 'user2', email: 'user2@example.com', isAdmin: 0, isBlocked: 1, createdAt: '2025-02-01 00:00:00', lastLogin: '2025-03-25 09:15:00' }
];

const AdminDatabase: React.FC = () => {
  const [selectedTable, setSelectedTable] = useState(tables[0]);
  const [backupHistory] = useState([
    { date: '2025-04-10 23:00:00', size: '42.5 MB', status: 'Success' },
    { date: '2025-04-09 23:00:00', size: '41.8 MB', status: 'Success' },
    { date: '2025-04-08 23:00:00', size: '41.2 MB', status: 'Success' },
    { date: '2025-04-07 23:00:00', size: '40.9 MB', status: 'Success' },
    { date: '2025-04-06 23:00:00', size: '40.5 MB', status: 'Success' }
  ]);
  const { toast } = useToast();

  const handleBackupNow = () => {
    toast({
      title: "Backup Started",
      description: "Database backup has been initiated"
    });
    
    // In a real app, this would trigger an actual backup
    setTimeout(() => {
      toast({
        title: "Backup Complete",
        description: "Database backup completed successfully"
      });
    }, 3000);
  };
  
  const handleOptimizeDatabase = () => {
    toast({
      title: "Optimization Started",
      description: "Database optimization has been initiated"
    });
    
    // In a real app, this would trigger actual optimization
    setTimeout(() => {
      toast({
        title: "Optimization Complete",
        description: "Database has been optimized successfully"
      });
    }, 2000);
  };
  
  const handleRestoreBackup = (date: string) => {
    toast({
      title: "Restore Initiated",
      description: `Restoring backup from ${date}`
    });
  };
  
  const handleDownloadBackup = (date: string) => {
    toast({
      title: "Download Started",
      description: `Downloading backup from ${date}`
    });
  };

  return (
    <>
      <header className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
          Database Management
        </h1>
        <p className="text-sm md:text-base text-gray-500 dark:text-gray-400 mt-1">
          View and manage the database structure and perform maintenance tasks.
        </p>
      </header>
      
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="tables">Tables</TabsTrigger>
          <TabsTrigger value="backup">Backup & Restore</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <div className="flex items-center">
                <Database className="h-8 w-8 text-blue-500 mr-3" />
                <div>
                  <h3 className="text-lg font-medium">Database Status</h3>
                  <p className="text-sm text-gray-500">Connected</p>
                </div>
              </div>
              <div className="mt-4 text-sm">
                <div className="flex justify-between py-1">
                  <span className="text-gray-500">Version:</span>
                  <span>MySQL 8.0.28</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-gray-500">Tables:</span>
                  <span>15</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-gray-500">Total Size:</span>
                  <span>42.5 MB</span>
                </div>
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <div className="flex items-center">
                <Clock className="h-8 w-8 text-emerald-500 mr-3" />
                <div>
                  <h3 className="text-lg font-medium">Last Backup</h3>
                  <p className="text-sm text-gray-500">12 hours ago</p>
                </div>
              </div>
              <div className="mt-4">
                <Button onClick={handleBackupNow} className="w-full">
                  <FileUp className="h-4 w-4 mr-2" />
                  Backup Now
                </Button>
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <div className="flex items-center">
                <Shield className="h-8 w-8 text-amber-500 mr-3" />
                <div>
                  <h3 className="text-lg font-medium">Database Health</h3>
                  <p className="text-sm text-gray-500">Good Condition</p>
                </div>
              </div>
              <div className="mt-4">
                <Button variant="outline" onClick={handleOptimizeDatabase} className="w-full">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Optimize Database
                </Button>
              </div>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="tables" className="space-y-4">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-64">
              <Select value={selectedTable} onValueChange={setSelectedTable}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a table" />
                </SelectTrigger>
                <SelectContent>
                  {tables.map(table => (
                    <SelectItem key={table} value={table}>{table}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
            <h3 className="text-lg font-medium p-4 border-b">Table Structure: {selectedTable}</h3>
            <div className="overflow-x-auto">
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
                  {tableStructure.map((row, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{row.Field}</TableCell>
                      <TableCell>{row.Type}</TableCell>
                      <TableCell>{row.Null}</TableCell>
                      <TableCell>{row.Key}</TableCell>
                      <TableCell>{row.Default ?? 'NULL'}</TableCell>
                      <TableCell>{row.Extra}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border overflow-hidden mt-4">
            <h3 className="text-lg font-medium p-4 border-b">Table Data: {selectedTable}</h3>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    {Object.keys(tableData[0]).map(key => (
                      <TableHead key={key}>{key}</TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tableData.map((row, rowIndex) => (
                    <TableRow key={rowIndex}>
                      {Object.values(row).map((value, cellIndex) => (
                        <TableCell key={cellIndex}>{value !== null ? String(value) : 'NULL'}</TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="backup" className="space-y-4">
          <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
            <h3 className="text-lg font-medium p-4 border-b">Backup History</h3>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Size</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {backupHistory.map((backup, index) => (
                    <TableRow key={index}>
                      <TableCell>{backup.date}</TableCell>
                      <TableCell>{backup.size}</TableCell>
                      <TableCell>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          {backup.status}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end space-x-2">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="h-8 w-8 p-0"
                            onClick={() => handleRestoreBackup(backup.date)}
                          >
                            <RefreshCw className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="h-8 w-8 p-0"
                            onClick={() => handleDownloadBackup(backup.date)}
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </>
  );
};

export default AdminDatabase;
