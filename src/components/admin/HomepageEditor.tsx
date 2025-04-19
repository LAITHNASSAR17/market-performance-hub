
import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { HomepageContent } from '@/types/settings';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';

const HomepageEditor = () => {
  const [content, setContent] = useState<HomepageContent>({
    id: '',
    title: '',
    subtitle: '',
    description: '',
    features: [],
    primary_button_text: '',
    primary_button_url: '',
    secondary_button_text: '',
    secondary_button_url: '',
    created_at: '',
    updated_at: ''
  });
  
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchContent();
  }, []);

  const fetchContent = async () => {
    try {
      const { data, error } = await supabase
        .from('homepage_content')
        .select('*')
        .single();

      if (error) throw error;
      if (data) setContent(data);
    } catch (error) {
      console.error('Error fetching content:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase
        .from('homepage_content')
        .update({
          title: content.title,
          subtitle: content.subtitle,
          description: content.description,
          features: content.features,
          primary_button_text: content.primary_button_text,
          primary_button_url: content.primary_button_url,
          secondary_button_text: content.secondary_button_text,
          secondary_button_url: content.secondary_button_url
        })
        .eq('id', content.id);

      if (error) throw error;

      toast({
        title: "Changes saved",
        description: "Homepage content has been updated successfully."
      });
    } catch (error) {
      console.error('Error updating content:', error);
      toast({
        title: "Error",
        description: "Failed to save changes.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <Card>
        <CardHeader>
          <CardTitle>Homepage Content</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="title">Title</label>
            <Input
              id="title"
              value={content.title}
              onChange={(e) => setContent({ ...content, title: e.target.value })}
            />
          </div>
          
          <div className="space-y-2">
            <label htmlFor="subtitle">Subtitle</label>
            <Input
              id="subtitle"
              value={content.subtitle}
              onChange={(e) => setContent({ ...content, subtitle: e.target.value })}
            />
          </div>
          
          <div className="space-y-2">
            <label htmlFor="description">Description</label>
            <Textarea
              id="description"
              value={content.description}
              onChange={(e) => setContent({ ...content, description: e.target.value })}
            />
          </div>
          
          <Button type="submit" disabled={loading}>
            {loading ? 'Saving...' : 'Save Changes'}
          </Button>
        </CardContent>
      </Card>
    </form>
  );
};

export default HomepageEditor;
