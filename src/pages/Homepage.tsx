
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { Json } from '@/integrations/supabase/types';

interface Feature {
  title: string;
  description: string;
  icon?: string;
}

interface HomeContent {
  title: string;
  subtitle: string;
  description: string;
  primaryButtonText: string;
  primaryButtonUrl: string;
  secondaryButtonText: string;
  secondaryButtonUrl: string;
  features: Feature[];
}

const Homepage: React.FC = () => {
  const [content, setContent] = useState<HomeContent>({
    title: "Trading Platform",
    subtitle: "Track your trades and improve your performance",
    description: "A powerful platform for serious traders",
    primaryButtonText: "Get Started",
    primaryButtonUrl: "/register",
    secondaryButtonText: "Learn More",
    secondaryButtonUrl: "#features",
    features: [
      {
        title: "Trade Tracking",
        description: "Log all your trades in one place",
        icon: "📊"
      },
      {
        title: "Analytics",
        description: "Gain insights from your trading data",
        icon: "📈"
      },
      {
        title: "Journal",
        description: "Record your thoughts and strategies",
        icon: "📝"
      }
    ]
  });
  
  useEffect(() => {
    const fetchHomepageContent = async () => {
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
          // Parse features if it's a string or JSON array
          let parsedFeatures: Feature[] = [];
          
          if (typeof data.features === 'string') {
            try {
              parsedFeatures = JSON.parse(data.features);
            } catch (e) {
              console.error('Error parsing features:', e);
              parsedFeatures = content.features;
            }
          } else if (data.features && Array.isArray(data.features)) {
            // Cast and transform JSON features to Feature objects
            parsedFeatures = (data.features as Json[]).map((feature: any) => ({
              title: feature.title || 'Feature',
              description: feature.description || 'Description',
              icon: feature.icon
            }));
          } else {
            parsedFeatures = content.features;
          }
          
          // Map database fields to our interface fields
          setContent({
            title: data.title || content.title,
            subtitle: data.subtitle || content.subtitle,
            description: data.description || content.description,
            primaryButtonText: data.primary_button_text || content.primaryButtonText,
            primaryButtonUrl: data.primary_button_url || content.primaryButtonUrl,
            secondaryButtonText: data.secondary_button_text || content.secondaryButtonText,
            secondaryButtonUrl: data.secondary_button_url || content.secondaryButtonUrl,
            features: parsedFeatures.length > 0 ? parsedFeatures : content.features
          });
        }
      } catch (error) {
        console.error('Error:', error);
      }
    };
    
    fetchHomepageContent();
  }, []);
  
  return (
    <div className="container mx-auto py-16">
      <section className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">{content.title}</h1>
        <h2 className="text-2xl text-gray-600 mb-6">{content.subtitle}</h2>
        <p className="text-lg text-gray-700 mb-8">{content.description}</p>
        <div>
          <Link to={content.primaryButtonUrl} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded mr-4">
            {content.primaryButtonText}
          </Link>
          <Link to={content.secondaryButtonUrl} className="bg-transparent hover:bg-gray-100 text-blue-500 font-bold py-3 px-8 rounded border border-blue-500">
            {content.secondaryButtonText}
          </Link>
        </div>
      </section>

      <section id="features" className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {content.features.map((feature, index) => (
          <div key={index} className="p-6 bg-white rounded-lg shadow-md">
            <div className="text-5xl text-blue-500 mb-4">{feature.icon}</div>
            <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
            <p className="text-gray-700">{feature.description}</p>
          </div>
        ))}
      </section>
    </div>
  );
};

export default Homepage;
