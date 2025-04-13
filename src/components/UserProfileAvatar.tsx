
import React, { useState } from 'react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Plus, User, Loader2 } from 'lucide-react';
import { uploadFile } from '@/lib/supabase';

interface UserProfileAvatarProps {
  avatarUrl?: string | null;
  name?: string;
  userId: string;
  onAvatarChange: (url: string) => void;
}

const UserProfileAvatar: React.FC<UserProfileAvatarProps> = ({
  avatarUrl,
  name,
  userId,
  onAvatarChange
}) => {
  const [uploading, setUploading] = useState(false);
  
  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file');
      return;
    }
    
    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      alert('File size must be less than 2MB');
      return;
    }
    
    try {
      setUploading(true);
      const filePath = `avatars/${userId}_${new Date().getTime()}`;
      const url = await uploadFile('profiles', filePath, file);
      
      if (url) {
        onAvatarChange(url);
      }
    } catch (error) {
      console.error('Error uploading avatar:', error);
      alert('Failed to upload avatar');
    } finally {
      setUploading(false);
    }
  };
  
  const getInitials = (name: string) => {
    return name?.split(' ')
      .map(part => part.charAt(0).toUpperCase())
      .join('')
      .substring(0, 2) || 'U';
  };
  
  return (
    <div className="flex flex-col items-center space-y-4">
      <Avatar className="h-24 w-24 relative group">
        <AvatarImage src={avatarUrl || undefined} alt={name || 'User'} />
        <AvatarFallback className="bg-primary/10 text-primary text-lg">
          {name ? getInitials(name) : <User className="h-8 w-8" />}
        </AvatarFallback>
        
        <div className="absolute inset-0 bg-black bg-opacity-40 rounded-full opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
          <label 
            htmlFor="avatar-upload" 
            className="cursor-pointer flex items-center justify-center w-full h-full"
          >
            {uploading ? (
              <Loader2 className="h-8 w-8 text-white animate-spin" />
            ) : (
              <Plus className="h-8 w-8 text-white" />
            )}
          </label>
        </div>
      </Avatar>
      
      <input
        id="avatar-upload"
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
        disabled={uploading}
      />
      
      <label htmlFor="avatar-upload">
        <Button 
          variant="outline" 
          size="sm" 
          disabled={uploading}
          className="cursor-pointer"
          type="button"
        >
          {uploading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Uploading...
            </>
          ) : avatarUrl ? 'Change Photo' : 'Upload Photo'}
        </Button>
      </label>
    </div>
  );
};

export default UserProfileAvatar;
