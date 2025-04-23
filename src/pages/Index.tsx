
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { LineChart, BarChart, Layers, Shield } from 'lucide-react';

const Index: React.FC = () => {
  const navigate = useNavigate();
  const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
  
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <header className="bg-blue-600 text-white">
        <div className="container mx-auto px-4 py-16 md:py-24">
          <div className="max-w-3xl mx-auto text-center">
            <div className="flex justify-center mb-6">
              <div className="bg-white/20 backdrop-blur-sm p-3 rounded-full">
                <LineChart className="h-10 w-10" />
              </div>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold leading-tight">
              Track Your Trading Journey
            </h1>
            <p className="mt-4 text-xl md:text-2xl text-blue-100">
              Analyze your trades, identify patterns, and improve your performance
            </p>
            <div className="mt-10 flex flex-wrap justify-center gap-4">
              <Button 
                onClick={() => navigate('/login')} 
                size="lg" 
                className="bg-white text-blue-600 hover:bg-blue-50"
              >
                Sign In
              </Button>
              <Button 
                onClick={() => navigate('/register')} 
                size="lg" 
                variant="outline" 
                className="border-white text-white hover:bg-white/20"
              >
                Create Account
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Features Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-10">Powerful Features</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="bg-blue-100 p-3 rounded-full w-fit mb-4">
                <LineChart className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold mb-2">Advanced Analytics</h3>
              <p className="text-gray-600">
                Visualize your trading performance with comprehensive charts and detailed statistics.
              </p>
            </div>
            
            {/* Feature 2 */}
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="bg-green-100 p-3 rounded-full w-fit mb-4">
                <BarChart className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="text-xl font-bold mb-2">Trading Journal</h3>
              <p className="text-gray-600">
                Record and review your trades with detailed notes, images, and emotions tracking.
              </p>
            </div>
            
            {/* Feature 3 */}
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="bg-purple-100 p-3 rounded-full w-fit mb-4">
                <Layers className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="text-xl font-bold mb-2">Performance Insights</h3>
              <p className="text-gray-600">
                Get personalized insights to understand your strengths and areas for improvement.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="bg-gray-100 py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Improve Your Trading?</h2>
          <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
            Join thousands of traders who use our platform to track and improve their trading performance.
          </p>
          <Button 
            onClick={() => navigate('/register')} 
            size="lg" 
            className="bg-blue-600 text-white hover:bg-blue-700"
          >
            Get Started Now
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-800 text-gray-300 py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center mb-4 md:mb-0">
              <LineChart className="h-6 w-6 mr-2" />
              <span className="font-bold">TradeTracker</span>
            </div>
            <div className="text-sm">
              &copy; {new Date().getFullYear()} TradeTracker. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
