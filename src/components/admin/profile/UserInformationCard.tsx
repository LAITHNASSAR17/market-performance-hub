
import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export function UserInformationCard() {
  const { user, updateProfile } = useAuth();
  const { toast } = useToast();
  const [isUpdating, setIsUpdating] = useState(false);
  const [userData, setUserData] = useState({
    name: user?.name || '',
    email: user?.email || '',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUserData({ ...userData, [e.target.name]: e.target.value });
  };

  const updateUserData = async (userData: any) => {
    setIsUpdating(true);
    try {
      await updateProfile({ name: userData.name });
      toast({
        title: "Success",
        description: "User data updated successfully",
      });
    } catch (error) {
      console.error("Error updating user data:", error);
      toast({
        title: "Error",
        description: "Failed to update user data",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="dark:text-white">User Information</CardTitle>
        <CardDescription className="dark:text-gray-300">
          Update user account information.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-6">
          <div className="grid gap-3">
            <Label htmlFor="name">Full Name</Label>
            <Input
              id="name"
              name="name"
              value={userData.name}
              onChange={handleInputChange}
              placeholder="Enter full name"
            />
          </div>

          <div className="grid gap-3">
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              name="email"
              type="email"
              value={userData.email}
              onChange={handleInputChange}
              placeholder="Enter email address"
            />
          </div>

          <Button
            onClick={() => updateUserData(userData)}
            disabled={isUpdating}
          >
            {isUpdating ? "Updating..." : "Update User Data"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
