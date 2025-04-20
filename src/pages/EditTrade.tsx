
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '@/components/Layout';
import { useTrade } from '@/contexts/TradeContext';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

const EditTrade: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getTrade } = useTrade();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const fetchTrade = async () => {
      if (!id) {
        navigate('/trades');
        return;
      }

      try {
        setIsLoading(true);
        const trade = await getTrade(id);
        if (!trade) {
          toast({
            title: "Error",
            description: "Trade not found",
            variant: "destructive"
          });
          navigate('/trades');
        }
      } catch (error) {
        console.error('Error fetching trade:', error);
        toast({
          title: "Error",
          description: "Failed to load trade details",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchTrade();
  }, [id, navigate, getTrade, toast]);

  if (isLoading) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-64">
          <p>Loading trade data...</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="mb-6">
        <Button 
          variant="ghost" 
          size="sm" 
          className="mb-2" 
          onClick={() => navigate('/trades')}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Trades
        </Button>
        <h1 className="text-2xl font-bold">Edit Trade</h1>
        <p className="text-gray-500">
          Redirecting to Add Trade form with pre-filled data...
        </p>
      </div>
    </Layout>
  );
};

export default EditTrade;
