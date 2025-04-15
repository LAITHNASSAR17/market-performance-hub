import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';

interface HomeContent {
  title: string;
  subtitle: string;
  description: string;
  primaryButtonText: string;
  primaryButtonUrl: string;
  secondaryButtonText: string;
  secondaryButtonUrl: string;
  features: {
    title: string;
    description: string;
    icon?: string;
  }[];
}

const defaultContent: HomeContent = {
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

const Homepage: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [content, setContent] = useState<HomeContent>(defaultContent);
  const [loading, setLoading] = useState(true);
  
  const siteName = localStorage.getItem('siteName') || 'TradeTracker';
  
  useEffect(() => {
    document.title = siteName;
  }, [siteName]);
  
  useEffect(() => {
    const fetchHomepageContent = async () => {
      try {
        const { data, error } = await supabase
          .from('homepage_content')
          .select('*')
          .single();
          
        if (error) {
          console.error('Error fetching homepage content:', error);
          setContent(defaultContent);
        } else if (data) {
          const parsedData = {
            ...data,
            features: typeof data.features === 'string' 
              ? JSON.parse(data.features) 
              : data.features
          };
          setContent(parsedData);
        }
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchHomepageContent();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-indigo-950 to-indigo-900 text-white">
      <header className="container mx-auto px-4 py-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
            <span className="text-xl font-bold">{siteName}</span>
          </div>
          
          <nav className="hidden md:flex space-x-8">
            <Link to="/" className="hover:text-indigo-300 transition">Home</Link>
            <Link to="/features" className="hover:text-indigo-300 transition">Features</Link>
            <Link to="/tutorials" className="hover:text-indigo-300 transition">Tutorials</Link>
          </nav>
          
          <div className="flex space-x-4">
            {isAuthenticated ? (
              <Button asChild variant="default" className="bg-green-500 hover:bg-green-600">
                <Link to="/dashboard">Dashboard</Link>
              </Button>
            ) : (
              <>
                <Button asChild variant="outline" className="border-white text-white hover:bg-white/10">
                  <Link to="/login">Log in</Link>
                </Button>
                <Button asChild variant="default" className="bg-green-500 hover:bg-green-600">
                  <Link to="/register">Sign up</Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </header>

      <section className="flex-1 flex flex-col justify-center items-center text-center px-4 py-16 md:py-24">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">{content.title}</h1>
          <p className="text-xl md:text-2xl text-indigo-200 mb-8">{content.subtitle}</p>
          <p className="text-lg text-indigo-300 mb-10 max-w-2xl mx-auto">{content.description}</p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="bg-green-500 hover:bg-green-600 text-white px-8 py-3 rounded-md font-medium">
              <Link to={content.primaryButtonUrl}>{content.primaryButtonText}</Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="border-white text-white hover:bg-white/10 px-8 py-3 rounded-md font-medium">
              <Link to={content.secondaryButtonUrl}>{content.secondaryButtonText}</Link>
            </Button>
          </div>
          
          <p className="mt-4 text-sm text-indigo-300">*No Credit Card Required</p>
        </div>
      </section>
      
      <section className="container mx-auto px-4 pb-16">
        <div className="relative">
          <div className="bg-black/30 backdrop-blur-sm p-4 rounded-xl overflow-hidden shadow-2xl">
            <img 
              src="/lovable-uploads/657fc0fa-5872-40db-972a-3dfc7ef0e1ba.png"
              alt="Trading Journal Dashboard"
              className="w-full rounded-lg border border-indigo-700/50"
            />
          </div>
        </div>
      </section>
      
      <section className="bg-indigo-900/50 py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Key Features</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {content.features.map((feature, index) => (
              <div key={index} className="bg-indigo-800/40 p-6 rounded-lg hover:bg-indigo-800/60 transition">
                <div className="text-3xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-indigo-300">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      
      <footer className="bg-indigo-950 py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <p className="text-indigo-400">© 2025 {siteName}. All rights reserved.</p>
            </div>
            
            <div className="flex space-x-6">
              <Link to="/privacy" className="text-indigo-400 hover:text-white transition">Privacy</Link>
              <Link to="/terms" className="text-indigo-400 hover:text-white transition">Terms</Link>
              <Link to="/contact" className="text-indigo-400 hover:text-white transition">Contact</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Homepage;
