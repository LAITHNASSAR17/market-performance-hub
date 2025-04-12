
import React, { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface ProfileFormData {
  username: string;
  email: string;
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

interface UpdateUserProfileDialogProps {
  open: boolean;
  onClose: () => void;
  onUpdateProfile: (userData: Partial<ProfileFormData>) => Promise<void>;
  currentUsername: string;
  currentEmail: string;
}

const UpdateUserProfileDialog: React.FC<UpdateUserProfileDialogProps> = ({ 
  open, 
  onClose, 
  onUpdateProfile,
  currentUsername,
  currentEmail
}) => {
  const [userData, setUserData] = useState<ProfileFormData>({
    username: currentUsername,
    email: currentEmail,
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<'profile' | 'password'>('profile');
  const { toast } = useToast();

  const validateProfileForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!userData.username.trim()) {
      newErrors.username = 'Username is required';
    }
    
    if (!userData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(userData.email)) {
      newErrors.email = 'Email is invalid';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validatePasswordForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!userData.currentPassword) {
      newErrors.currentPassword = 'Current password is required';
    }
    
    if (!userData.newPassword) {
      newErrors.newPassword = 'New password is required';
    } else if (userData.newPassword.length < 6) {
      newErrors.newPassword = 'Password must be at least 6 characters';
    }
    
    if (userData.newPassword !== userData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (mode === 'profile' && !validateProfileForm()) {
      return;
    }
    
    if (mode === 'password' && !validatePasswordForm()) {
      return;
    }
    
    setLoading(true);
    try {
      if (mode === 'profile') {
        await onUpdateProfile({
          username: userData.username,
          email: userData.email
        });
        toast({
          title: 'Profile Updated',
          description: 'Your profile has been updated successfully.',
        });
      } else {
        await onUpdateProfile({
          currentPassword: userData.currentPassword,
          newPassword: userData.newPassword
        });
        toast({
          title: 'Password Changed',
          description: 'Your password has been changed successfully.',
        });
        // Reset password fields after successful update
        setUserData(prev => ({
          ...prev,
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        }));
      }
    } catch (error) {
      console.error('Failed to update profile:', error);
      toast({
        title: 'Error',
        description: 'Failed to update profile. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setUserData(prev => ({ ...prev, [name]: value }));
    
    // Clear the error for this field when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const renderProfileForm = () => (
    <>
      <div className="grid gap-4 py-4">
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="username" className="text-right">
            Username
          </Label>
          <div className="col-span-3">
            <Input
              id="username"
              name="username"
              placeholder="Enter username"
              value={userData.username}
              onChange={handleChange}
              className={errors.username ? "border-red-500" : ""}
            />
            {errors.username && (
              <p className="text-xs text-red-500 mt-1">{errors.username}</p>
            )}
          </div>
        </div>
        
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="email" className="text-right">
            Email
          </Label>
          <div className="col-span-3">
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="Enter email address"
              value={userData.email}
              onChange={handleChange}
              className={errors.email ? "border-red-500" : ""}
            />
            {errors.email && (
              <p className="text-xs text-red-500 mt-1">{errors.email}</p>
            )}
          </div>
        </div>
      </div>
    </>
  );

  const renderPasswordForm = () => (
    <>
      <div className="grid gap-4 py-4">
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="currentPassword" className="text-right">
            Current Password
          </Label>
          <div className="col-span-3">
            <Input
              id="currentPassword"
              name="currentPassword"
              type="password"
              placeholder="Enter current password"
              value={userData.currentPassword}
              onChange={handleChange}
              className={errors.currentPassword ? "border-red-500" : ""}
            />
            {errors.currentPassword && (
              <p className="text-xs text-red-500 mt-1">{errors.currentPassword}</p>
            )}
          </div>
        </div>
        
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="newPassword" className="text-right">
            New Password
          </Label>
          <div className="col-span-3">
            <Input
              id="newPassword"
              name="newPassword"
              type="password"
              placeholder="Enter new password"
              value={userData.newPassword}
              onChange={handleChange}
              className={errors.newPassword ? "border-red-500" : ""}
            />
            {errors.newPassword && (
              <p className="text-xs text-red-500 mt-1">{errors.newPassword}</p>
            )}
          </div>
        </div>
        
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="confirmPassword" className="text-right">
            Confirm Password
          </Label>
          <div className="col-span-3">
            <Input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              placeholder="Confirm new password"
              value={userData.confirmPassword}
              onChange={handleChange}
              className={errors.confirmPassword ? "border-red-500" : ""}
            />
            {errors.confirmPassword && (
              <p className="text-xs text-red-500 mt-1">{errors.confirmPassword}</p>
            )}
          </div>
        </div>
      </div>
    </>
  );

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {mode === 'profile' ? 'Update Profile' : 'Change Password'}
          </DialogTitle>
          <DialogDescription>
            {mode === 'profile' 
              ? 'Update your profile information.' 
              : 'Change your account password.'}
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex space-x-1 mb-4">
          <Button 
            variant={mode === 'profile' ? 'default' : 'outline'} 
            size="sm"
            onClick={() => setMode('profile')}
          >
            Profile Info
          </Button>
          <Button 
            variant={mode === 'password' ? 'default' : 'outline'} 
            size="sm"
            onClick={() => setMode('password')}
          >
            Change Password
          </Button>
        </div>
        
        <form onSubmit={handleSubmit}>
          {mode === 'profile' ? renderProfileForm() : renderPasswordForm()}
          
          <DialogFooter>
            <Button variant="outline" type="button" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Updating..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default UpdateUserProfileDialog;
