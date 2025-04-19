
import React, { useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PlusCircle } from 'lucide-react';
import HashtagBadge from '@/components/HashtagBadge';
import { TradeFormValues } from '../tradeFormSchema';

interface AdditionalDetailsProps {
  tags: string[];
  selectedTags: string[];
  onTagToggle: (tag: string) => void;
  onAddNewTag: (tag: string) => void;
}

const AdditionalDetails: React.FC<AdditionalDetailsProps> = ({
  tags,
  selectedTags,
  onTagToggle,
  onAddNewTag
}) => {
  const { register, formState: { errors } } = useFormContext<TradeFormValues>();
  const [isAddingTag, setIsAddingTag] = useState(false);
  const [newTag, setNewTag] = useState('');

  const handleAddTag = () => {
    if (newTag.trim()) {
      onAddNewTag(newTag.trim());
      setNewTag('');
      setIsAddingTag(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Additional Details</CardTitle>
        <CardDescription>Add any additional notes or tags for your trade.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="notes">Notes</Label>
          <Textarea
            id="notes"
            placeholder="e.g., This trade was taken based on a strong support level..."
            {...register('notes')}
          />
          {errors.notes && <p className="text-red-500 text-sm mt-1">{errors.notes.message}</p>}
        </div>

        <div>
          <Label>Tags</Label>
          <div className="flex flex-wrap gap-2 mb-2">
            {tags.map(tag => (
              <HashtagBadge
                key={tag}
                tag={tag}
                selected={selectedTags.includes(tag)}
                onClick={() => onTagToggle(tag)}
              />
            ))}
            <Button variant="ghost" size="sm" onClick={() => setIsAddingTag(true)}>
              <PlusCircle className="h-4 w-4 mr-2" />
              Add Tag
            </Button>
          </div>

          {isAddingTag && (
            <div className="flex items-center space-x-2">
              <Input
                type="text"
                placeholder="New tag"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
              />
              <Button size="sm" onClick={handleAddTag}>Add</Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default AdditionalDetails;

