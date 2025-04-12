
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
import { Checkbox } from '@/components/ui/checkbox';

interface UserFormData {
  username: string;
  email: string;
  password: string;
  isAdmin: boolean;
}

interface AddUserDialogProps {
  open: boolean;
  onClose: () => void;
  onAddUser: (userData: UserFormData) => Promise<void>;
}

const AddUserDialog: React.FC<AddUserDialogProps> = ({ open, onClose, onAddUser }) => {
  const [userData, setUserData] = useState<UserFormData>({
    username: '',
    email: '',
    password: '',
    isAdmin: false
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!userData.username.trim()) {
      newErrors.username = 'Username is required';
    }
    
    if (!userData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(userData.email)) {
      newErrors.email = 'Email is invalid';
    }
    
    if (!userData.password) {
      newErrors.password = 'Password is required';
    } else if (userData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    try {
      await onAddUser(userData);
      setUserData({ username: '', email: '', password: '', isAdmin: false });
    } catch (error) {
      console.error('Failed to add user:', error);
      toast({
        title: 'Error',
        description: 'Failed to add user. Please try again.',
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

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add New User</DialogTitle>
          <DialogDescription>
            Create a new user account with the details below.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit}>
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
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="password" className="text-right">
                Password
              </Label>
              <div className="col-span-3">
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="Enter password"
                  value={userData.password}
                  onChange={handleChange}
                  className={errors.password ? "border-red-500" : ""}
                />
                {errors.password && (
                  <p className="text-xs text-red-500 mt-1">{errors.password}</p>
                )}
              </div>
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <div className="col-span-4 flex items-center space-x-2">
                <Checkbox 
                  id="isAdmin" 
                  checked={userData.isAdmin}
                  onCheckedChange={(checked) => 
                    setUserData(prev => ({ ...prev, isAdmin: checked === true }))
                  }
                />
                <Label htmlFor="isAdmin">This user is an administrator</Label>
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" type="button" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Adding..." : "Add User"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddUserDialog;
