
import React from 'react';
import { Search, FileUp, RefreshCw, Eye, Edit, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from '@/lib/utils';
import { Trade } from '@/contexts/TradeContext';

interface TradeTableProps {
  trades: Trade[];
  onViewTrade: (id: string) => void;
  onEditTrade: (id: string) => void;
  onDeleteTrade: (id: string) => void;
  onRefresh: () => void;
  onExport: () => void;
}

const TradeTable: React.FC<TradeTableProps> = ({
  trades,
  onViewTrade,
  onEditTrade,
  onDeleteTrade,
  onRefresh,
  onExport
}) => {
  return (
    <>
      <div className="flex flex-col sm:flex-row mb-4 gap-2">
        <div className="relative flex-grow">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <Input
            className="pl-10 pr-4"
            placeholder="بحث في الصفقات..."
          />
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="flex items-center" onClick={onExport}>
            <FileUp className="mr-1 h-4 w-4" />
            تصدير
          </Button>
          <Button size="sm" className="flex items-center" onClick={onRefresh}>
            <RefreshCw className="mr-1 h-4 w-4" />
            تحديث
          </Button>
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>المعرف</TableHead>
              <TableHead>المستخدم</TableHead>
              <TableHead>الزوج</TableHead>
              <TableHead>النوع</TableHead>
              <TableHead>التاريخ</TableHead>
              <TableHead>الربح/الخسارة</TableHead>
              <TableHead className="text-right">الإجراءات</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {trades && trades.length > 0 ? (
              trades.map((trade) => (
                <TableRow key={trade.id} className="hover:bg-slate-50">
                  <TableCell className="font-medium">{trade.id.substring(0, 5)}</TableCell>
                  <TableCell>{trade.userId.substring(0, 5)}</TableCell>
                  <TableCell>{trade.pair}</TableCell>
                  <TableCell>{trade.type}</TableCell>
                  <TableCell>{trade.date}</TableCell>
                  <TableCell className={cn(
                    trade.profitLoss > 0 ? "text-emerald-500" : "text-red-500"
                  )}>
                    ${trade.profitLoss.toFixed(2)}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => onViewTrade(trade.id)}
                        className="text-blue-600 border-blue-600 hover:bg-blue-50 h-8 w-8 p-0"
                        title="عرض الصفقة"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => onEditTrade(trade.id)}
                        className="text-amber-600 border-amber-600 hover:bg-amber-50 h-8 w-8 p-0"
                        title="تعديل الصفقة"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => onDeleteTrade(trade.id)}
                        className="text-red-600 border-red-600 hover:bg-red-50 h-8 w-8 p-0"
                        title="حذف الصفقة"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                  لا توجد صفقات متاحة. ستظهر الصفقات هنا بمجرد أن يبدأ المستخدمون في إضافتها.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </>
  );
};

export default TradeTable;
