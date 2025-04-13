
import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import Layout from '@/components/Layout';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  User, Key, Lock, Save, UserCircle, Mail, Globe, Clock, 
  Trash2, LogOut, BellRing, Server, Settings, AlertTriangle,
  Database, FileDown, CheckCircle2, AlarmClock, FileCheck
} from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';

const AdminProfileSettings: React.FC = () => {
  const { user, updateProfile } = useAuth();
  const { toast } = useToast();
  
  // Profile form state
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [isUpdating, setIsUpdating] = useState(false);
  
  // Password form state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  
  // Platform settings state
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [registrationEnabled, setRegistrationEnabled] = useState(true);
  const [maintenanceMessage, setMaintenanceMessage] = useState('');
  
  // SMTP settings state
  const [smtpHost, setSmtpHost] = useState('');
  const [smtpPort, setSmtpPort] = useState('');
  const [smtpUser, setSmtpUser] = useState('');
  const [smtpPass, setSmtpPass] = useState('');
  
  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      toast({
        title: "Error",
        description: "Name cannot be empty",
        variant: "destructive"
      });
      return;
    }
    
    try {
      setIsUpdating(true);
      await updateProfile(name, email);
      toast({
        title: "Profile Updated",
        description: "Your profile has been updated successfully"
      });
    } catch (error) {
      console.error('Error updating profile:', error);
    } finally {
      setIsUpdating(false);
    }
  };
  
  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');
    
    if (!currentPassword) {
      setPasswordError('Current password is required');
      return;
    }
    
    if (newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters');
      return;
    }
    
    if (newPassword !== confirmPassword) {
      setPasswordError('Passwords do not match');
      return;
    }
    
    try {
      setIsChangingPassword(true);
      await updateProfile(user?.name || '', user?.email || '', currentPassword, newPassword);
      
      // Reset form
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      
      toast({
        title: "Password Changed",
        description: "Your password has been updated successfully"
      });
    } catch (error: any) {
      setPasswordError(error.message || 'Failed to change password');
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleSavePlatformSettings = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Platform Settings",
      description: "Settings saved successfully"
    });
  };

  const handleSaveSmtpSettings = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "SMTP Settings",
      description: "SMTP configuration updated successfully"
    });
  };

  const handleBackupDatabase = () => {
    toast({
      title: "Database Backup",
      description: "Backup started. You will be notified when complete."
    });
    
    setTimeout(() => {
      toast({
        title: "Backup Complete",
        description: "Database backup completed successfully."
      });
    }, 2000);
  };

  const handleExportData = () => {
    toast({
      title: "Data Export",
      description: "Exporting data... You will be notified when complete."
    });
    
    setTimeout(() => {
      toast({
        title: "Export Complete",
        description: "Data exported successfully."
      });
    }, 2000);
  };

  return (
    <Layout>
      <div className="container max-w-5xl py-6">
        <h1 className="text-3xl font-bold mb-6">Admin Settings</h1>
        
        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-8">
            <TabsTrigger value="profile" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Admin Profile
            </TabsTrigger>
            <TabsTrigger value="security" className="flex items-center gap-2">
              <Key className="h-4 w-4" />
              Security
            </TabsTrigger>
            <TabsTrigger value="platform" className="flex items-center gap-2">
              <Server className="h-4 w-4" />
              Platform Controls
            </TabsTrigger>
            <TabsTrigger value="logs" className="flex items-center gap-2">
              <FileCheck className="h-4 w-4" />
              Audit & Logs
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="profile">
            <Card>
              <CardHeader>
                <CardTitle>Admin Profile</CardTitle>
                <CardDescription>
                  Update your administrator profile information and preferences.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleProfileUpdate}>
                  <div className="grid gap-6">
                    <div className="mx-auto mb-4">
                      <div className="relative w-24 h-24 mx-auto mb-2">
                        <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden">
                          {user?.name ? (
                            <span className="text-3xl font-bold text-gray-500">
                              {user.name.charAt(0).toUpperCase()}
                            </span>
                          ) : (
                            <UserCircle className="w-12 h-12 text-gray-400" />
                          )}
                        </div>
                        <Button size="sm" variant="secondary" className="absolute -bottom-2 -right-2 rounded-full w-8 h-8 p-1">
                          <span className="sr-only">Upload profile image</span>
                          <UserCircle className="h-4 w-4" />
                        </Button>
                      </div>
                      <p className="text-center text-sm text-gray-500">Click to upload profile picture</p>
                    </div>
                    
                    <div className="grid gap-3">
                      <Label htmlFor="name">Full Name</Label>
                      <Input 
                        id="name" 
                        value={name} 
                        onChange={(e) => setName(e.target.value)} 
                        placeholder="Your full name"
                      />
                    </div>
                    
                    <div className="grid gap-3">
                      <Label htmlFor="email">Email Address</Label>
                      <Input 
                        id="email" 
                        type="email" 
                        value={email} 
                        onChange={(e) => setEmail(e.target.value)} 
                        placeholder="Your email address"
                      />
                    </div>
                    
                    <Separator className="my-2" />
                    
                    <div className="grid gap-3">
                      <Label htmlFor="language">Admin Role</Label>
                      <div className="flex items-center gap-2">
                        <Badge className="bg-purple-600">Admin</Badge>
                        <span className="text-sm text-gray-500">Full administrative privileges</span>
                      </div>
                    </div>
                    
                    <div className="grid gap-3">
                      <Label htmlFor="language">Interface Language</Label>
                      <Select defaultValue="en">
                        <SelectTrigger>
                          <SelectValue placeholder="Select language" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="en">English</SelectItem>
                          <SelectItem value="ar">Arabic</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="grid gap-3">
                      <Label htmlFor="timezone">Time Zone</Label>
                      <Select defaultValue="utc">
                        <SelectTrigger>
                          <SelectValue placeholder="Select time zone" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="utc">UTC (Universal)</SelectItem>
                          <SelectItem value="gmt">GMT (London)</SelectItem>
                          <SelectItem value="est">EST (New York)</SelectItem>
                          <SelectItem value="pst">PST (Los Angeles)</SelectItem>
                          <SelectItem value="ast">AST (Riyadh, Dubai)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="flex justify-end">
                      <Button 
                        type="submit" 
                        disabled={isUpdating}
                        className="flex items-center gap-2"
                      >
                        {isUpdating ? "Updating..." : (
                          <>
                            <Save className="h-4 w-4" />
                            Save Changes
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="security">
            <div className="grid gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Change Admin Password</CardTitle>
                  <CardDescription>
                    Update your password to maintain account security.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handlePasswordChange}>
                    {passwordError && (
                      <div className="bg-red-50 text-red-700 p-3 rounded-md mb-4">
                        {passwordError}
                      </div>
                    )}
                    
                    <div className="grid gap-6">
                      <div className="grid gap-3">
                        <Label htmlFor="currentPassword">Current Password</Label>
                        <Input 
                          id="currentPassword" 
                          type="password" 
                          value={currentPassword}
                          onChange={(e) => setCurrentPassword(e.target.value)}
                          placeholder="Enter your current password"
                        />
                      </div>
                      
                      <Separator />
                      
                      <div className="grid gap-3">
                        <Label htmlFor="newPassword">New Password</Label>
                        <Input 
                          id="newPassword" 
                          type="password" 
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          placeholder="Enter your new password"
                        />
                      </div>
                      
                      <div className="grid gap-3">
                        <Label htmlFor="confirmPassword">Confirm New Password</Label>
                        <Input 
                          id="confirmPassword" 
                          type="password" 
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          placeholder="Confirm your new password"
                        />
                      </div>
                      
                      <div className="flex justify-end">
                        <Button 
                          type="submit" 
                          disabled={isChangingPassword}
                          className="flex items-center gap-2"
                        >
                          {isChangingPassword ? "Updating..." : (
                            <>
                              <Lock className="h-4 w-4" />
                              Change Password
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  </form>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Session Management</CardTitle>
                  <CardDescription>
                    Manage your active sessions and devices.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="border rounded-lg overflow-hidden">
                    <div className="p-3 bg-gray-50 border-b">
                      <h3 className="font-medium">Active Sessions</h3>
                    </div>
                    
                    <div className="divide-y">
                      <div className="p-3 flex justify-between items-center">
                        <div>
                          <div className="font-medium">Current Session</div>
                          <div className="text-sm text-gray-500">Chrome on Windows • IP: 192.168.1.1</div>
                          <div className="text-xs text-gray-400 mt-1">Last active: Just now</div>
                        </div>
                        <Badge>Current</Badge>
                      </div>
                      
                      <div className="p-3 flex justify-between items-center">
                        <div>
                          <div className="font-medium">Safari on iPhone</div>
                          <div className="text-sm text-gray-500">iOS 16 • IP: 192.168.1.2</div>
                          <div className="text-xs text-gray-400 mt-1">Last active: 2 hours ago</div>
                        </div>
                        <Button size="sm" variant="outline">Revoke</Button>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex justify-end">
                    <Button variant="outline" className="flex items-center gap-2">
                      <LogOut className="h-4 w-4" />
                      Logout All Devices
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="platform">
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>System Settings</CardTitle>
                  <CardDescription>
                    Configure global platform settings and user access.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSavePlatformSettings}>
                    <div className="space-y-6">
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label htmlFor="maintenance-mode">Maintenance Mode</Label>
                          <p className="text-sm text-gray-500">
                            Temporarily disable access to the platform
                          </p>
                        </div>
                        <Switch
                          id="maintenance-mode"
                          checked={maintenanceMode}
                          onCheckedChange={setMaintenanceMode}
                        />
                      </div>
                      
                      {maintenanceMode && (
                        <div className="rounded-md bg-yellow-50 border border-yellow-200 p-3">
                          <div className="flex items-start gap-3">
                            <AlertTriangle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                            <div>
                              <h3 className="font-medium text-yellow-800">Maintenance Mode Active</h3>
                              <p className="text-sm text-yellow-700 mt-1">
                                When enabled, regular users will not be able to access the platform.
                                Only administrators will have access.
                              </p>
                            </div>
                          </div>
                        </div>
                      )}
                      
                      {maintenanceMode && (
                        <div className="space-y-2">
                          <Label htmlFor="maintenance-message">Maintenance Message</Label>
                          <Textarea
                            id="maintenance-message"
                            placeholder="Enter the message users will see during maintenance"
                            value={maintenanceMessage}
                            onChange={(e) => setMaintenanceMessage(e.target.value)}
                            rows={3}
                          />
                        </div>
                      )}
                      
                      <Separator />
                      
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label htmlFor="user-registration">User Registration</Label>
                          <p className="text-sm text-gray-500">
                            Allow new users to register
                          </p>
                        </div>
                        <Switch
                          id="user-registration"
                          checked={registrationEnabled}
                          onCheckedChange={setRegistrationEnabled}
                        />
                      </div>
                      
                      <div className="pt-4 flex justify-end">
                        <Button type="submit" className="flex items-center gap-2">
                          <Save className="h-4 w-4" />
                          Save Settings
                        </Button>
                      </div>
                    </div>
                  </form>
                </CardContent>
              </Card>
              
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>SMTP Configuration</CardTitle>
                    <CardDescription>
                      Configure email server settings for system notifications.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleSaveSmtpSettings}>
                      <div className="space-y-4">
                        <div className="grid gap-2">
                          <Label htmlFor="smtp-host">SMTP Host</Label>
                          <Input
                            id="smtp-host"
                            placeholder="e.g., smtp.gmail.com"
                            value={smtpHost}
                            onChange={(e) => setSmtpHost(e.target.value)}
                          />
                        </div>
                        
                        <div className="grid gap-2">
                          <Label htmlFor="smtp-port">SMTP Port</Label>
                          <Input
                            id="smtp-port"
                            placeholder="e.g., 587"
                            value={smtpPort}
                            onChange={(e) => setSmtpPort(e.target.value)}
                          />
                        </div>
                        
                        <div className="grid gap-2">
                          <Label htmlFor="smtp-user">SMTP Username</Label>
                          <Input
                            id="smtp-user"
                            placeholder="e.g., your@email.com"
                            value={smtpUser}
                            onChange={(e) => setSmtpUser(e.target.value)}
                          />
                        </div>
                        
                        <div className="grid gap-2">
                          <Label htmlFor="smtp-pass">SMTP Password</Label>
                          <Input
                            id="smtp-pass"
                            type="password"
                            placeholder="Your SMTP password"
                            value={smtpPass}
                            onChange={(e) => setSmtpPass(e.target.value)}
                          />
                        </div>
                        
                        <div className="pt-2 flex justify-end">
                          <Button type="submit" className="flex items-center gap-2">
                            <Mail className="h-4 w-4" />
                            Save SMTP Settings
                          </Button>
                        </div>
                      </div>
                    </form>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Database Management</CardTitle>
                    <CardDescription>
                      Manage database backups and exports.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <Database className="h-5 w-5 text-blue-500" />
                        <div>
                          <h3 className="font-medium">Backup Database</h3>
                          <p className="text-sm text-gray-500">Create a full backup of all system data</p>
                        </div>
                      </div>
                      <Button variant="outline" onClick={handleBackupDatabase}>
                        Start Backup
                      </Button>
                    </div>
                    
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <FileDown className="h-5 w-5 text-green-500" />
                        <div>
                          <h3 className="font-medium">Export Data</h3>
                          <p className="text-sm text-gray-500">Export user or trade data as CSV</p>
                        </div>
                      </div>
                      <Button variant="outline" onClick={handleExportData}>
                        Export
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="logs">
            <Card>
              <CardHeader>
                <CardTitle>System Logs</CardTitle>
                <CardDescription>
                  Review recent system activities and events.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border overflow-hidden">
                  <div className="flex items-center p-3 bg-gray-50 border-b gap-2">
                    <Select defaultValue="all">
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Log type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Logs</SelectItem>
                        <SelectItem value="login">Login Attempts</SelectItem>
                        <SelectItem value="admin">Admin Actions</SelectItem>
                        <SelectItem value="error">System Errors</SelectItem>
                      </SelectContent>
                    </Select>
                    
                    <Input
                      placeholder="Search logs..."
                      className="max-w-xs"
                    />
                    
                    <div className="ml-auto flex items-center gap-2">
                      <span className="text-sm text-gray-500">Showing last 24 hours</span>
                      <Button variant="outline" size="sm">
                        <FileDown className="h-4 w-4" />
                        <span className="sr-only md:not-sr-only md:ml-2">Export Logs</span>
                      </Button>
                    </div>
                  </div>
                  
                  <div className="divide-y">
                    <div className="p-3 flex gap-3 hover:bg-gray-50">
                      <div className="w-10 flex-shrink-0 flex items-start">
                        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                          <CheckCircle2 className="h-3 w-3" />
                        </Badge>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <p className="font-medium">User Login Successful</p>
                          <span className="text-xs text-gray-500">2 minutes ago</span>
                        </div>
                        <p className="text-sm text-gray-600">Admin user logged in from 192.168.1.1</p>
                      </div>
                    </div>
                    
                    <div className="p-3 flex gap-3 hover:bg-gray-50">
                      <div className="w-10 flex-shrink-0 flex items-start">
                        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                          <Settings className="h-3 w-3" />
                        </Badge>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <p className="font-medium">System Settings Updated</p>
                          <span className="text-xs text-gray-500">1 hour ago</span>
                        </div>
                        <p className="text-sm text-gray-600">Admin updated SMTP configuration</p>
                      </div>
                    </div>
                    
                    <div className="p-3 flex gap-3 hover:bg-gray-50">
                      <div className="w-10 flex-shrink-0 flex items-start">
                        <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                          <AlarmClock className="h-3 w-3" />
                        </Badge>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <p className="font-medium">Database Backup Scheduled</p>
                          <span className="text-xs text-gray-500">5 hours ago</span>
                        </div>
                        <p className="text-sm text-gray-600">Automatic backup scheduled for midnight</p>
                      </div>
                    </div>
                    
                    <div className="p-3 flex gap-3 hover:bg-gray-50">
                      <div className="w-10 flex-shrink-0 flex items-start">
                        <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                          <AlertTriangle className="h-3 w-3" />
                        </Badge>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <p className="font-medium">Failed Login Attempt</p>
                          <span className="text-xs text-gray-500">1 day ago</span>
                        </div>
                        <p className="text-sm text-gray-600">Failed login from IP 203.0.113.1 (3 attempts)</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="mt-4 flex justify-center">
                  <Button variant="outline">Load More Logs</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default AdminProfileSettings;
