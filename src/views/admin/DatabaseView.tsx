
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useMongoDB } from '@/contexts/MongoDBContext';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { RefreshCw, Database, Search, FileText, Info } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';

const DatabaseView: React.FC = () => {
  const { 
    connectionStatus, 
    collections, 
    find,
    isConfigured 
  } = useMongoDB();
  
  const { toast } = useToast();
  const [selectedCollection, setSelectedCollection] = useState('');
  const [documentCount, setDocumentCount] = useState(0);
  const [documents, setDocuments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [schema, setSchema] = useState<any[]>([]);

  // Load data when a collection is selected
  useEffect(() => {
    if (selectedCollection && connectionStatus === 'connected') {
      loadCollectionData();
    } else {
      setDocuments([]);
      setSchema([]);
      setDocumentCount(0);
    }
  }, [selectedCollection]);

  // Filter documents when search term changes
  useEffect(() => {
    if (selectedCollection && documents.length > 0 && searchTerm) {
      filterDocuments();
    }
  }, [searchTerm]);

  const loadCollectionData = async () => {
    if (!selectedCollection || connectionStatus !== 'connected') return;
    
    setIsLoading(true);
    try {
      // Fetch documents with a limit
      const result = await find(selectedCollection, {});
      
      setDocuments(result);
      setDocumentCount(result.length);
      
      // Generate schema from the first document
      if (result.length > 0) {
        const firstDoc = result[0];
        const schemaFields = Object.entries(firstDoc).map(([key, value]) => ({
          name: key,
          type: typeof value,
          example: String(value)
        }));
        setSchema(schemaFields);
      }
      
      toast({
        title: "Collection Loaded",
        description: `Loaded ${result.length} documents from ${selectedCollection}`
      });
    } catch (error) {
      console.error("Error loading collection data:", error);
      toast({
        title: "Error",
        description: "Failed to load collection data",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const filterDocuments = async () => {
    if (!selectedCollection || !searchTerm.trim()) {
      loadCollectionData();
      return;
    }
    
    setIsLoading(true);
    try {
      // Very simple filtering logic - in a real app, you would want to implement
      // proper MongoDB querying here based on the search term
      const allDocs = await find(selectedCollection, {});
      
      // Filter documents based on search term (case-insensitive)
      const searchTermLower = searchTerm.toLowerCase();
      const filtered = allDocs.filter(doc => {
        return Object.values(doc).some(val => {
          if (val === null || val === undefined) return false;
          return String(val).toLowerCase().includes(searchTermLower);
        });
      });
      
      setDocuments(filtered);
      setDocumentCount(filtered.length);
      
      toast({
        title: "Search Results",
        description: `Found ${filtered.length} matching documents`
      });
    } catch (error) {
      console.error("Error filtering documents:", error);
      toast({
        title: "Search Error",
        description: "Failed to filter documents",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!isConfigured || connectionStatus !== 'connected') {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col items-center justify-center p-8 text-center">
            <Database className="h-12 w-12 text-gray-300 mb-4" />
            <h3 className="text-lg font-medium">Not Connected</h3>
            <p className="text-sm text-gray-500 max-w-md mt-2">
              Please connect to a MongoDB database in the Connection tab before exploring collections.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="py-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Collections</CardTitle>
            {isLoading && <RefreshCw className="animate-spin h-4 w-4 text-gray-500" />}
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-2 mb-4">
            <Select 
              value={selectedCollection} 
              onValueChange={setSelectedCollection}
            >
              <SelectTrigger className="w-full sm:w-[200px]">
                <SelectValue placeholder="Select Collection" />
              </SelectTrigger>
              <SelectContent>
                {collections.map((collection) => (
                  <SelectItem key={collection.name} value={collection.name}>
                    {collection.name} ({collection.documentCount || '?'})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <div className="relative flex-grow">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input
                className="pl-10"
                placeholder="Search documents..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                disabled={!selectedCollection}
              />
            </div>
            
            <Button
              size="sm"
              onClick={loadCollectionData}
              disabled={!selectedCollection || isLoading}
            >
              <RefreshCw className={`h-4 w-4 mr-1 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
          
          {!selectedCollection ? (
            <div className="text-center py-8 text-gray-500">
              <FileText className="h-10 w-10 mx-auto mb-2 text-gray-300" />
              <p>Select a collection to view documents</p>
            </div>
          ) : documents.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Info className="h-10 w-10 mx-auto mb-2 text-gray-300" />
              <p>No documents found in collection</p>
            </div>
          ) : (
            <>
              <div className="text-sm text-gray-500 mb-2">
                Showing {documents.length} document(s) from {selectedCollection}
              </div>
              
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    {schema.map((field) => (
                      <TableHead key={field.name}>
                        {field.name}
                        <span className="text-xs text-gray-400 block">
                          ({field.type})
                        </span>
                      </TableHead>
                    ))}
                  </TableHeader>
                  <TableBody>
                    {documents.slice(0, 10).map((doc, index) => (
                      <TableRow key={index}>
                        {schema.map((field) => (
                          <TableCell key={field.name}>
                            {doc[field.name] !== undefined ? 
                              typeof doc[field.name] === 'object' ? 
                                JSON.stringify(doc[field.name]) : 
                                String(doc[field.name]) 
                              : ''}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              
              {documents.length > 10 && (
                <div className="text-center text-sm text-gray-500 mt-2">
                  Showing 10 of {documents.length} documents. 
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default DatabaseView;
