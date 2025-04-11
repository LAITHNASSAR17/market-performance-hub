
import React, { useState } from 'react';
import { Search, Hash, Edit, Trash2, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';

interface Hashtag {
  name: string;
  count: number;
  addedBy: string;
  lastUsed: string;
}

interface HashtagsTableProps {
  hashtags: Hashtag[];
  onAddHashtag: (name: string) => void;
  onEditHashtag: (oldName: string, newName: string) => void;
  onDeleteHashtag: (name: string) => void;
}

const HashtagsTable: React.FC<HashtagsTableProps> = ({
  hashtags,
  onAddHashtag,
  onEditHashtag,
  onDeleteHashtag
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [hashtagName, setHashtagName] = useState('');
  const [selectedHashtag, setSelectedHashtag] = useState<Hashtag | null>(null);

  const handleOpenAddModal = () => {
    setHashtagName('');
    setShowAddModal(true);
  };

  const handleOpenEditModal = (hashtag: Hashtag) => {
    setSelectedHashtag(hashtag);
    setHashtagName(hashtag.name);
    setShowEditModal(true);
  };

  const handleAddHashtag = () => {
    if (hashtagName.trim()) {
      onAddHashtag(hashtagName.trim());
      setShowAddModal(false);
      setHashtagName('');
    }
  };

  const handleEditHashtag = () => {
    if (selectedHashtag && hashtagName.trim() && hashtagName.trim() !== selectedHashtag.name) {
      onEditHashtag(selectedHashtag.name, hashtagName.trim());
      setShowEditModal(false);
      setHashtagName('');
      setSelectedHashtag(null);
    }
  };

  const filteredHashtags = hashtags.filter(
    hashtag => hashtag.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
      <div className="flex flex-col sm:flex-row mb-4 gap-2">
        <div className="relative flex-grow">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <Input
            className="pl-10 pr-4"
            placeholder="Search hashtags..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Button size="sm" className="flex items-center" onClick={handleOpenAddModal}>
          <Hash className="mr-1 h-4 w-4" />
          Add New Hashtag
        </Button>
      </div>
      
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Hashtag</TableHead>
              <TableHead>Count</TableHead>
              <TableHead>Added By</TableHead>
              <TableHead>Last Used</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredHashtags.length > 0 ? (
              filteredHashtags.map((hashtag) => (
                <TableRow key={hashtag.name} className="hover:bg-slate-50">
                  <TableCell className="font-medium">#{hashtag.name}</TableCell>
                  <TableCell>{hashtag.count}</TableCell>
                  <TableCell>{hashtag.addedBy}</TableCell>
                  <TableCell>{hashtag.lastUsed}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => handleOpenEditModal(hashtag)}
                        className="text-amber-600 border-amber-600 hover:bg-amber-50 h-8 w-8 p-0"
                        title="Edit Hashtag"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => onDeleteHashtag(hashtag.name)}
                        className="text-red-600 border-red-600 hover:bg-red-50 h-8 w-8 p-0"
                        title="Delete Hashtag"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                  {searchTerm 
                    ? "No hashtags match your search."
                    : "No hashtags found. Hashtags will appear here once users start using them in trades or notes."}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Add Hashtag Modal */}
      <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add New Hashtag</DialogTitle>
            <DialogDescription>
              Create a new hashtag that users can add to their trades and notes.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="hashtagName" className="text-right">
                Hashtag Name
              </Label>
              <Input
                id="hashtagName"
                placeholder="Enter hashtag name (without #)"
                className="col-span-3"
                value={hashtagName}
                onChange={(e) => setHashtagName(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddModal(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddHashtag} className="bg-purple-600 hover:bg-purple-700">
              <Plus className="mr-2 h-4 w-4" />
              Add Hashtag
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Hashtag Modal */}
      <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Hashtag</DialogTitle>
            <DialogDescription>
              Update the name of the selected hashtag.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="editHashtagName" className="text-right">
                Hashtag Name
              </Label>
              <Input
                id="editHashtagName"
                placeholder="Enter new hashtag name (without #)"
                className="col-span-3"
                value={hashtagName}
                onChange={(e) => setHashtagName(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditModal(false)}>
              Cancel
            </Button>
            <Button onClick={handleEditHashtag} className="bg-purple-600 hover:bg-purple-700">
              <Edit className="mr-2 h-4 w-4" />
              Update Hashtag
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default HashtagsTable;
