
import React from 'react';
import { Button } from '@/components/ui/button';
import { ImagePlus, Trash2 } from 'lucide-react';

interface BeforeTradeImageProps {
  imageUrl: string | undefined;
  onImageUpload: () => void;
  onImageRemove: () => void;
}

const BeforeTradeImage: React.FC<BeforeTradeImageProps> = ({
  imageUrl,
  onImageUpload,
  onImageRemove
}) => {
  return (
    <div>
      {imageUrl ? (
        <div className="relative">
          <img src={imageUrl} alt="Before Trade" className="rounded-md max-h-40 object-cover" />
          <Button
            variant="secondary"
            size="sm"
            className="absolute top-2 right-2 rounded-full h-8 w-8 p-0"
            onClick={onImageRemove}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <Button variant="outline" onClick={onImageUpload}>
          <ImagePlus className="h-4 w-4 mr-2" />
          Upload Before Image
        </Button>
      )}
    </div>
  );
};

export default BeforeTradeImage;
