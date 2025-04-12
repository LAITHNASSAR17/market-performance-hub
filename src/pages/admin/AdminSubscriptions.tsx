
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Search, Users, ArrowUp, ArrowDown, Check, X, Badge as BadgeIcon } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';

const AdminSubscriptions: React.FC = () => {
  const { users, getAllUsers, updateSubscriptionTier } = useAuth();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [tierFilter, setTierFilter] = useState('all');
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [newTier, setNewTier] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  
  // Load users on mount
  useEffect(() => {
    loadUsers();
  }, []);
  
  const loadUsers = async () => {
    setIsLoading(true);
    try {
      await getAllUsers();
    } catch (error) {
      console.error('Error loading users:', error);
      toast({
        title: "Error Loading Users",
        description: "Failed to load user data",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Filter users based on search term and tier
  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase());
      
    const matchesTier = tierFilter === 'all' ? true : user.subscription_tier === tierFilter;
    
    return matchesSearch && matchesTier;
  });
  
  // Open upgrade modal for a user
  const handleOpenUpgradeModal = (user: any) => {
    setSelectedUser(user);
    setNewTier(user.subscription_tier || 'free');
    setShowUpgradeModal(true);
  };
  
  // Update user's subscription tier
  const handleUpdateTier = async () => {
    if (!selectedUser || !newTier) return;
    
    try {
      await updateSubscriptionTier(selectedUser.id, newTier);
      setShowUpgradeModal(false);
      
      toast({
        title: "Subscription Updated",
        description: `${selectedUser.name}'s subscription changed to ${newTier}`
      });
      
      // Refresh user list
      loadUsers();
    } catch (error) {
      console.error('Error updating subscription:', error);
      toast({
        title: "Update Failed",
        description: "Could not update subscription tier",
        variant: "destructive"
      });
    }
  };
  
  // Get badge color based on subscription tier
  const getTierBadgeColor = (tier: string) => {
    switch (tier) {
      case 'premium':
        return "bg-purple-100 text-purple-800 border-purple-200";
      case 'enterprise':
        return "bg-indigo-100 text-indigo-800 border-indigo-200";
      case 'free':
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };
  
  return (
    <div>
      <header className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
          Subscription Management
        </h1>
        <p className="mt-1 text-sm md:text-base text-gray-500 dark:text-gray-400">
          Manage and update user subscription plans.
        </p>
      </header>
      
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-grow max-w-sm">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <Input
              className="pl-10 pr-4"
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <Select value={tierFilter} onValueChange={setTierFilter}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Filter by tier" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Tiers</SelectItem>
              <SelectItem value="free">Free</SelectItem>
              <SelectItem value="premium">Premium</SelectItem>
              <SelectItem value="enterprise">Enterprise</SelectItem>
            </SelectContent>
          </Select>
          
          <Button variant="outline" onClick={loadUsers} disabled={isLoading}>
            {isLoading ? "Loading..." : "Refresh"}
          </Button>
        </div>
        
        {/* Users Table */}
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Current Plan</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.length > 0 ? (
                filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.name}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={getTierBadgeColor(user.subscription_tier || 'free')}>
                        {user.subscription_tier ? (
                          user.subscription_tier.charAt(0).toUpperCase() + user.subscription_tier.slice(1)
                        ) : 'Free'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {user.isBlocked ? (
                        <Badge variant="outline" className="bg-red-100 text-red-800 border-red-200">
                          <X className="mr-1 h-3 w-3" />
                          Blocked
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">
                          <Check className="mr-1 h-3 w-3" />
                          Active
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => handleOpenUpgradeModal(user)}
                        className="text-blue-600 border-blue-200 hover:bg-blue-50"
                      >
                        <BadgeIcon className="mr-1 h-4 w-4" />
                        Change Plan
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                    {searchTerm || tierFilter !== 'all' 
                      ? "No users match the current filters" 
                      : "No users found"}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
      
      {/* Change Subscription Modal */}
      <Dialog open={showUpgradeModal} onOpenChange={setShowUpgradeModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change Subscription Plan</DialogTitle>
            <DialogDescription>
              Update the subscription plan for {selectedUser?.name}.
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Current Plan</label>
              <div className="text-lg font-semibold">
                {selectedUser?.subscription_tier 
                  ? selectedUser.subscription_tier.charAt(0).toUpperCase() + selectedUser.subscription_tier.slice(1)
                  : 'Free'}
              </div>
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">New Plan</label>
              <Select value={newTier} onValueChange={setNewTier}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a plan" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="free">Free</SelectItem>
                  <SelectItem value="premium">Premium</SelectItem>
                  <SelectItem value="enterprise">Enterprise</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowUpgradeModal(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateTier}>
              Update Subscription
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminSubscriptions;
