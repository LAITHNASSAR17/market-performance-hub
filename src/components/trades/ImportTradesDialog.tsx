
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Check, X, AlertCircle, FileUp, FileCheck } from 'lucide-react';
import { useTrade } from '@/contexts/TradeContext';
import Papa from 'papaparse';
import { Trade, mapTradeToDBTrade } from '@/types/trade';

// Define the CSV row structure
interface CsvTradeRow {
  Date: string;
  Pair: string;
  Type: 'Buy' | 'Sell';
  Entry: string;
  Exit?: string;
  SL?: string;
  TP?: string;
  Lot: string;
  Notes?: string;
  Tags?: string;
  Session?: string;
}

// Define validation result
interface ValidationResult {
  valid: boolean;
  errors: string[];
  trade?: Omit<Trade, 'id' | 'userId' | 'createdAt'>;
}

const ImportTradesDialog: React.FC<{
  open: boolean;
  onOpenChange: (open: boolean) => void;
}> = ({ open, onOpenChange }) => {
  const [file, setFile] = useState<File | null>(null);
  const [parsedData, setParsedData] = useState<CsvTradeRow[]>([]);
  const [validationResults, setValidationResults] = useState<ValidationResult[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const { toast } = useToast();
  const { addTrade } = useTrade();

  const resetState = () => {
    setFile(null);
    setParsedData([]);
    setValidationResults([]);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;
    
    if (selectedFile.type !== 'text/csv' && !selectedFile.name.endsWith('.csv')) {
      toast({
        title: "Invalid file type",
        description: "Please upload a CSV file",
        variant: "destructive"
      });
      return;
    }
    
    setFile(selectedFile);
  };

  const handleUpload = () => {
    if (!file) return;
    
    setIsUploading(true);
    
    Papa.parse<CsvTradeRow>(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        if (results.data.length === 0) {
          toast({
            title: "Empty CSV file",
            description: "The CSV file doesn't contain any data",
            variant: "destructive"
          });
          setIsUploading(false);
          return;
        }
        
        // Check required columns
        const requiredColumns = ['Date', 'Pair', 'Type', 'Entry', 'Lot'];
        const headers = Object.keys(results.data[0]);
        const missingColumns = requiredColumns.filter(col => !headers.includes(col));
        
        if (missingColumns.length > 0) {
          toast({
            title: "Missing required columns",
            description: `The CSV is missing these columns: ${missingColumns.join(', ')}`,
            variant: "destructive"
          });
          setIsUploading(false);
          return;
        }
        
        setParsedData(results.data);
        validateTrades(results.data);
        setIsUploading(false);
      },
      error: (error) => {
        toast({
          title: "Error parsing CSV",
          description: error.message,
          variant: "destructive"
        });
        setIsUploading(false);
      }
    });
  };

  const validateTrades = (rows: CsvTradeRow[]): void => {
    const results: ValidationResult[] = rows.map(row => {
      const errors: string[] = [];
      
      // Validate required fields
      if (!row.Date) errors.push("Date is required");
      if (!row.Pair) errors.push("Pair is required");
      if (!row.Type || (row.Type !== 'Buy' && row.Type !== 'Sell')) errors.push("Type must be 'Buy' or 'Sell'");
      if (!row.Entry || isNaN(Number(row.Entry))) errors.push("Entry must be a valid number");
      if (!row.Lot || isNaN(Number(row.Lot))) errors.push("Lot size must be a valid number");
      
      // Validate optional numeric fields
      if (row.Exit && isNaN(Number(row.Exit))) errors.push("Exit must be a valid number");
      if (row.SL && isNaN(Number(row.SL))) errors.push("Stop Loss must be a valid number");
      if (row.TP && isNaN(Number(row.TP))) errors.push("Take Profit must be a valid number");
      
      // Validate date format (YYYY-MM-DD)
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (row.Date && !dateRegex.test(row.Date)) {
        errors.push("Date must be in YYYY-MM-DD format");
      }
      
      // Convert to Trade object if valid
      if (errors.length === 0) {
        // Parse tags if they exist (comma-separated)
        const hashtags = row.Tags ? row.Tags.split(',').map(tag => tag.trim()) : [];
        
        return {
          valid: true,
          errors: [],
          trade: {
            pair: row.Pair,
            type: row.Type,
            entry: Number(row.Entry),
            exit: row.Exit ? Number(row.Exit) : null,
            lotSize: Number(row.Lot),
            stopLoss: row.SL ? Number(row.SL) : null,
            takeProfit: row.TP ? Number(row.TP) : null,
            riskPercentage: 0,
            returnPercentage: 0,
            profitLoss: calculateProfitLoss(Number(row.Entry), row.Exit ? Number(row.Exit) : 0, Number(row.Lot), row.Type, row.Pair),
            durationMinutes: null,
            notes: row.Notes || '',
            date: row.Date,
            account: 'Main Trading',
            imageUrl: null,
            beforeImageUrl: null,
            afterImageUrl: null,
            hashtags: hashtags,
            commission: 0,
            rating: 0,
            total: 0,
            marketSession: row.Session || undefined
          }
        };
      }
      
      return {
        valid: false,
        errors
      };
    });
    
    setValidationResults(results);
  };

  // Helper function to calculate profit/loss
  const calculateProfitLoss = (entry: number, exit: number, lotSize: number, type: 'Buy' | 'Sell', pair: string): number => {
    if (!exit) return 0;
    
    const priceDiff = type === 'Buy' ? exit - entry : entry - exit;
    let contractSize = 100000; // Default for forex
    
    // Detect instrument type
    let instrumentType = 'forex';
    if (pair.includes('/')) {
      instrumentType = 'forex';
      if (pair.includes('JPY')) {
        return priceDiff * lotSize * 1000;
      }
      return priceDiff * lotSize * contractSize;
    } else if (/^(btc|eth|xrp|ada|dot|sol)/i.test(pair)) {
      instrumentType = 'crypto';
      return priceDiff * lotSize;
    } else {
      // Stocks, indices, etc.
      return priceDiff * lotSize;
    }
  };

  const handleImport = async () => {
    const validTrades = validationResults
      .filter(result => result.valid && result.trade)
      .map(result => result.trade!);
    
    if (validTrades.length === 0) {
      toast({
        title: "No valid trades to import",
        description: "Please fix the errors and try again",
        variant: "destructive"
      });
      return;
    }
    
    setIsImporting(true);
    
    try {
      // Import each trade
      for (const trade of validTrades) {
        // Calculate total P&L
        if (trade.exit) {
          trade.total = trade.profitLoss - (trade.commission || 0);
        }
        
        await addTrade(trade);
      }
      
      toast({
        title: "Import successful",
        description: `Successfully imported ${validTrades.length} trades`,
      });
      
      // Close dialog and reset state
      resetState();
      onOpenChange(false);
    } catch (error) {
      console.error('Error importing trades:', error);
      toast({
        title: "Import failed",
        description: "An error occurred while importing trades",
        variant: "destructive"
      });
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[80vw] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Import Trades from CSV</DialogTitle>
          <DialogDescription>
            Upload a CSV file with your trades. The CSV should have columns for Date, Pair, Type, Entry, Exit, SL, TP, Lot, and Notes.
          </DialogDescription>
        </DialogHeader>
        
        {!parsedData.length ? (
          <div className="space-y-4 my-4">
            <div className="border-2 border-dashed rounded-md p-6 text-center">
              <FileUp className="mx-auto h-10 w-10 text-gray-400 mb-2" />
              <p className="mb-4 text-sm text-gray-500">
                Upload a CSV file with your trade history
              </p>
              <Label htmlFor="csv-file" className="cursor-pointer">
                <div className="bg-primary text-primary-foreground hover:bg-primary/90 py-2 px-4 rounded-md inline-flex items-center">
                  <span>Select CSV file</span>
                </div>
                <Input
                  id="csv-file"
                  type="file"
                  accept=".csv"
                  className="hidden"
                  onChange={handleFileChange}
                />
              </Label>
              {file && (
                <p className="mt-3 text-sm font-medium">
                  Selected: {file.name}
                </p>
              )}
            </div>
            
            {file && (
              <Button 
                className="w-full" 
                onClick={handleUpload} 
                disabled={isUploading}
              >
                {isUploading ? 'Processing...' : 'Upload and Preview'}
              </Button>
            )}
            
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                The CSV file should have headers: Date, Pair, Type, Entry, Exit, SL, TP, Lot, Notes.
                Date should be in YYYY-MM-DD format.
              </AlertDescription>
            </Alert>
          </div>
        ) : (
          <div className="space-y-4 my-4">
            <div className="flex items-center justify-between mb-2">
              <div>
                <FileCheck className="inline-block h-5 w-5 mr-2 text-gray-500" />
                <span className="text-sm font-medium">
                  {file?.name} • {parsedData.length} rows • {validationResults.filter(r => r.valid).length} valid
                </span>
              </div>
              <Button variant="outline" size="sm" onClick={resetState}>
                Upload Different File
              </Button>
            </div>
            
            <div className="border rounded-md overflow-hidden">
              <div className="max-h-[50vh] overflow-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-10 text-center">Status</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Pair</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Entry</TableHead>
                      <TableHead>Exit</TableHead>
                      <TableHead>Lot</TableHead>
                      <TableHead>Notes</TableHead>
                      <TableHead className="w-1/4">Errors</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {parsedData.map((row, index) => (
                      <TableRow key={index} className={validationResults[index]?.valid ? '' : 'bg-red-50'}>
                        <TableCell className="text-center">
                          {validationResults[index]?.valid ? (
                            <Check className="h-4 w-4 text-green-500 mx-auto" />
                          ) : (
                            <X className="h-4 w-4 text-red-500 mx-auto" />
                          )}
                        </TableCell>
                        <TableCell>{row.Date}</TableCell>
                        <TableCell>{row.Pair}</TableCell>
                        <TableCell>{row.Type}</TableCell>
                        <TableCell>{row.Entry}</TableCell>
                        <TableCell>{row.Exit || '-'}</TableCell>
                        <TableCell>{row.Lot}</TableCell>
                        <TableCell className="truncate max-w-xs">{row.Notes || '-'}</TableCell>
                        <TableCell>
                          {validationResults[index]?.errors.map((error, i) => (
                            <div key={i} className="text-xs text-red-500">{error}</div>
                          ))}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
            
            <div className="flex justify-between items-center">
              <div>
                <span className="text-sm font-medium">
                  {validationResults.filter(r => r.valid).length} of {parsedData.length} trades are valid
                </span>
                {validationResults.some(r => !r.valid) && (
                  <p className="text-xs text-red-500 mt-1">
                    Please fix the errors or upload a corrected file to import all trades
                  </p>
                )}
              </div>
              <Button 
                onClick={handleImport} 
                disabled={isImporting || validationResults.filter(r => r.valid).length === 0}
              >
                {isImporting 
                  ? 'Importing...' 
                  : `Import ${validationResults.filter(r => r.valid).length} Trades`}
              </Button>
            </div>
          </div>
        )}
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ImportTradesDialog;
