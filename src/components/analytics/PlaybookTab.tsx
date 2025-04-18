
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle } from 'lucide-react';
import { usePlaybooks } from '@/hooks/usePlaybooks';
import PlaybookCard from './PlaybookCard';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useForm } from 'react-hook-form';

interface PlaybookFormData {
  name: string;
  description: string;
  rules: string[];
}

const PlaybookTab = () => {
  const { toast } = useToast();
  const { playbooks, addPlaybook, updatePlaybook, deletePlaybook } = usePlaybooks();
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const { register, handleSubmit, reset } = useForm<PlaybookFormData>();

  const onSubmit = async (data: PlaybookFormData) => {
    try {
      await addPlaybook({
        ...data,
        rules: data.rules || [],
        trades: []
      });
      
      toast({
        title: "Playbook Created",
        description: "Your new trading playbook has been created successfully"
      });
      
      setIsDialogOpen(false);
      reset();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create playbook",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Trading Playbooks</h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              New Playbook
            </Button>
          </DialogTrigger>
          <DialogContent>
            <form onSubmit={handleSubmit(onSubmit)}>
              <DialogHeader>
                <DialogTitle>Create New Playbook</DialogTitle>
                <DialogDescription>
                  Document your trading strategy and rules
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Playbook Name</Label>
                  <Input
                    id="name"
                    placeholder="e.g., Breakout Strategy"
                    {...register('name', { required: true })}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Describe your trading strategy..."
                    {...register('description', { required: true })}
                  />
                </div>
              </div>
              
              <DialogFooter>
                <Button variant="outline" type="button" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">Create Playbook</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {playbooks.map((playbook) => (
          <PlaybookCard
            key={playbook.id}
            playbook={playbook}
            onUpdate={updatePlaybook}
            onDelete={deletePlaybook}
          />
        ))}
      </div>
    </div>
  );
};

export default PlaybookTab;
