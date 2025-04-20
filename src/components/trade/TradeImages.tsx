
import React from 'react';
import ImageUploader from '@/components/ImageUploader';

interface TradeImagesProps {
  beforeImageUrl: string | null;
  afterImageUrl: string | null;
  additionalImageUrl: string | null;
  onImageUpload: (url: string, field: string) => void;
}

const TradeImages: React.FC<TradeImagesProps> = ({
  beforeImageUrl,
  afterImageUrl,
  additionalImageUrl,
  onImageUpload
}) => {
  return (
    <div className="grid md:grid-cols-3 gap-4">
      <ImageUploader
        label="Before Image"
        onUpload={(url) => onImageUpload(url, 'beforeImageUrl')}
        existingImageUrl={beforeImageUrl}
      />
      <ImageUploader
        label="After Image"
        onUpload={(url) => onImageUpload(url, 'afterImageUrl')}
        existingImageUrl={afterImageUrl}
      />
      <ImageUploader
        label="Additional Image"
        onUpload={(url) => onImageUpload(url, 'imageUrl')}
        existingImageUrl={additionalImageUrl}
      />
    </div>
  );
};

export default TradeImages;
