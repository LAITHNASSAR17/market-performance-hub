
import React from 'react';
import { Activity, RefreshCw, Download, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';

interface TradeTableProps {
  trades: any[];
  onViewTrade: (id: string) => void;
  onEditTrade: (id: string) => void;
  onDeleteTrade: (id: string) => void;
  onRefresh: () => void;
  onExport: () => void;
  isLoading?: boolean;
  error?: string | null;
}

const TradeTable: React.FC<TradeTableProps> = ({
  trades,
  onViewTrade,
  onEditTrade,
  onDeleteTrade,
  onRefresh,
  onExport,
  isLoading = false,
  error = null
}) => {
  if (isLoading) {
    return (
      <div className="text-center p-8 text-gray-500">
        <Activity className="mx-auto h-12 w-12 text-gray-300 animate-pulse mb-4" />
        <h3 className="text-lg font-medium mb-2">جاري تحميل البيانات...</h3>
        <p>يرجى الانتظار بينما نجلب بيانات التداول الخاصة بك.</p>
      </div>
    );
  }

  if (error) {
    return (
      <Card className="border-red-200 bg-red-50">
        <CardContent className="text-center p-8">
          <AlertCircle className="mx-auto h-12 w-12 text-red-500 mb-4" />
          <h3 className="text-lg font-medium mb-2 text-red-700">حدث خطأ أثناء جلب البيانات</h3>
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={onRefresh} variant="outline" className="gap-2">
            <RefreshCw className="h-4 w-4" />
            إعادة المحاولة
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (trades.length === 0) {
    return (
      <div className="text-center p-8 text-gray-500">
        <Activity className="mx-auto h-12 w-12 text-gray-300 mb-4" />
        <h3 className="text-lg font-medium mb-2">لا توجد تداولات</h3>
        <p>لم يتم العثور على أي تداولات. ابدأ بإضافة تداول جديد.</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between mb-4">
        <div className="space-x-2">
          <Button variant="outline" size="sm" onClick={onRefresh} className="gap-2">
            <RefreshCw className="h-4 w-4" />
            تحديث
          </Button>
          <Button variant="outline" size="sm" onClick={onExport} className="gap-2">
            <Download className="h-4 w-4" />
            تصدير
          </Button>
        </div>
      </div>

      <div className="rounded-md border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="font-semibold">التاريخ</TableHead>
              <TableHead className="font-semibold">الزوج</TableHead>
              <TableHead className="font-semibold">النوع</TableHead>
              <TableHead className="font-semibold">الدخول</TableHead>
              <TableHead className="font-semibold">الخروج</TableHead>
              <TableHead className="font-semibold">الكمية</TableHead>
              <TableHead className="font-semibold">الربح/الخسارة</TableHead>
              <TableHead className="font-semibold">الإجراءات</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {trades.map((trade) => (
              <TableRow key={trade.id}>
                <TableCell>{format(new Date(trade.date || trade.entryDate || trade.createdAt), 'yyyy/MM/dd')}</TableCell>
                <TableCell>{trade.pair || trade.symbol}</TableCell>
                <TableCell>
                  <Badge variant={trade.type === 'Buy' || trade.direction === 'long' ? "success" : "destructive"}>
                    {trade.type || (trade.direction === 'long' ? 'Buy' : 'Sell')}
                  </Badge>
                </TableCell>
                <TableCell>{trade.entry || trade.entryPrice}</TableCell>
                <TableCell>{trade.exit || trade.exitPrice || '-'}</TableCell>
                <TableCell>{trade.lotSize || trade.quantity}</TableCell>
                <TableCell className={`font-medium ${(trade.profitLoss || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {(trade.profitLoss || 0) >= 0 ? '+' : ''}{(trade.profitLoss || 0).toFixed(2)}
                </TableCell>
                <TableCell>
                  <div className="flex space-x-2">
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={() => onViewTrade(trade.id)}
                    >
                      عرض
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={() => onEditTrade(trade.id)}
                    >
                      تعديل
                    </Button>
                    <Button 
                      size="sm" 
                      variant="destructive" 
                      onClick={() => onDeleteTrade(trade.id)}
                    >
                      حذف
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default TradeTable;
