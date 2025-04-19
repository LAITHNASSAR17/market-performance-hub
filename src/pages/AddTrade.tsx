import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm, FormProvider } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { format } from 'date-fns';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { useTrade } from '@/contexts/TradeContext';
import { useTagsState } from '@/hooks/useTagsState';
import { useSubscriptionFeatures } from '@/hooks/useSubscriptionFeatures';
import BasicTradeInfo from '@/features/trade/components/BasicTradeInfo';
import PricePoints from '@/features/trade/components/PricePoints';
import RiskReward from '@/features/trade/components/RiskReward';
import AdditionalDetails from '@/features/trade/components/AdditionalDetails';
import TradeImages from '@/features/trade/components/TradeImages';
import { TradeFormValues, tradeSchema } from '@/features/trade/tradeFormSchema';
import { Trade } from '@/types/trade';

const AddTrade: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const methods = useForm<TradeFormValues>({
    resolver: yupResolver(tradeSchema),
    defaultValues: {
      commission: 0,
      rating: 0,
      hashtags: []
    }
  });
  
  const { addTrade, updateTrade, getTrade } = useTrade();
  const { tags, addTag } = useTagsState();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [imageUrl, setImageUrl] = useState<string | undefined>(undefined);
  const [beforeImageUrl, setBeforeImageUrl] = useState<string | undefined>(undefined);
  const [afterImageUrl, setAfterImageUrl] = useState<string | undefined>(undefined);
  const [isStopLossEnabled, setIsStopLossEnabled] = useState(false);
  const [isTakeProfitEnabled, setIsTakeProfitEnabled] = useState(false);
  const { canUseFeature } = useSubscriptionFeatures();

  useEffect(() => {
    if (id) {
      const existingTrade = getTrade(id);
      if (existingTrade) {
        methods.setValue('pair', existingTrade.pair);
        methods.setValue('account', existingTrade.account);
        methods.setValue('type', existingTrade.type);
        methods.setValue('date', new Date(existingTrade.date));
        methods.setValue('durationMinutes', existingTrade.durationMinutes || 0);
        methods.setValue('entry', existingTrade.entry);
        methods.setValue('exit', existingTrade.exit || 0);
        methods.setValue('stopLoss', existingTrade.stopLoss || undefined);
        methods.setValue('takeProfit', existingTrade.takeProfit || undefined);
        methods.setValue('lotSize', existingTrade.lotSize);
        methods.setValue('riskPercentage', existingTrade.riskPercentage);
        methods.setValue('profitLoss', existingTrade.profitLoss);
        methods.setValue('returnPercentage', existingTrade.returnPercentage);
        methods.setValue('notes', existingTrade.notes);
        methods.setValue('commission', existingTrade.commission || 0);
        methods.setValue('rating', existingTrade.rating || 0);
        setSelectedTags(existingTrade.hashtags || []);
        setImageUrl(existingTrade.imageUrl);
        setBeforeImageUrl(existingTrade.beforeImageUrl);
        setAfterImageUrl(existingTrade.afterImageUrl);
        setIsStopLossEnabled(!!existingTrade.stopLoss);
        setIsTakeProfitEnabled(!!existingTrade.takeProfit);
      }
    }
  }, [id, getTrade, methods.setValue]);

  const onSubmit = methods.handleSubmit((data: TradeFormValues) => {
    const tradeData = {
      ...data,
      hashtags: selectedTags,
      imageUrl: imageUrl || null,
      beforeImageUrl: beforeImageUrl || null,
      afterImageUrl: afterImageUrl || null,
      stopLoss: isStopLossEnabled ? data.stopLoss : null,
      takeProfit: isTakeProfitEnabled ? data.takeProfit : null,
      commission: data.commission || 0,
      rating: data.rating || 0,
      date: format(data.date, 'yyyy-MM-dd'),
      total: (data.profitLoss || 0) - (data.commission || 0)
    };

    if (id) {
      updateTrade(id, tradeData);
      toast({
        title: "Trade Updated",
        description: "Your trade has been updated successfully",
      });
    } else {
      addTrade(tradeData as Omit<Trade, 'id' | 'userId' | 'createdAt'>);
      toast({
        title: "Trade Added",
        description: "Your trade has been added successfully",
      });
    }
    navigate('/trades');
  });

  const handleImageUpload = (type: 'before' | 'after' | 'chart') => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = async (event: any) => {
      const file = event.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e: any) => {
          const base64Image = e.target.result;
          switch (type) {
            case 'before':
              setBeforeImageUrl(base64Image);
              break;
            case 'after':
              setAfterImageUrl(base64Image);
              break;
            case 'chart':
              setImageUrl(base64Image);
              break;
          }
        };
        reader.readAsDataURL(file);
      }
    };
    input.click();
  };

  const handleRemoveImage = (type: 'before' | 'after' | 'chart') => {
    switch (type) {
      case 'before':
        setBeforeImageUrl(undefined);
        break;
      case 'after':
        setAfterImageUrl(undefined);
        break;
      case 'chart':
        setImageUrl(undefined);
        break;
    }
  };

  const toggleTag = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  return (
    <Layout>
      <div className="container py-10">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">{id ? 'Edit Trade' : 'Add New Trade'}</h1>

          <FormProvider {...methods}>
            <form onSubmit={onSubmit} className="space-y-6">
              <BasicTradeInfo />
              
              <PricePoints
                isStopLossEnabled={isStopLossEnabled}
                setIsStopLossEnabled={setIsStopLossEnabled}
                isTakeProfitEnabled={isTakeProfitEnabled}
                setIsTakeProfitEnabled={setIsTakeProfitEnabled}
              />
              
              <RiskReward />
              
              <AdditionalDetails
                tags={tags}
                selectedTags={selectedTags}
                onTagToggle={toggleTag}
                onAddNewTag={addTag}
              />
              
              <TradeImages
                canUploadImages={canUseFeature('image_upload')}
                beforeImageUrl={beforeImageUrl}
                afterImageUrl={afterImageUrl}
                imageUrl={imageUrl}
                onImageUpload={handleImageUpload}
                onImageRemove={handleRemoveImage}
              />

              <Button type="submit">{id ? 'Update Trade' : 'Add Trade'}</Button>
            </form>
          </FormProvider>
        </div>
      </div>
    </Layout>
  );
};

export default AddTrade;
