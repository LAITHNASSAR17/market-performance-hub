
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Loader2, Link, CheckCircle, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { togglePlaybookPublic } from "@/services/playbookService";
import { PlaybookEntry } from "@/hooks/usePlaybooks";

interface SharePlaybookDialogProps {
  isOpen: boolean;
  onClose: () => void;
  playbook: PlaybookEntry;
  onPlaybookUpdated: (updatedPlaybook: Partial<PlaybookEntry>) => void;
}

const SharePlaybookDialog: React.FC<SharePlaybookDialogProps> = ({
  isOpen,
  onClose,
  playbook,
  onPlaybookUpdated
}) => {
  const [isPublic, setIsPublic] = useState<boolean>(!!playbook.is_public);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [publicToken, setPublicToken] = useState<string | undefined>(playbook.public_token);
  const [copied, setCopied] = useState<boolean>(false);
  const { toast } = useToast();

  const publicUrl = publicToken 
    ? `${window.location.origin}/public/playbook/${publicToken}`
    : '';

  const handleTogglePublic = async () => {
    setIsLoading(true);
    
    try {
      const newPublicStatus = !isPublic;
      const result = await togglePlaybookPublic(playbook.id, newPublicStatus);
      
      if (result.success) {
        setIsPublic(newPublicStatus);
        setPublicToken(result.token);
        onPlaybookUpdated({ 
          is_public: newPublicStatus,
          public_token: result.token 
        });
        
        toast({
          title: newPublicStatus ? "Playbook is now public" : "Playbook is now private",
          description: newPublicStatus 
            ? "Anyone with the link can now view this playbook" 
            : "This playbook is no longer accessible via public link",
        });
      } else {
        toast({
          title: "Error updating playbook",
          description: result.error || "Failed to update playbook status",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error updating playbook public status:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyLink = () => {
    if (publicUrl) {
      navigator.clipboard.writeText(publicUrl);
      setCopied(true);
      toast({
        title: "Link copied!",
        description: "The public link has been copied to your clipboard",
      });
      
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleRegenerateLink = async () => {
    setIsLoading(true);
    
    try {
      // Setting to private first
      await togglePlaybookPublic(playbook.id, false);
      // Then back to public to generate a new token
      const result = await togglePlaybookPublic(playbook.id, true);
      
      if (result.success && result.token) {
        setPublicToken(result.token);
        onPlaybookUpdated({ public_token: result.token });
        
        toast({
          title: "Link regenerated",
          description: "A new public link has been created",
        });
      } else {
        toast({
          title: "Error regenerating link",
          description: result.error || "Failed to generate a new link",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error regenerating playbook link:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Share Playbook</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          <div className="flex items-center space-x-2">
            <Switch
              id="public-toggle"
              checked={isPublic}
              onCheckedChange={handleTogglePublic}
              disabled={isLoading}
            />
            <Label htmlFor="public-toggle" className="font-medium">
              Make this playbook public
            </Label>
          </div>

          {isPublic && (
            <>
              <div className="space-y-2">
                <Label htmlFor="public-link" className="font-medium">
                  Public link
                </Label>
                <div className="flex space-x-2">
                  <Input
                    id="public-link"
                    value={publicUrl}
                    readOnly
                    className="flex-1"
                  />
                  <Button 
                    type="button" 
                    size="icon" 
                    onClick={handleCopyLink}
                    disabled={!publicUrl || isLoading}
                    variant="outline"
                  >
                    {copied ? <CheckCircle className="h-4 w-4" /> : <Link className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
              
              <div className="flex justify-between items-center">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleRegenerateLink}
                  disabled={isLoading}
                  className="flex items-center gap-1"
                >
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <RefreshCw className="h-4 w-4" />
                  )}
                  Regenerate link
                </Button>
                
                <p className="text-xs text-muted-foreground">
                  Regenerating will invalidate the previous link
                </p>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SharePlaybookDialog;
