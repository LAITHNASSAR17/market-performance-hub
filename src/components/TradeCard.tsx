
import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { LineChart, Edit, Trash2, Reply, BarChart } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { Trade } from '@/contexts/TradeContext';
import { formatDistanceToNow } from 'date-fns';
import { useToast } from '@/components/ui/use-toast';

interface TradeCardProps {
  trade: Trade;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onReply?: (trade: Trade) => void;
  onBackTest?: (trade: Trade) => void;
}

const TradeCard: React.FC<TradeCardProps> = ({ 
  trade, 
  onEdit, 
  onDelete, 
  onReply, 
  onBackTest 
}) => {
  const { t } = useLanguage();
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleDelete = (e: React.SyntheticEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    toast({
      title: "Are you sure?",
      description: (
        <div className="grid gap-1">
          <p>Are you sure you want to delete this trade?</p>
          <div className="flex justify-end space-x-2">
            <Button variant="ghost">Cancel</Button>
            <Button variant="destructive" onClick={() => onDelete(trade.id)}>Delete</Button>
          </div>
        </div>
      ),
    })
  };

  const handleReply = (e: React.SyntheticEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (onReply) {
      onReply(trade);
      navigate(`/chart?trade=${trade.id}&mode=replay`);
      
      toast({
        title: t('trade.replyAdded') || "تم إضافة الرد",
        description: t('trade.replyToTradeDescription') || "تم إضافة رد على التداول",
      });
    }
  };

  const handleBackTest = (e: React.SyntheticEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (onBackTest) {
      // Direct navigation to chart with trade ID
      navigate(`/chart?trade=${trade.id}&mode=backtest`);
      
      toast({
        title: t('trade.backTestStarted') || "بدأ الاختبار الرجعي",
        description: t('trade.backTestDescription') || "جاري تشغيل الاختبار الرجعي للتداول",
      });
    }
  };

  return (
    <Card className="bg-card text-card-foreground shadow-sm hover:shadow-md transition-shadow duration-200">
      <CardHeader>
        <div className="flex items-center">
          <Avatar className="mr-4">
            <AvatarImage src={`https://avatar.vercel.sh/${trade.account}.png`} />
            <AvatarFallback>{trade.account.substring(0, 2)}</AvatarFallback>
          </Avatar>
          <div className="space-y-0.5">
            <CardTitle className="text-base font-semibold">{trade.pair} - {trade.type}</CardTitle>
            <CardDescription className="text-sm text-muted-foreground">
              {t('trade.account') || 'الحساب'}: {trade.account}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="py-2 grid gap-4">
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div>
            <span className="text-muted-foreground">{t('trade.entry') || 'نقطة الدخول'}:</span> {trade.entry}
          </div>
          <div>
            <span className="text-muted-foreground">{t('trade.exit') || 'نقطة الخروج'}:</span> {trade.exit}
          </div>
          <div>
            <span className="text-muted-foreground">{t('trade.lotSize') || 'حجم اللوت'}:</span> {trade.lotSize}
          </div>
          <div>
            <span className="text-muted-foreground">{t('trade.duration') || 'المدة'}:</span> {trade.durationMinutes} min
          </div>
          <div>
            <span className="text-muted-foreground">{t('trade.profitLoss') || 'الربح/الخسارة'}:</span> ${trade.profitLoss.toFixed(2)}
          </div>
          <div>
            <span className="text-muted-foreground">{t('trade.date') || 'التاريخ'}:</span> {trade.date}
          </div>
        </div>
        <div>
          <span className="text-muted-foreground">{t('trade.notes') || 'ملاحظات'}:</span> {trade.notes.substring(0, 80)}...
        </div>
        <div>
          {trade.hashtags.map((tag) => (
            <Badge key={tag} variant="secondary" className="mr-1">{tag}</Badge>
          ))}
        </div>
      </CardContent>
      <CardFooter className="flex justify-between items-center py-3">
        <span className="text-xs text-muted-foreground">
          {t('trade.added')} {formatDistanceToNow(new Date(trade.createdAt), { addSuffix: true })}
        </span>
        
        <div className="flex space-x-2 rtl:space-x-reverse">
          <Button size="sm" variant="outline" asChild className="mr-2">
            <Link to={`/chart?trade=${trade.id}`}>
              <LineChart className="h-4 w-4 mr-1" />
              {t('trade.viewOnChart') || 'عرض في الشارت'}
            </Link>
          </Button>

          {onBackTest && (
            <Button 
              size="sm" 
              variant="ghost" 
              onClick={handleBackTest}
              className="mr-2"
            >
              <BarChart className="h-4 w-4 mr-1" />
              {t('trade.backTest') || 'اختبار رجعي'}
            </Button>
          )}

          {onReply && (
            <Button 
              size="sm" 
              variant="ghost" 
              onClick={handleReply}
            >
              <Reply className="h-4 w-4 mr-1" />
              {t('trade.reply') || 'رد'}
            </Button>
          )}

          <Button size="sm" variant="ghost" onClick={() => onEdit(trade.id)}>
            <Edit className="h-4 w-4 mr-1" />
            {t('trade.edit') || 'تعديل'}
          </Button>
          <Button size="sm" variant="ghost" onClick={handleDelete}>
            <Trash2 className="h-4 w-4 mr-1" />
            {t('trade.delete') || 'حذف'}
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};

export default TradeCard;
