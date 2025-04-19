
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { ImagePlus, Trash2 } from 'lucide-react';
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
              {beforeImageUrl ? (
                <div className="relative">
                  <img src={beforeImageUrl} alt="Before Trade" className="rounded-md max-h-40 object-cover" />
                  <Button
                    variant="secondary"
                    size="sm"
                    className="absolute top-2 right-2 rounded-full h-8 w-8 p-0"
                    onClick={() => onImageRemove('before')}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <Button variant="outline" onClick={() => onImageUpload('before')}>
                  <ImagePlus className="h-4 w-4 mr-2" />
                  Upload Before Image
                </Button>
              )}
            </div>

            <div>
              <Label>After Trade Image</Label>
              {afterImageUrl ? (
                <div className="relative">
                  <img src={afterImageUrl} alt="After Trade" className="rounded-md max-h-40 object-cover" />
                  <Button
                    variant="secondary"
                    size="sm"
                    className="absolute top-2 right-2 rounded-full h-8 w-8 p-0"
                    onClick={() => onImageRemove('after')}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <Button variant="outline" onClick={() => onImageUpload('after')}>
                  <ImagePlus className="h-4 w-4 mr-2" />
                  Upload After Image
                </Button>
              )}
            </div>

            <div>
              <Label>Chart Image</Label>
              {imageUrl ? (
                <div className="relative">
                  <img src={imageUrl} alt="Chart" className="rounded-md max-h-40 object-cover" />
                  <Button
                    variant="secondary"
                    size="sm"
                    className="absolute top-2 right-2 rounded-full h-8 w-8 p-0"
                    onClick={() => onImageRemove('chart')}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <Button variant="outline" onClick={() => onImageUpload('chart')}>
                  <ImagePlus className="h-4 w-4 mr-2" />
                  Upload Chart Image
                </Button>
              )}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default TradeImages;

