
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/supabase';
import { Badge } from '@/components/ui/badge';
import { Star } from 'lucide-react';
import { PlaybookEntry } from '@/hooks/usePlaybooks';

const PublicPlaybook = () => {
  const { id } = useParams();
  const [playbook, setPlaybook] = useState<PlaybookEntry | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchPlaybook = async () => {
      try {
        setLoading(true);
        
        // Check if this is a public playbook first
        const { data: isPublic, error: publicCheckError } = await supabase
          .rpc('is_playbook_public', { playbook_id: id });
          
        if (publicCheckError) {
          console.error('Error checking playbook public status:', publicCheckError);
          throw new Error('Could not verify playbook access');
        }
        
        if (!isPublic) {
          throw new Error('This playbook is not publicly shared');
        }
        
        // Now fetch the playbook details
        const { data, error } = await supabase
          .from('playbooks')
          .select('*')
          .eq('id', id)
          .single();

        if (error) throw error;
        
        if (!data) {
          throw new Error('Playbook not found');
        }
        
        setPlaybook(data);
      } catch (error: any) {
        console.error('Error fetching public playbook:', error);
        toast({
          title: "خطأ",
          description: "لم نتمكن من العثور على الـ Playbook",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchPlaybook();
  }, [id, toast]);

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">جاري التحميل...</div>;
  }

  if (!playbook) {
    return <div className="flex items-center justify-center min-h-screen">لم يتم العثور على الـ Playbook</div>;
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

          {playbook.rules && (
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
