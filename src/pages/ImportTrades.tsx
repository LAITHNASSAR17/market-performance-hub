
import React from 'react';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FileUp, FileText, Check, X, Download, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Link } from 'react-router-dom';
import ImportTradesDialog from '@/components/trades/ImportTradesDialog';

const ImportTrades: React.FC = () => {
  const [isImportDialogOpen, setIsImportDialogOpen] = React.useState(false);

  return (
    <Layout>
      <div className="container mx-auto py-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Import Trades</h1>
          <div className="flex gap-2">
            <Button variant="outline" asChild>
              <Link to="/trades">
                <FileText className="mr-2 h-4 w-4" />
                View All Trades
              </Link>
            </Button>
            <Button onClick={() => setIsImportDialogOpen(true)}>
              <FileUp className="mr-2 h-4 w-4" />
              Import CSV
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>CSV Import</CardTitle>
              <CardDescription>
                Upload a CSV file with your trade history
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="border-2 border-dashed rounded-md p-6 text-center">
                <FileUp className="mx-auto h-10 w-10 text-gray-400 mb-2" />
                <p className="text-sm text-gray-500 mb-4">
                  Upload a CSV file with your trade history
                </p>
                <Button onClick={() => setIsImportDialogOpen(true)}>
                  Select CSV File
                </Button>
              </div>

              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  The CSV file should have headers: Date, Pair, Type, Entry, Exit, SL, TP, Lot, Notes.
                  Date should be in YYYY-MM-DD format.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>CSV Template</CardTitle>
              <CardDescription>
                Download a template CSV file to get started
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="border rounded-md p-4">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="py-2 text-left">Date</th>
                      <th className="py-2 text-left">Pair</th>
                      <th className="py-2 text-left">Type</th>
                      <th className="py-2 text-left">Entry</th>
                      <th className="py-2 text-left">Exit</th>
                      <th className="py-2 text-left">Lot</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="py-2">2025-04-18</td>
                      <td className="py-2">EUR/USD</td>
                      <td className="py-2">Buy</td>
                      <td className="py-2">1.0920</td>
                      <td className="py-2">1.0950</td>
                      <td className="py-2">1.0</td>
                    </tr>
                    <tr>
                      <td className="py-2">2025-04-17</td>
                      <td className="py-2">GBP/USD</td>
                      <td className="py-2">Sell</td>
                      <td className="py-2">1.2550</td>
                      <td className="py-2">1.2500</td>
                      <td className="py-2">0.5</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="space-y-2">
                <p className="text-sm font-medium">Required fields:</p>
                <ul className="text-sm space-y-1">
                  <li className="flex items-center">
                    <Check className="h-4 w-4 text-green-500 mr-2" />
                    Date (YYYY-MM-DD)
                  </li>
                  <li className="flex items-center">
                    <Check className="h-4 w-4 text-green-500 mr-2" />
                    Pair (symbol)
                  </li>
                  <li className="flex items-center">
                    <Check className="h-4 w-4 text-green-500 mr-2" />
                    Type (Buy or Sell)
                  </li>
                  <li className="flex items-center">
                    <Check className="h-4 w-4 text-green-500 mr-2" />
                    Entry (price)
                  </li>
                  <li className="flex items-center">
                    <Check className="h-4 w-4 text-green-500 mr-2" />
                    Lot (size)
                  </li>
                </ul>

                <p className="text-sm font-medium mt-4">Optional fields:</p>
                <ul className="text-sm space-y-1">
                  <li className="flex items-center">
                    <X className="h-4 w-4 text-gray-400 mr-2" />
                    Exit (price)
                  </li>
                  <li className="flex items-center">
                    <X className="h-4 w-4 text-gray-400 mr-2" />
                    SL (stop loss)
                  </li>
                  <li className="flex items-center">
                    <X className="h-4 w-4 text-gray-400 mr-2" />
                    TP (take profit)
                  </li>
                  <li className="flex items-center">
                    <X className="h-4 w-4 text-gray-400 mr-2" />
                    Notes (text)
                  </li>
                  <li className="flex items-center">
                    <X className="h-4 w-4 text-gray-400 mr-2" />
                    Tags (comma-separated)
                  </li>
                  <li className="flex items-center">
                    <X className="h-4 w-4 text-gray-400 mr-2" />
                    Session (trading session)
                  </li>
                </ul>
              </div>

              <Button variant="outline" className="w-full">
                <Download className="mr-2 h-4 w-4" />
                Download Template
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      <ImportTradesDialog
        open={isImportDialogOpen}
        onOpenChange={setIsImportDialogOpen}
      />
    </Layout>
  );
};

export default ImportTrades;
