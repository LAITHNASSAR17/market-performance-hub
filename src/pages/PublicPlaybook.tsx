
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/supabase';
import { Badge } from '@/components/ui/badge';
import { Star, Home, AlertTriangle } from 'lucide-react';
import { PlaybookEntry } from '@/hooks/usePlaybooks';
import { Button } from '@/components/ui/button';

const PublicPlaybook = () => {
  const { id } = useParams();
  const [playbook, setPlaybook] = useState<PlaybookEntry | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const fetchPlaybook = async () => {
      try {
        setLoading(true);
        setError(null);
        
        if (!id) {
          throw new Error('معرف الـ Playbook غير موجود');
        }
        
        console.log('Fetching playbook with ID:', id);
        
        // First check if this playbook exists and is marked as public
        const { data: playbooks, error: fetchError } = await supabase
          .from('playbooks')
          .select('*')
          .eq('id', id)
          .eq('is_private', false)
          .single();
          
        if (fetchError) {
          console.error('Error fetching playbook:', fetchError);
          throw new Error('لم نتمكن من العثور على الـ Playbook');
        }
        
        if (!playbooks) {
          throw new Error('الـ Playbook غير موجود أو غير متاح للمشاركة العامة');
        }
        
        console.log('Playbook data retrieved:', playbooks);
        setPlaybook(playbooks);
      } catch (error: any) {
        console.error('Error in public playbook page:', error);
        setError(error.message || 'حدث خطأ أثناء تحميل الـ Playbook');
        toast({
          title: "خطأ",
          description: error.message || "لم نتمكن من العثور على الـ Playbook",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchPlaybook();
  }, [id, toast]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <p>جاري التحميل...</p>
        </div>
      </div>
    );
  }

  if (error || !playbook) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background">
        <div className="text-center max-w-md p-6">
          <div className="mb-6 flex justify-center">
            <AlertTriangle className="h-16 w-16 text-orange-500" />
          </div>
          <h1 className="text-2xl font-bold mb-4">لم نتمكن من العثور على الـ Playbook</h1>
          <p className="text-muted-foreground mb-8">
            {error || 'الـ Playbook غير موجود أو غير متاح للمشاركة العامة'}
          </p>
          
          <Button asChild className="mr-4" variant="default">
            <Link to="/">
              <Home className="mr-2 h-4 w-4" />
              العودة للرئيسية
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-2xl">{playbook.name}</CardTitle>
              <CardDescription>{playbook.description}</CardDescription>
            </div>
            <div className="flex items-center">
              <Star className="h-5 w-5 text-yellow-500 mr-1" />
              <span>{playbook.rating}</span>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-muted/50 p-3 rounded-lg">
              <div className="text-sm font-medium mb-1">نسبة الربح</div>
              <div className="text-2xl font-bold">{playbook.winRate}%</div>
            </div>
            
            <div className="bg-muted/50 p-3 rounded-lg">
              <div className="text-sm font-medium mb-1">معامل الربح</div>
              <div className="text-2xl font-bold">{playbook.profitFactor}</div>
            </div>
            
            <div className="bg-muted/50 p-3 rounded-lg">
              <div className="text-sm font-medium mb-1">إجمالي الصفقات</div>
              <div className="text-2xl font-bold">{playbook.totalTrades}</div>
            </div>
          </div>

          {playbook.rules && playbook.rules.length > 0 && (
            <div>
              <h3 className="font-medium mb-2">القواعد</h3>
              <div className="space-y-2">
                {playbook.rules.map((rule: any, index: number) => (
                  <div key={index} className="bg-muted/50 p-3 rounded-lg">
                    <div className="font-medium mb-1">{rule.type}</div>
                    <div>{rule.description}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {playbook.tags?.length > 0 && (
            <div>
              <h3 className="font-medium mb-2">الوسوم</h3>
              <div className="flex flex-wrap gap-2">
                {playbook.tags.map((tag: string) => (
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

export default PublicPlaybook;
