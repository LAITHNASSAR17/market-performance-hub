
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Info, Check } from 'lucide-react';
import FaviconUpload from '@/components/FaviconUpload';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface SystemSettingsExtendedProps {
  // Add any props if needed
}

const SystemSettingsExtended: React.FC<SystemSettingsExtendedProps> = () => {
  const { users, getAllUsers } = useAuth();
  const { toast } = useToast();
  const [adminUsers, setAdminUsers] = useState<any[]>([]);

  useEffect(() => {
    // Get all users from localStorage directly to verify consistency
    const storedUsers = localStorage.getItem('users');
    try {
      const parsedUsers = storedUsers ? JSON.parse(storedUsers) : [];
      const admins = parsedUsers.filter((user: any) => user.isAdmin);
      setAdminUsers(admins);
    } catch (error) {
      console.error('Error parsing users from localStorage:', error);
    }
  }, []);

  const handleResetAdmin = () => {
    // Check if users exist in localStorage
    const storedUsers = localStorage.getItem('users');
    let parsedUsers = [];
    
    try {
      parsedUsers = storedUsers ? JSON.parse(storedUsers) : [];
    } catch (error) {
      console.error('Error parsing users:', error);
      parsedUsers = [];
    }
    
    // Create admin user if not exists or reset if exists
    const adminEmail = 'lnmr2001@gmail.com';
    const adminPassword = 'password123';
    
    // Find admin user by email
    const adminIndex = parsedUsers.findIndex((user: any) => user.email === adminEmail);
    
    if (adminIndex !== -1) {
      // Update admin user
      parsedUsers[adminIndex] = {
        ...parsedUsers[adminIndex],
        password: 'a6d08a7c56eece8c2b7ba2ed1ebaacb4e4c01c4b2c84c7a0e90b6504756b8963', // Hashed 'password123'
        isAdmin: true,
        isBlocked: false,
      };
    } else {
      // Add new admin user
      parsedUsers.push({
        id: 'admin-1',
        name: 'Admin User',
        email: adminEmail,
        password: 'a6d08a7c56eece8c2b7ba2ed1ebaacb4e4c01c4b2c84c7a0e90b6504756b8963', // Hashed 'password123'
        encryptedName: 'U2FsdGVkX1+bBJfMjlTCZiJdz5s/xsqrR7YEaUSQbA4=', // Encrypted 'Admin User'
        encryptedEmail: 'U2FsdGVkX19C4hV5F6eqGJnXoZMOYwylkRzhxd0OJiPXsJLtUQg0b9ykHwdQp+IV', // Encrypted 'lnmr2001@gmail.com'
        isAdmin: true,
        isBlocked: false,
      });
    }
    
    // Save updated users to localStorage
    localStorage.setItem('users', JSON.stringify(parsedUsers));
    
    // Update users in state
    getAllUsers();
    
    // Show confirmation toast
    toast({
      title: "Admin Account Reset",
      description: "The admin account has been reset successfully.",
    });

    // Reload the page to reflect changes
    window.location.reload();
  };

  return (
    <div className="space-y-6">
      {/* Favicon Upload Component */}
      <Card>
        <CardHeader>
          <CardTitle>Favicon Settings</CardTitle>
          <CardDescription>Upload and manage the website favicon</CardDescription>
        </CardHeader>
        <CardContent>
          <FaviconUpload />
        </CardContent>
      </Card>

      {/* Admin Account Information */}
      <Card>
        <CardHeader>
          <CardTitle>Admin Accounts</CardTitle>
          <CardDescription>View and manage admin accounts</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {adminUsers.length > 0 ? (
            <>
              <Alert className="bg-blue-50 border-blue-200">
                <Info className="h-4 w-4 text-blue-500" />
                <AlertDescription className="text-blue-700">
                  <p>The following admin accounts are currently active:</p>
                </AlertDescription>
              </Alert>
              
              <div className="rounded-md border overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {adminUsers.map((admin: any) => (
                      <tr key={admin.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{admin.name}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{admin.email}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {admin.isBlocked ? (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                              Blocked
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              Active
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          ) : (
            <Alert className="bg-amber-50 border-amber-200">
              <AlertCircle className="h-4 w-4 text-amber-500" />
              <AlertDescription className="text-amber-700">
                No admin accounts were found. Use the reset button below to create a default admin account.
              </AlertDescription>
            </Alert>
          )}
          
          <div className="mt-4 pt-4 border-t flex flex-col space-y-2">
            <Label className="font-medium">Reset Admin Account</Label>
            <p className="text-sm text-gray-600 mb-2">
              This will reset the admin account to its default settings. Use this if you're having trouble logging in.
            </p>
            <div className="flex items-start space-x-4">
              <div className="bg-gray-100 p-3 rounded-md flex-grow">
                <p className="font-medium text-sm">Admin Credentials:</p>
                <div className="mt-1 grid grid-cols-2 gap-2 text-sm">
                  <div>Email:</div>
                  <div className="font-mono">lnmr2001@gmail.com</div>
                  <div>Password:</div>
                  <div className="font-mono">password123</div>
                </div>
              </div>
              <Button 
                onClick={handleResetAdmin} 
                className="bg-amber-600 hover:bg-amber-700 text-white"
              >
                Reset Admin Account
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SystemSettingsExtended;
