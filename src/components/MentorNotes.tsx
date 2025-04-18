
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useMentor } from '@/contexts/MentorContext';
import { useAuth } from '@/contexts/AuthContext';
import { mentorService, IMentorNote } from '@/services/mentorService';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { Folder, File, Plus, Save, MessageSquare, Clock } from 'lucide-react';
import { format } from 'date-fns';

interface MentorNotesProps {
  menteeId: string;
  className?: string;
}

const MentorNotes: React.FC<MentorNotesProps> = ({ menteeId, className = '' }) => {
  const [notes, setNotes] = useState<IMentorNote[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedNote, setSelectedNote] = useState<IMentorNote | null>(null);
  const [isCreatingNote, setIsCreatingNote] = useState(false);
  const [noteTitle, setNoteTitle] = useState('');
  const [noteContent, setNoteContent] = useState('');
  const { user } = useAuth();
  const { isInMenteeView } = useMentor();
  const { toast } = useToast();

  useEffect(() => {
    const fetchNotes = async () => {
      if (!user || !menteeId) return;

      setLoading(true);
      try {
        const fetchedNotes = await mentorService.getMentorNotes(user.id, menteeId);
        setNotes(fetchedNotes);
      } catch (error) {
        console.error('Error fetching mentor notes:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchNotes();
  }, [user, menteeId]);

  const handleCreateNote = async () => {
    if (!user || !menteeId || !noteTitle.trim() || !noteContent.trim()) return;

    try {
      const newNote = await mentorService.createMentorNote({
        mentorId: user.id,
        menteeId,
        title: noteTitle,
        content: noteContent,
        folder: null,
        templateId: null
      });

      if (newNote) {
        setNotes([newNote, ...notes]);
        setNoteTitle('');
        setNoteContent('');
        setIsCreatingNote(false);
        toast({
          title: 'Note Created',
          description: 'Your feedback note has been saved',
        });
      }
    } catch (error) {
      console.error('Error creating note:', error);
      toast({
        title: 'Error',
        description: 'Failed to create note',
        variant: 'destructive'
      });
    }
  };

  const selectNote = (note: IMentorNote) => {
    setSelectedNote(note);
    setIsCreatingNote(false);
  };

  const startNewNote = () => {
    setSelectedNote(null);
    setNoteTitle('');
    setNoteContent('');
    setIsCreatingNote(true);
  };

  return (
    <Card className={`h-full flex flex-col ${className}`}>
      <CardHeader>
        <CardTitle>Mentor Notes</CardTitle>
        <CardDescription>
          {isInMenteeView
            ? 'Notes and feedback from your mentor'
            : 'Provide feedback and guidance to your mentee'}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-grow flex overflow-hidden">
        <div className="w-1/3 border-r pr-4 overflow-y-auto max-h-[500px]">
          {!isInMenteeView && (
            <Button
              variant="outline"
              className="w-full mb-4 flex items-center justify-center"
              onClick={startNewNote}
            >
              <Plus className="h-4 w-4 mr-2" />
              New Note
            </Button>
          )}

          {loading ? (
            <div className="text-center py-8 text-gray-500">Loading notes...</div>
          ) : notes.length > 0 ? (
            <div className="space-y-2">
              {notes.map((note) => (
                <div
                  key={note.id}
                  className={`p-3 rounded-md cursor-pointer transition-colors ${
                    selectedNote?.id === note.id
                      ? 'bg-primary/10 border border-primary/20'
                      : 'hover:bg-muted'
                  }`}
                  onClick={() => selectNote(note)}
                >
                  <div className="flex items-start">
                    <MessageSquare className="h-4 w-4 mt-1 mr-2 text-primary" />
                    <div className="flex-grow">
                      <h4 className="font-medium text-sm">{note.title}</h4>
                      <p className="text-xs text-gray-500 flex items-center mt-1">
                        <Clock className="h-3 w-3 mr-1" />
                        {format(new Date(note.createdAt), 'MMM d, yyyy')}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              {isInMenteeView
                ? 'No mentor notes yet.'
                : 'No notes created yet. Click "New Note" to provide feedback.'}
            </div>
          )}
        </div>

        <div className="w-2/3 pl-4 overflow-y-auto max-h-[500px]">
          {isCreatingNote && !isInMenteeView ? (
            <div className="space-y-4">
              <div>
                <Label htmlFor="note-title">Title</Label>
                <Input
                  id="note-title"
                  value={noteTitle}
                  onChange={(e) => setNoteTitle(e.target.value)}
                  placeholder="Enter note title"
                />
              </div>
              <div>
                <Label htmlFor="note-content">Content</Label>
                <Textarea
                  id="note-content"
                  value={noteContent}
                  onChange={(e) => setNoteContent(e.target.value)}
                  placeholder="Write your feedback, suggestions, or guidance here..."
                  className="h-64 resize-none"
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsCreatingNote(false)}>
                  Cancel
                </Button>
                <Button 
                  onClick={handleCreateNote}
                  disabled={!noteTitle.trim() || !noteContent.trim()}
                >
                  <Save className="h-4 w-4 mr-2" />
                  Save Note
                </Button>
              </div>
            </div>
          ) : selectedNote ? (
            <div>
              <h3 className="text-xl font-semibold mb-1">{selectedNote.title}</h3>
              <p className="text-sm text-gray-500 mb-4">
                {format(new Date(selectedNote.createdAt), 'MMMM d, yyyy')}
              </p>
              <div className="prose prose-sm max-w-none">
                {selectedNote.content.split('\n').map((paragraph, index) => (
                  <p key={index}>{paragraph}</p>
                ))}
              </div>
            </div>
          ) : (
            <div className="h-full flex items-center justify-center text-center">
              <div className="max-w-xs">
                <MessageSquare className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <h3 className="text-lg font-medium mb-2">No note selected</h3>
                <p className="text-sm text-gray-500">
                  {isInMenteeView
                    ? 'Select a note from the list to view feedback from your mentor.'
                    : 'Select a note to view or create a new one to provide feedback.'}
                </p>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default MentorNotes;
