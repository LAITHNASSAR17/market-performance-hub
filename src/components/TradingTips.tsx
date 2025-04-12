
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Lightbulb, RefreshCw, ChevronRight, ChevronLeft, Settings } from 'lucide-react';
import { Badge } from "@/components/ui/badge";
import { TradingTip, getAITradingTips, generateAIAdvice } from '@/services/aiService';
import { useTrade } from '@/contexts/TradeContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAnalyticsStats } from '@/hooks/useAnalyticsStats';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface TradingTipsProps {
  className?: string;
}

const TradingTips: React.FC<TradingTipsProps> = ({ className = '' }) => {
  const { trades } = useTrade();
  const { t, language } = useLanguage();
  const stats = useAnalyticsStats();
  const [tips, setTips] = useState<TradingTip[]>([]);
  const [currentTip, setCurrentTip] = useState(0);
  const [loading, setLoading] = useState(false);
  const [aiAdvice, setAiAdvice] = useState<string>('');
  const [loadingAdvice, setLoadingAdvice] = useState(false);
  const [apiKey, setApiKey] = useState<string>(() => {
    // استرجاع المفتاح من التخزين المحلي إذا كان موجوداً
    return localStorage.getItem('perplexity_api_key') || '';
  });
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // حفظ مفتاح API في التخزين المحلي عند تغييره
  useEffect(() => {
    if (apiKey) {
      localStorage.setItem('perplexity_api_key', apiKey);
    }
  }, [apiKey]);

  // تحميل النصائح عند تغير البيانات
  useEffect(() => {
    loadTips();
  }, [trades, stats, apiKey]);

  const loadTips = async () => {
    setLoading(true);
    try {
      const newTips = await getAITradingTips(trades, stats, apiKey);
      setTips(newTips);
      if (newTips.length > 0) {
        setCurrentTip(0);
      }
    } catch (error) {
      console.error("Error loading tips:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadAIAdvice = async () => {
    setLoadingAdvice(true);
    try {
      const advice = await generateAIAdvice(trades, stats, apiKey);
      setAiAdvice(advice);
    } catch (error) {
      console.error("Error loading AI advice:", error);
    } finally {
      setLoadingAdvice(false);
    }
  };

  const handleNext = () => {
    if (currentTip < tips.length - 1) {
      setCurrentTip(currentTip + 1);
    } else {
      setCurrentTip(0);
    }
  };

  const handlePrevious = () => {
    if (currentTip > 0) {
      setCurrentTip(currentTip - 1);
    } else {
      setCurrentTip(tips.length - 1);
    }
  };

  const refreshTips = () => {
    loadTips();
    loadAIAdvice();
  };

  const saveApiKey = (newKey: string) => {
    setApiKey(newKey);
    setIsDialogOpen(false);
    // تحديث النصائح بعد تعيين المفتاح
    refreshTips();
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      case 'low':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      default:
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'performance':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300';
      case 'risk':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300';
      case 'psychology':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'strategy':
        return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
    }
  };

  const translateCategory = (category: string) => {
    switch (category) {
      case 'performance':
        return language === 'ar' ? 'الأداء' : 'Performance';
      case 'risk':
        return language === 'ar' ? 'المخاطر' : 'Risk';
      case 'psychology':
        return language === 'ar' ? 'علم النفس' : 'Psychology';
      case 'strategy':
        return language === 'ar' ? 'الاستراتيجية' : 'Strategy';
      default:
        return category;
    }
  };

  const translatePriority = (priority: string) => {
    switch (priority) {
      case 'high':
        return language === 'ar' ? 'عالية' : 'High';
      case 'medium':
        return language === 'ar' ? 'متوسطة' : 'Medium';
      case 'low':
        return language === 'ar' ? 'منخفضة' : 'Low';
      default:
        return priority;
    }
  };

  useEffect(() => {
    // تحميل النصائح عند تحميل المكون لأول مرة
    if (tips.length === 0 && !loading) {
      loadTips();
    }
    
    // تحميل نصيحة AI
    if (aiAdvice === '' && !loadingAdvice) {
      loadAIAdvice();
    }
  }, []);

  return (
    <div className={`space-y-4 ${className}`}>
      <Card>
        <CardHeader className="pb-3">
          <div className="flex justify-between items-center">
            <CardTitle className="text-lg flex items-center">
              <Lightbulb className="h-5 w-5 mr-2" />
              {language === 'ar' ? 'نصائح ذكية' : 'AI Trading Tips'}
            </CardTitle>
            <div className="flex space-x-2">
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <Settings className="h-4 w-4" />
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>{language === 'ar' ? 'إعدادات AI' : 'AI Settings'}</DialogTitle>
                    <DialogDescription>
                      {language === 'ar' 
                        ? 'أدخل مفتاح Perplexity API الخاص بك لتلقي نصائح ذكية.' 
                        : 'Enter your Perplexity API key to receive smart tips.'}
                    </DialogDescription>
                  </DialogHeader>
                  <div className="py-4">
                    <Label htmlFor="apiKey">{language === 'ar' ? 'مفتاح API' : 'API Key'}</Label>
                    <Input 
                      id="apiKey" 
                      value={apiKey} 
                      onChange={(e) => setApiKey(e.target.value)}
                      placeholder="pk-..."
                      type="password"
                    />
                    <p className="text-xs text-muted-foreground mt-2">
                      {language === 'ar' 
                        ? 'احصل على مفتاح API من موقع Perplexity AI' 
                        : 'Get your API key from Perplexity AI website'}
                    </p>
                  </div>
                  <DialogFooter>
                    <Button onClick={() => saveApiKey(apiKey)}>
                      {language === 'ar' ? 'حفظ' : 'Save'}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
              
              <Button variant="ghost" size="sm" onClick={refreshTips} disabled={loading}>
                <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              </Button>
            </div>
          </div>
          <CardDescription>
            {language === 'ar' 
              ? 'نصائح مخصصة بناءً على أنماط التداول الخاصة بك' 
              : 'Personalized tips based on your trading patterns'}
          </CardDescription>
          {!apiKey && (
            <div className="mt-2 text-sm text-amber-500">
              {language === 'ar' 
                ? 'لتلقي نصائح أكثر دقة، يرجى إضافة مفتاح Perplexity API' 
                : 'For more accurate tips, please add a Perplexity API key'}
            </div>
          )}
        </CardHeader>
        
        <CardContent>
          {tips.length > 0 ? (
            <div className="space-y-3">
              <div className="flex gap-2">
                <Badge className={getCategoryColor(tips[currentTip].category)}>
                  {translateCategory(tips[currentTip].category)}
                </Badge>
                <Badge className={getPriorityColor(tips[currentTip].priority)}>
                  {translatePriority(tips[currentTip].priority)}
                </Badge>
              </div>
              
              <h3 className="text-xl font-medium">{tips[currentTip].title}</h3>
              <p className="text-muted-foreground">{tips[currentTip].content}</p>
            </div>
          ) : loading ? (
            <div className="text-center py-4">
              <div className="animate-pulse">
                {language === 'ar' ? 'جاري تحليل البيانات...' : 'Analyzing your data...'}
              </div>
            </div>
          ) : (
            <div className="text-center py-4">
              {language === 'ar' 
                ? 'أضف المزيد من الصفقات للحصول على نصائح مخصصة' 
                : 'Add more trades to receive personalized tips'}
            </div>
          )}
        </CardContent>
        
        {tips.length > 1 && (
          <CardFooter className="flex justify-between pt-0">
            <Button variant="ghost" size="sm" onClick={handlePrevious}>
              {language === 'ar' ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
            </Button>
            <span className="text-xs text-muted-foreground">
              {currentTip + 1} / {tips.length}
            </span>
            <Button variant="ghost" size="sm" onClick={handleNext}>
              {language === 'ar' ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
            </Button>
          </CardFooter>
        )}
      </Card>
      
      {/* نصيحة التداول المفصلة */}
      {aiAdvice && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">
              {language === 'ar' ? 'تحليل AI المخصص' : 'AI Custom Analysis'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm">{aiAdvice}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default TradingTips;
