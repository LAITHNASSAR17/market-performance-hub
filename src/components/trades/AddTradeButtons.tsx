
import React from 'react';
import { Button } from "@/components/ui/button";
import { Plus, FileUp } from 'lucide-react';
import ImportTradesDialog from './ImportTradesDialog';

interface AddTradeButtonsProps {
  onAddManually: () => void;
}

const AddTradeButtons: React.FC<AddTradeButtonsProps> = ({ onAddManually }) => {
  const [isImportDialogOpen, setIsImportDialogOpen] = React.useState(false);

  return (
    <>
      <div className="flex flex-col sm:flex-row gap-3">
        <Button onClick={onAddManually} className="flex-1">
          <Plus className="mr-2 h-4 w-4" />
          Add Manually
        </Button>
        <Button 
          variant="outline" 
          onClick={() => setIsImportDialogOpen(true)} 
          className="flex-1"
        >
          <FileUp className="mr-2 h-4 w-4" />
          Import from CSV
        </Button>
      </div>

      <ImportTradesDialog
        open={isImportDialogOpen}
        onOpenChange={setIsImportDialogOpen}
      />
    </>
  );
};

export default AddTradeButtons;
