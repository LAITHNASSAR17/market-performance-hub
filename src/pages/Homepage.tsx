
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { HomeContent } from '@/types/homepage';

const Homepage: React.FC = () => {
  const navigate = useNavigate();
  const [content, setContent] = useState<HomeContent>({
    id: '',
    title: 'The Trading Journal To Boost Your Performance',
    subtitle: 'The Best Trading Journal Software to Help You Find Your Edge',
    description: 'Track your trades, analyze your performance, and improve your results with our powerful trading journal.',
    primaryButtonText: 'Try It Free For 7 Days',
    primaryButtonUrl: '/register',
    secondaryButtonText: 'Learn More',
    secondaryButtonUrl: '/features',
    features: [],
  });

  useEffect(() => {
    const fetchHomeContent = async () => {
      try {
        const { data, error } = await supabase
          .from('homepage_content')
          .select('*')
          .single();
        
        if (error) {
          console.error('Error fetching homepage content:', error);
          return;
        }
        
        if (data) {
          // Ensure features is an array
          const featuresArray = Array.isArray(data.features) ? data.features : [];
          
          // Convert from database format to our format
          setContent({
            id: data.id,
            title: data.title,
            subtitle: data.subtitle,
            description: data.description,
            primaryButtonText: data.primary_button_text,
            primaryButtonUrl: data.primary_button_url,
            secondaryButtonText: data.secondary_button_text,
            secondaryButtonUrl: data.secondary_button_url,
            features: featuresArray,
            createdAt: data.created_at,
            updatedAt: data.updated_at
          });
        }
      } catch (error) {
        console.error('Error fetching homepage content:', error);
      }
    };
    
    fetchHomeContent();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white mb-6">
            {content.title}
          </h1>
          <p className="text-xl md:text-2xl font-medium text-gray-600 dark:text-gray-300 mb-8">
            {content.subtitle}
          </p>
          <p className="text-lg text-gray-500 dark:text-gray-400 mb-10 max-w-3xl mx-auto">
            {content.description}
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Button 
              size="lg" 
              onClick={() => navigate(content.primaryButtonUrl)}
              className="px-8 py-6 text-lg font-medium"
            >
              {content.primaryButtonText}
            </Button>
            <Button 
              variant="outline" 
              size="lg" 
              onClick={() => navigate(content.secondaryButtonUrl)}
              className="px-8 py-6 text-lg font-medium"
            >
              {content.secondaryButtonText}
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-900 dark:text-white mb-16">
          Key Features
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {content.features.map((feature, index) => (
            <div key={index} className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
              <p className="text-gray-600 dark:text-gray-300">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Homepage;
