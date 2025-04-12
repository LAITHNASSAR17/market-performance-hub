
import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { formatDate } from '@/lib/utils';

interface Trade {
  id: string;
  date: string;
  pair: string;
  type?: string;
  direction?: 'long' | 'short';
  entryPrice?: number;
  exitPrice?: number;
  profitLoss: number;
  size?: number;
  notes?: string;
  [key: string]: any;
}

interface LatestTradesTableProps {
  trades: Trade[];
}

const LatestTradesTable: React.FC<LatestTradesTableProps> = ({ trades }) => {
  if (!trades || trades.length === 0) {
    return (
      <div className="text-center py-4 text-gray-500">
        No trades available.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Pair</TableHead>
            <TableHead>Direction</TableHead>
            <TableHead className="text-right">P&L</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {trades.map((trade) => (
            <TableRow key={trade.id}>
              <TableCell className="font-medium">
                {typeof trade.date === 'string' 
                  ? formatDate(new Date(trade.date)) 
                  : 'Unknown date'}
              </TableCell>
              <TableCell>{trade.pair}</TableCell>
              <TableCell>
                <Badge variant={trade.direction === 'long' ? 'success' : 'destructive'}>
                  {trade.direction === 'long' ? 'Long' : trade.direction === 'short' ? 'Short' : trade.type || 'N/A'}
                </Badge>
              </TableCell>
              <TableCell className={`text-right font-semibold ${trade.profitLoss > 0 ? 'text-green-500' : trade.profitLoss < 0 ? 'text-red-500' : ''}`}>
                {trade.profitLoss > 0 ? '+' : ''}{trade.profitLoss.toFixed(2)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default LatestTradesTable;
