
import React, { useState, useEffect } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from '@/contexts/AuthContext';
import { PlusCircle, Search, RefreshCcw, Trash2, Edit, ExternalLink, Shield, ShieldOff, CheckCircle, XCircle } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface User {
  id: string;
  name: string;
  email: string;
  isAdmin: boolean;
  isActive: boolean;
  createdAt: string;
  subscriptionTier: string;
}

const AdminUsers: React.FC = () => {
  const { toast } = useToast();
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    isAdmin: false,
    subscriptionTier: 'Basic'
  });

  // Fetch users on component mount
  useEffect(() => {
    fetchUsers();
  }, []);

  // Filter users when search query changes
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredUsers(users);
      return;
    }

    const lowerCaseQuery = searchQuery.toLowerCase();
    const filtered = users.filter(user => 
      user.name.toLowerCase().includes(lowerCaseQuery) ||
      user.email.toLowerCase().includes(lowerCaseQuery)
    );
    
    setFilteredUsers(filtered);
  }, [searchQuery, users]);

  const fetchUsers = async () => {
    setIsLoading(true);
    
    // Simulate API call to fetch users
    setTimeout(() => {
      const mockUsers: User[] = [
        {
          id: '1',
          name: 'John Doe',
          email: 'john.doe@example.com',
          isAdmin: false,
          isActive: true,
          createdAt: '2023-05-15T10:30:00',
          subscriptionTier: 'Basic'
        },
        {
          id: '2',
          name: 'Jane Smith',
          email: 'jane.smith@example.com',
          isAdmin: false,
          isActive: true,
          createdAt: '2023-06-22T14:45:00',
          subscriptionTier: 'Premium'
        },
        {
          id: '3',
          name: 'Admin User',
          email: 'admin@example.com',
          isAdmin: true,
          isActive: true,
          createdAt: '2022-11-05T09:15:00',
          subscriptionTier: 'Enterprise'
        },
        {
          id: '4',
          name: 'Inactive User',
          email: 'inactive@example.com',
          isAdmin: false,
          isActive: false,
          createdAt: '2023-07-10T16:20:00',
          subscriptionTier: 'Basic'
        }
      ];
      
      setUsers(mockUsers);
      setFilteredUsers(mockUsers);
      setIsLoading(false);
    }, 800);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCreateUser = () => {
    // Validate input
    if (!formData.name || !formData.email || !formData.password) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }
    
    if (formData.password !== formData.confirmPassword) {
      toast({
        title: "Password Mismatch",
        description: "Passwords do not match",
        variant: "destructive"
      });
      return;
    }
    
    // Create a new user
    const newUser: User = {
      id: (users.length + 1).toString(),
      name: formData.name,
      email: formData.email,
      isAdmin: formData.isAdmin,
      isActive: true,
      createdAt: new Date().toISOString(),
      subscriptionTier: formData.subscriptionTier
    };
    
    setUsers(prev => [...prev, newUser]);
    setFilteredUsers(prev => [...prev, newUser]);
    
    toast({
      title: "User Created",
      description: `${newUser.name} has been added successfully`
    });
    
    // Reset form and close dialog
    setFormData({
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      isAdmin: false,
      subscriptionTier: 'Basic'
    });
    setShowCreateDialog(false);
  };

  const handleEditUser = () => {
    if (!currentUser) return;
    
    // Update the user
    const updatedUsers = users.map(user => 
      user.id === currentUser.id 
        ? { 
            ...user, 
            name: formData.name,
            email: formData.email,
            isAdmin: formData.isAdmin,
            subscriptionTier: formData.subscriptionTier
          } 
        : user
    );
    
    setUsers(updatedUsers);
    setFilteredUsers(updatedUsers);
    
    toast({
      title: "User Updated",
      description: `${formData.name} has been updated successfully`
    });
    
    // Reset and close dialog
    setShowEditDialog(false);
  };

  const handleDeleteUser = (userId: string) => {
    // Confirm before deleting
    if (!window.confirm("Are you sure you want to delete this user?")) {
      return;
    }
    
    const updatedUsers = users.filter(user => user.id !== userId);
    setUsers(updatedUsers);
    setFilteredUsers(updatedUsers);
    
    toast({
      title: "User Deleted",
      description: "The user has been deleted successfully"
    });
  };

  const handleToggleAdmin = (userId: string) => {
    const updatedUsers = users.map(user => 
      user.id === userId 
        ? { ...user, isAdmin: !user.isAdmin } 
        : user
    );
    
    setUsers(updatedUsers);
    setFilteredUsers(updatedUsers);
    
    const targetUser = updatedUsers.find(user => user.id === userId);
    if (targetUser) {
      toast({
        title: targetUser.isAdmin ? "Admin Privileges Granted" : "Admin Privileges Removed",
        description: `${targetUser.name} is ${targetUser.isAdmin ? 'now an admin' : 'no longer an admin'}`
      });
    }
  };

  const handleToggleStatus = (userId: string) => {
    const updatedUsers = users.map(user => 
      user.id === userId 
        ? { ...user, isActive: !user.isActive } 
        : user
    );
    
    setUsers(updatedUsers);
    setFilteredUsers(updatedUsers);
    
    const targetUser = updatedUsers.find(user => user.id === userId);
    if (targetUser) {
      toast({
        title: targetUser.isActive ? "User Activated" : "User Deactivated",
        description: `${targetUser.name} has been ${targetUser.isActive ? 'activated' : 'deactivated'}`
      });
    }
  };

  const openEditDialog = (user: User) => {
    setCurrentUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      password: '',
      confirmPassword: '',
      isAdmin: user.isAdmin,
      subscriptionTier: user.subscriptionTier
    });
    setShowEditDialog(true);
  };

  const handleChangeSubscription = (userId: string, tier: string) => {
    const updatedUsers = users.map(user => 
      user.id === userId 
        ? { ...user, subscriptionTier: tier } 
        : user
    );
    
    setUsers(updatedUsers);
    setFilteredUsers(updatedUsers);
    
    const targetUser = updatedUsers.find(user => user.id === userId);
    if (targetUser) {
      toast({
        title: "Subscription Changed",
        description: `${targetUser.name}'s subscription changed to ${tier}`
      });
    }
  };

  return (
    <AdminLayout>
      <div className="container mx-auto py-10">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">User Management</h1>
          
          <div className="flex space-x-2">
            <Button variant="outline" onClick={fetchUsers}>
              <RefreshCcw className="mr-2 h-4 w-4" />
              Refresh
            </Button>
            
            <Button onClick={() => setShowCreateDialog(true)}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Add User
            </Button>
          </div>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Users</CardTitle>
            <CardDescription>
              Manage all users and their permissions
            </CardDescription>
            <div className="mt-4 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" size={18} />
              <Input
                placeholder="Search users..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Subscription</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-4">
                        Loading users...
                      </TableCell>
                    </TableRow>
                  ) : filteredUsers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-4">
                        No users found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredUsers.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell className="font-medium">{user.name}</TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            user.isAdmin ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
                          }`}>
                            {user.isAdmin ? 'Admin' : 'User'}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            user.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {user.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </TableCell>
                        <TableCell>
                          <Select
                            value={user.subscriptionTier}
                            onValueChange={(value) => handleChangeSubscription(user.id, value)}
                          >
                            <SelectTrigger className="w-32">
                              <SelectValue placeholder="Select tier" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Basic">Basic</SelectItem>
                              <SelectItem value="Premium">Premium</SelectItem>
                              <SelectItem value="Enterprise">Enterprise</SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell>
                          {new Date(user.createdAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="text-right space-x-1">
                          <Button variant="ghost" size="sm" onClick={() => openEditDialog(user)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => handleToggleAdmin(user.id)}>
                            {user.isAdmin ? <ShieldOff className="h-4 w-4" /> : <Shield className="h-4 w-4" />}
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => handleToggleStatus(user.id)}>
                            {user.isActive ? <XCircle className="h-4 w-4" /> : <CheckCircle className="h-4 w-4" />}
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => handleDeleteUser(user.id)}>
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Create User Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Create New User</DialogTitle>
            <DialogDescription>
              Add a new user to the system
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input 
                id="name" 
                name="name" 
                placeholder="Full Name" 
                value={formData.name}
                onChange={handleInputChange}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input 
                id="email" 
                name="email" 
                type="email" 
                placeholder="email@example.com" 
                value={formData.email}
                onChange={handleInputChange}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input 
                id="password" 
                name="password" 
                type="password" 
                value={formData.password}
                onChange={handleInputChange}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input 
                id="confirmPassword" 
                name="confirmPassword" 
                type="password" 
                value={formData.confirmPassword}
                onChange={handleInputChange}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="subscriptionTier">Subscription Tier</Label>
              <Select 
                value={formData.subscriptionTier} 
                onValueChange={(value) => handleSelectChange('subscriptionTier', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select tier" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Basic">Basic</SelectItem>
                  <SelectItem value="Premium">Premium</SelectItem>
                  <SelectItem value="Enterprise">Enterprise</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="isAdmin"
                checked={formData.isAdmin}
                onChange={(e) => handleSelectChange('isAdmin', e.target.checked)}
                className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
              />
              <Label htmlFor="isAdmin">Administrator Account</Label>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateUser}>
              Create User
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Edit User Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
            <DialogDescription>
              Update user information
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Name</Label>
              <Input 
                id="edit-name" 
                name="name" 
                placeholder="Full Name" 
                value={formData.name}
                onChange={handleInputChange}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="edit-email">Email</Label>
              <Input 
                id="edit-email" 
                name="email" 
                type="email" 
                placeholder="email@example.com" 
                value={formData.email}
                onChange={handleInputChange}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="edit-subscriptionTier">Subscription Tier</Label>
              <Select 
                value={formData.subscriptionTier} 
                onValueChange={(value) => handleSelectChange('subscriptionTier', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select tier" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Basic">Basic</SelectItem>
                  <SelectItem value="Premium">Premium</SelectItem>
                  <SelectItem value="Enterprise">Enterprise</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="edit-isAdmin"
                checked={formData.isAdmin}
                onChange={(e) => handleSelectChange('isAdmin', e.target.checked)}
                className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
              />
              <Label htmlFor="edit-isAdmin">Administrator Account</Label>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleEditUser}>
              Update User
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};

export default AdminUsers;
