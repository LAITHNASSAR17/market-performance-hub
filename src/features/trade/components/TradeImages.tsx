
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import BeforeTradeImage from './trade-images/BeforeTradeImage';
import AfterTradeImage from './trade-images/AfterTradeImage';
import ChartImage from './trade-images/ChartImage';
import UpgradePrompt from '@/components/UpgradePrompt';

interface TradeImagesProps {
  canUploadImages: boolean;
  beforeImageUrl: string | undefined;
  afterImageUrl: string | undefined;
  imageUrl: string | undefined;
  onImageUpload: (type: 'before' | 'after' | 'chart') => void;
  onImageRemove: (type: 'before' | 'after' | 'chart') => void;
}

const TradeImages: React.FC<TradeImagesProps> = ({
  canUploadImages,
  beforeImageUrl,
  afterImageUrl,
  imageUrl,
  onImageUpload,
  onImageRemove
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Trade Images</CardTitle>
        <CardDescription>Upload before, after, and chart images for your trade.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {!canUploadImages ? (
          <UpgradePrompt 
            title="Image Upload Unavailable"
            description="Upgrade your subscription to upload trade images"
            feature="Image Upload"
          />
        ) : (
          <>
            <div>
              <Label>Before Trade Image</Label>
              <BeforeTradeImage
                imageUrl={beforeImageUrl}
                onImageUpload={() => onImageUpload('before')}
                onImageRemove={() => onImageRemove('before')}
              />
            </div>

            <div>
              <Label>After Trade Image</Label>
              <AfterTradeImage
                imageUrl={afterImageUrl}
                onImageUpload={() => onImageUpload('after')}
                onImageRemove={() => onImageRemove('after')}
              />
            </div>

            <div>
              <Label>Chart Image</Label>
              <ChartImage
                imageUrl={imageUrl}
                onImageUpload={() => onImageUpload('chart')}
                onImageRemove={() => onImageRemove('chart')}
              />
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default TradeImages;
