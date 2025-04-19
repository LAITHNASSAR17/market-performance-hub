import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { format } from 'date-fns';
import { CalendarDays, User2, CreditCard, Users } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface User {
  id: string;
  name: string;
  email: string;
  avatar_url: string;
  created_at: string;
  subscription_tier: string;
}

interface SubscriptionStats {
  free: number;
  basic: number;
  premium: number;
}

const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [recentUsers, setRecentUsers] = useState<User[]>([]);
  const [subscriptionStats, setSubscriptionStats] = useState<SubscriptionStats>({
    free: 0,
    basic: 0,
    premium: 0,
  });
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    if (!user?.isAdmin) {
      navigate('/profile');
    }
  }, [user, navigate]);
  
  const getRecentUsers = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('profiles')  // Use 'profiles' instead of 'users'
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5);
        
      if (error) throw error;
      
      setRecentUsers(data || []);
    } catch (error) {
      console.error('Error fetching recent users:', error);
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء جلب المستخدمين الجدد",
        variant: "destructive"
      });
    }
  };
  
  const getSubscriptionStats = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('subscription_tier');
        
      if (error) throw error;
      
      const stats: SubscriptionStats = { free: 0, basic: 0, premium: 0 };
      data?.forEach(profile => {
        switch (profile.subscription_tier) {
          case 'free':
            stats.free++;
            break;
          case 'basic':
            stats.basic++;
            break;
          case 'premium':
            stats.premium++;
            break;
        }
      });
      
      setSubscriptionStats(stats);
    } catch (error) {
      console.error('Error fetching subscription stats:', error);
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء جلب إحصائيات الاشتراكات",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const getTotalRevenue = async () => {
    if (!user) return;
    
    try {
      // This is a placeholder - replace with your actual revenue calculation logic
      const revenue = (subscriptionStats.basic * 10) + (subscriptionStats.premium * 20);
      setTotalRevenue(revenue);
    } catch (error) {
      console.error('Error calculating total revenue:', error);
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء حس��ب إجمالي الإيرادات",
        variant: "destructive"
      });
    }
  };
  
  useEffect(() => {
    getRecentUsers();
    getSubscriptionStats();
    getTotalRevenue();
  }, [user]);
  
  const chartData = [
    { name: 'Free', users: subscriptionStats.free },
    { name: 'Basic', users: subscriptionStats.basic },
    { name: 'Premium', users: subscriptionStats.premium },
  ];
  
  return (
    <div className="container py-10">
      <header className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Admin Dashboard
        </h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Monitor platform statistics and manage users.
        </p>
      </header>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold flex items-center"><Users className="mr-2 h-4 w-4" /> Total Users</CardTitle>
            <CardDescription>Total number of registered users</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{subscriptionStats.free + subscriptionStats.basic + subscriptionStats.premium}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold flex items-center"><CreditCard className="mr-2 h-4 w-4" /> Total Revenue</CardTitle>
            <CardDescription>Estimated revenue from subscriptions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">${totalRevenue}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold flex items-center"><CalendarDays className="mr-2 h-4 w-4" /> Users by Tier</CardTitle>
            <CardDescription>Distribution of users across subscription tiers</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Area type="monotone" dataKey="users" stroke="#8884d8" fill="#8884d8" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
      
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
        <header className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center">
            <User2 className="mr-2 h-5 w-5" /> Recent Users
          </h2>
          <Button variant="outline" size="sm" onClick={() => navigate('/admin/users')}>
            View All
          </Button>
        </header>
        
        <Table>
          <TableCaption>A list of your recent users.</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px]">Avatar</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Subscription</TableHead>
              <TableHead>Joined</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {recentUsers.map((user) => (
              <TableRow key={user.id}>
                <TableCell>
                  <Avatar>
                    <AvatarImage src={user.avatar_url} />
                    <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                </TableCell>
                <TableCell className="font-medium">{user.name}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>
                  <Badge variant="secondary">{user.subscription_tier}</Badge>
                </TableCell>
                <TableCell>{format(new Date(user.created_at), 'MMM d, yyyy')}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default AdminDashboard;
