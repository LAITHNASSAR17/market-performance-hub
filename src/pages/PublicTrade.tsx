
import React from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/supabase';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

const PublicTrade = () => {
  const { id } = useParams();
  const [trade, setTrade] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);
  const { toast } = useToast();

  React.useEffect(() => {
    const fetchTrade = async () => {
      try {
        const { data, error } = await supabase
          .from('trades')
          .select('*')
          .eq('id', id)
          .single();

        if (error) throw error;
        setTrade(data);
      } catch (error: any) {
        toast({
          title: "خطأ",
          description: "لم نتمكن من العثور على الصفقة",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchTrade();
  }, [id]);

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">جاري التحميل...</div>;
  }

  if (!trade) {
    return <div className="flex items-center justify-center min-h-screen">لم يتم العثور على الصفقة</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl flex justify-between items-center">
            <span>{trade.symbol} {trade.direction}</span>
            <Badge variant={trade.profit_loss > 0 ? "success" : "destructive"}>
              {trade.profit_loss > 0 ? '+' : ''}{trade.profit_loss}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="font-medium mb-2">تفاصيل الدخول</h3>
              <div className="bg-muted/50 p-3 rounded-lg">
                <div className="flex justify-between mb-1">
                  <span>سعر الدخول</span>
                  <span className="font-medium">{trade.entry_price}</span>
                </div>
                <div className="flex justify-between">
                  <span>تاريخ الدخول</span>
                  <span className="font-medium">{format(new Date(trade.entry_date), 'dd/MM/yyyy')}</span>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="font-medium mb-2">تفاصيل الخروج</h3>
              <div className="bg-muted/50 p-3 rounded-lg">
                <div className="flex justify-between mb-1">
                  <span>سعر الخروج</span>
                  <span className="font-medium">{trade.exit_price || 'لم يتم الخروج بعد'}</span>
                </div>
                <div className="flex justify-between">
                  <span>تاريخ الخروج</span>
                  <span className="font-medium">
                    {trade.exit_date ? format(new Date(trade.exit_date), 'dd/MM/yyyy') : 'لم يتم الخروج بعد'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {trade.notes && (
            <div>
              <h3 className="font-medium mb-2">الملاحظات</h3>
              <div className="bg-muted/50 p-3 rounded-lg whitespace-pre-wrap">
                {trade.notes}
              </div>
            </div>
          )}

          {trade.tags?.length > 0 && (
            <div>
              <h3 className="font-medium mb-2">الوسوم</h3>
              <div className="flex flex-wrap gap-2">
                {trade.tags.map((tag: string) => (
                  <Badge key={tag} variant="secondary">{tag}</Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default PublicTrade;
