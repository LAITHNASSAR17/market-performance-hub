
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { supabase, updateHomepageContent } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { Save, Plus, Trash2 } from 'lucide-react';
import { Json } from '@/integrations/supabase/types';

interface Feature {
  title: string;
  description: string;
  icon: string;
}

interface HomepageContent {
  title: string;
  subtitle: string;
  description: string;
  primaryButtonText: string;
  primaryButtonUrl: string;
  secondaryButtonText: string;
  secondaryButtonUrl: string;
  features: Feature[];
}

const HomepageEditor: React.FC = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Default content
  const defaultContent: HomepageContent = {
    title: "The Trading Journal To Boost Your Performance",
    subtitle: "The Best Trading Journal Software to Help You Find Your Edge",
    description: "Track your trades, analyze your performance, and improve your results with our powerful trading journal.",
    primaryButtonText: "Try It Free For 7 Days",
    primaryButtonUrl: "/register",
    secondaryButtonText: "Learn More",
    secondaryButtonUrl: "/features",
    features: [
      {
        title: "Trade Tracking",
        description: "Log and organize all your trades in one place",
        icon: "📊"
      },
      {
        title: "Performance Analytics",
        description: "Visualize your performance with advanced charts",
        icon: "📈"
      },
      {
        title: "Journal Notes",
        description: "Document your trading strategy and insights",
        icon: "📝"
      },
      {
        title: "Trading Patterns",
        description: "Identify what works and what doesn't",
        icon: "🔍"
      }
    ]
  };
  
  const [content, setContent] = useState<HomepageContent>(defaultContent);
  
  // Fetch homepage content
  useEffect(() => {
    const fetchHomepageContent = async () => {
      try {
        const { data, error } = await supabase
          .from('homepage_content')
          .select('*')
          .single();
          
        if (error) {
          console.error('Error fetching homepage content:', error);
          // Use default content if none exists
          setLoading(false);
          return;
        }
          
        if (data) {
          // Parse the features JSON if stored as string
          let parsedFeatures: Feature[] = [];
          
          // Safety check: make sure we have data and features exist
          if (data.features) {
            if (typeof data.features === 'string') {
              try {
                parsedFeatures = JSON.parse(data.features);
              } catch (e) {
                console.error('Error parsing features:', e);
                parsedFeatures = defaultContent.features;
              }
            } else if (Array.isArray(data.features)) {
              parsedFeatures = data.features as Feature[];
            } else {
              parsedFeatures = defaultContent.features;
            }
          } else {
            parsedFeatures = defaultContent.features;
          }
          
          // Map database field names to our interface field names with safety checks
          const mappedData: HomepageContent = {
            title: data.title || defaultContent.title,
            subtitle: data.subtitle || defaultContent.subtitle,
            description: data.description || defaultContent.description,
            primaryButtonText: data.primary_button_text || defaultContent.primaryButtonText,
            primaryButtonUrl: data.primary_button_url || defaultContent.primaryButtonUrl,
            secondaryButtonText: data.secondary_button_text || defaultContent.secondaryButtonText,
            secondaryButtonUrl: data.secondary_button_url || defaultContent.secondaryButtonUrl,
            features: parsedFeatures
          };
          
          setContent(mappedData);
        }
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchHomepageContent();
  }, []);
  
  // Handle saving homepage content
  const handleSave = async () => {
    setSaving(true);
    
    try {
      // Map our interface field names to database field names
      const dataToSave = {
        title: content.title,
        subtitle: content.subtitle,
        description: content.description,
        primary_button_text: content.primaryButtonText,
        primary_button_url: content.primaryButtonUrl,
        secondary_button_text: content.secondaryButtonText,
        secondary_button_url: content.secondaryButtonUrl,
        features: content.features as unknown as Json
      };
      
      await updateHomepageContent(dataToSave);
      
      toast({
        title: "Homepage Updated",
        description: "Your changes have been saved successfully"
      });
    } catch (error) {
      console.error('Error saving homepage content:', error);
      toast({
        title: "Save Failed",
        description: "There was an error saving your changes",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };
  
  // Update a feature
  const updateFeature = (index: number, field: keyof Feature, value: string) => {
    const updatedFeatures = [...content.features];
    updatedFeatures[index] = {
      ...updatedFeatures[index],
      [field]: value
    };
    
    setContent({
      ...content,
      features: updatedFeatures
    });
  };
  
  // Add new feature
  const addFeature = () => {
    const newFeature: Feature = {
      title: "New Feature",
      description: "Description of the new feature",
      icon: "✨"
    };
    
    setContent({
      ...content,
      features: [...content.features, newFeature]
    });
  };
  
  // Remove feature
  const removeFeature = (index: number) => {
    const updatedFeatures = content.features.filter((_, i) => i !== index);
    
    setContent({
      ...content,
      features: updatedFeatures
    });
  };
  
  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500"></div>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Homepage Editor</CardTitle>
          <CardDescription>
            Customize your homepage content and layout
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Main Content Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Main Content</h3>
            
            <div className="grid gap-4">
              <div className="grid gap-1">
                <Label htmlFor="title">Title</Label>
                <Input 
                  id="title" 
                  value={content.title}
                  onChange={(e) => setContent({...content, title: e.target.value})}
                />
              </div>
              
              <div className="grid gap-1">
                <Label htmlFor="subtitle">Subtitle</Label>
                <Input 
                  id="subtitle" 
                  value={content.subtitle}
                  onChange={(e) => setContent({...content, subtitle: e.target.value})}
                />
              </div>
              
              <div className="grid gap-1">
                <Label htmlFor="description">Description</Label>
                <Textarea 
                  id="description" 
                  rows={3}
                  value={content.description}
                  onChange={(e) => setContent({...content, description: e.target.value})}
                />
              </div>
            </div>
          </div>
          
          {/* Buttons Section */}
          <div className="space-y-4 pt-4 border-t">
            <h3 className="text-lg font-medium">Call to Action Buttons</h3>
            
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-4">
                <div className="grid gap-1">
                  <Label htmlFor="primaryBtn">Primary Button Text</Label>
                  <Input 
                    id="primaryBtn" 
                    value={content.primaryButtonText}
                    onChange={(e) => setContent({...content, primaryButtonText: e.target.value})}
                  />
                </div>
                
                <div className="grid gap-1">
                  <Label htmlFor="primaryUrl">Primary Button URL</Label>
                  <Input 
                    id="primaryUrl" 
                    value={content.primaryButtonUrl}
                    onChange={(e) => setContent({...content, primaryButtonUrl: e.target.value})}
                  />
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="grid gap-1">
                  <Label htmlFor="secondaryBtn">Secondary Button Text</Label>
                  <Input 
                    id="secondaryBtn" 
                    value={content.secondaryButtonText}
                    onChange={(e) => setContent({...content, secondaryButtonText: e.target.value})}
                  />
                </div>
                
                <div className="grid gap-1">
                  <Label htmlFor="secondaryUrl">Secondary Button URL</Label>
                  <Input 
                    id="secondaryUrl" 
                    value={content.secondaryButtonUrl}
                    onChange={(e) => setContent({...content, secondaryButtonUrl: e.target.value})}
                  />
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Features Section */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Homepage Features</CardTitle>
              <CardDescription>
                Add and manage features displayed on the homepage
              </CardDescription>
            </div>
            <Button onClick={addFeature} size="sm" className="gap-1">
              <Plus className="h-4 w-4" />
              Add Feature
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {content.features.map((feature, index) => (
              <div 
                key={index}
                className="p-4 border rounded-md relative space-y-3 hover:border-indigo-300 transition-colors"
              >
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={() => removeFeature(index)}
                  className="absolute top-2 right-2 h-8 w-8 text-destructive hover:text-destructive/90"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
                
                <div className="grid md:grid-cols-[100px_1fr] gap-4 items-start">
                  <div>
                    <Label htmlFor={`icon-${index}`}>Icon</Label>
                    <Input 
                      id={`icon-${index}`}
                      value={feature.icon}
                      onChange={(e) => updateFeature(index, 'icon', e.target.value)}
                      className="mt-1 text-center text-xl"
                    />
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor={`title-${index}`}>Title</Label>
                      <Input 
                        id={`title-${index}`}
                        value={feature.title}
                        onChange={(e) => updateFeature(index, 'title', e.target.value)}
                        className="mt-1"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor={`description-${index}`}>Description</Label>
                      <Textarea 
                        id={`description-${index}`}
                        value={feature.description}
                        onChange={(e) => updateFeature(index, 'description', e.target.value)}
                        className="mt-1"
                        rows={2}
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      
      {/* Save Button */}
      <div className="flex justify-end">
        <Button 
          onClick={handleSave}
          disabled={saving}
          className="gap-2"
        >
          {saving ? (
            <>
              <div className="animate-spin h-4 w-4 border-2 border-t-transparent rounded-full"></div>
              Saving...
            </>
          ) : (
            <>
              <Save className="h-4 w-4" />
              Save Homepage
            </>
          )}
        </Button>
      </div>
    </div>
  );
};

export default HomepageEditor;
