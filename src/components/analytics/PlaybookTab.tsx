
import React, { useState } from 'react';
import { usePlaybooks } from '@/hooks/usePlaybooks';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import PlaybookCard from '@/components/analytics/PlaybookCard';

const PlaybookTab: React.FC = () => {
  const { playbooks, isLoading, error, addPlaybook, updatePlaybook, deletePlaybook } = usePlaybooks();
  const { toast } = useToast();
  const [newPlaybookName, setNewPlaybookName] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  const handleAddPlaybook = async () => {
    if (!newPlaybookName.trim()) {
      toast({
        title: "Error",
        description: "Playbook name cannot be empty.",
        variant: "destructive"
      });
      return;
    }

    setIsAdding(true);
    try {
      await addPlaybook({
        name: newPlaybookName,
        description: 'New playbook description',
        rules: [],
        isActive: true,
        userId: '1',
        order: playbooks.length + 1,
        tradeType: 'both',
        tags: [],
        category: 'other',
        rating: 0
      });
      setNewPlaybookName('');
      toast({
        title: "Success",
        description: "Playbook added successfully."
      });
    } catch (err) {
      console.error("Error adding playbook:", err);
      toast({
        title: "Error",
        description: "Failed to add playbook.",
        variant: "destructive"
      });
    } finally {
      setIsAdding(false);
    }
  };

  const handleDeletePlaybook = async (id: string) => {
    try {
      await deletePlaybook(id);
      toast({
        title: "Success",
        description: "Playbook deleted successfully."
      });
    } catch (err) {
      console.error("Error deleting playbook:", err);
      toast({
        title: "Error",
        description: "Failed to delete playbook.",
        variant: "destructive"
      });
    }
  };

  if (isLoading) {
    return <p>Loading playbooks...</p>;
  }

  if (error) {
    return <p>Error: {error}</p>;
  }

  return (
    <div>
      <Tabs defaultValue="all" className="w-full">
        <TabsList>
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="trend">Trend</TabsTrigger>
          <TabsTrigger value="reversal">Reversal</TabsTrigger>
          <TabsTrigger value="breakout">Breakout</TabsTrigger>
          <TabsTrigger value="other">Other</TabsTrigger>
        </TabsList>
        
        <div className="mt-4 flex items-center gap-4">
          <input
            type="text"
            placeholder="Enter playbook name"
            value={newPlaybookName}
            onChange={(e) => setNewPlaybookName(e.target.value)}
            className="border rounded px-3 py-2 w-64"
          />
          <Button onClick={handleAddPlaybook} disabled={isAdding}>
            {isAdding ? 'Adding...' : 'Add Playbook'}
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
          {playbooks.map(playbook => (
            <PlaybookCard
              key={playbook.id}
              playbook={playbook}
              onDelete={() => handleDeletePlaybook(playbook.id)}
            />
          ))}
        </div>
      </Tabs>
    </div>
  );
};

export default PlaybookTab;
