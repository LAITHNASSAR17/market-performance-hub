
import React, { useState } from 'react';
import { useAccount, TradingAccount } from '@/contexts/AccountContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Briefcase, Edit, Trash2, Plus } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';

const AccountsManager: React.FC = () => {
  const { accounts: allAccounts, getUserAccounts, addAccount, updateAccount, deleteAccount } = useAccount();
  const [editingAccount, setEditingAccount] = useState<TradingAccount | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  // Form state
  const [name, setName] = useState('');
  const [balance, setBalance] = useState('');
  const [currency, setCurrency] = useState('USD');
  const [broker, setBroker] = useState('');
  const [type, setType] = useState<'Demo' | 'Live' | 'Other'>('Demo');
  const [description, setDescription] = useState('');
  const [tradingPairs, setTradingPairs] = useState('');
  const [leverage, setLeverage] = useState('');
  
  const userAccounts = getUserAccounts();
  
  const resetForm = () => {
    setName('');
    setBalance('');
    setCurrency('USD');
    setBroker('');
    setType('Demo');
    setDescription('');
    setTradingPairs('');
    setLeverage('');
    setEditingAccount(null);
  };
  
  const handleOpenDialog = (account?: TradingAccount) => {
    resetForm();
    
    if (account) {
      setEditingAccount(account);
      setName(account.name);
      setBalance(account.balance.toString());
      setCurrency(account.currency);
      setBroker(account.broker);
      setType(account.type);
      setDescription(account.description || '');
      setTradingPairs(account.tradingPairs?.join(', ') || '');
      setLeverage(account.leverage?.toString() || '');
    }
    
    setIsDialogOpen(true);
  };
  
  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    resetForm();
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const accountData = {
      name,
      balance: parseFloat(balance),
      initialBalance: editingAccount ? editingAccount.initialBalance : parseFloat(balance),
      currency,
      broker,
      type,
      description,
      isActive: true,
      tradingPairs: tradingPairs.split(',').map(pair => pair.trim()).filter(pair => pair),
      leverage: leverage ? parseFloat(leverage) : undefined,
    };
    
    if (editingAccount) {
      updateAccount(editingAccount.id, accountData);
    } else {
      addAccount(accountData);
    }
    
    handleCloseDialog();
  };
  
  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Trading Accounts</h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => handleOpenDialog()} className="flex items-center">
              <Plus className="h-4 w-4 mr-2" />
              Add Account
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>{editingAccount ? 'Edit Account' : 'Add New Trading Account'}</DialogTitle>
              <DialogDescription>
                {editingAccount 
                  ? 'Update your trading account details below.' 
                  : 'Enter the details of your new trading account.'}
              </DialogDescription>
            </DialogHeader>
            
            <form onSubmit={handleSubmit}>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Account Name</Label>
                    <Input 
                      id="name" 
                      value={name} 
                      onChange={(e) => setName(e.target.value)}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="type">Account Type</Label>
                    <Select 
                      value={type} 
                      onValueChange={(value: 'Demo' | 'Live' | 'Other') => setType(value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Demo">Demo</SelectItem>
                        <SelectItem value="Live">Live</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="balance">Balance</Label>
                    <Input 
                      id="balance" 
                      type="number"
                      value={balance} 
                      onChange={(e) => setBalance(e.target.value)}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="currency">Currency</Label>
                    <Select value={currency} onValueChange={setCurrency}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select currency" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="USD">USD</SelectItem>
                        <SelectItem value="EUR">EUR</SelectItem>
                        <SelectItem value="GBP">GBP</SelectItem>
                        <SelectItem value="JPY">JPY</SelectItem>
                        <SelectItem value="BTC">BTC</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="broker">Broker</Label>
                    <Input 
                      id="broker" 
                      value={broker} 
                      onChange={(e) => setBroker(e.target.value)}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="leverage">Leverage (optional)</Label>
                    <Input 
                      id="leverage" 
                      type="number"
                      value={leverage} 
                      onChange={(e) => setLeverage(e.target.value)}
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="tradingPairs">Trading Pairs (comma separated)</Label>
                  <Input 
                    id="tradingPairs" 
                    value={tradingPairs} 
                    onChange={(e) => setTradingPairs(e.target.value)}
                    placeholder="EUR/USD, GBP/USD, BTC/USD"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="description">Description (optional)</Label>
                  <Textarea 
                    id="description" 
                    value={description} 
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Enter details about this account"
                    rows={3}
                  />
                </div>
              </div>
              
              <DialogFooter>
                <Button type="button" variant="outline" onClick={handleCloseDialog}>Cancel</Button>
                <Button type="submit">{editingAccount ? 'Save Changes' : 'Add Account'}</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {userAccounts.length > 0 ? (
          userAccounts.map((account) => (
            <Card key={account.id} className="bg-white">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="flex items-center">
                      <Briefcase className="h-4 w-4 mr-2 text-gray-500" />
                      {account.name}
                    </CardTitle>
                    <CardDescription>{account.broker} – {account.type}</CardDescription>
                  </div>
                  <div className="flex space-x-1">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => handleOpenDialog(account)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Account</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete this trading account? This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction 
                            onClick={() => deleteAccount(account.id)}
                            className="bg-red-500 hover:bg-red-600"
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <p className="text-gray-500">Balance</p>
                    <p className="font-medium">{account.currency} {account.balance.toLocaleString()}</p>
                  </div>
                  
                  <div>
                    <p className="text-gray-500">Initial</p>
                    <p className="font-medium">{account.currency} {account.initialBalance.toLocaleString()}</p>
                  </div>
                  
                  {account.leverage && (
                    <div>
                      <p className="text-gray-500">Leverage</p>
                      <p className="font-medium">{account.leverage}:1</p>
                    </div>
                  )}
                  
                  {account.tradingPairs && account.tradingPairs.length > 0 && (
                    <div className="col-span-2 mt-1">
                      <p className="text-gray-500">Trading Pairs</p>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {account.tradingPairs.map((pair) => (
                          <span 
                            key={pair} 
                            className="px-2 py-0.5 bg-gray-100 rounded-full text-xs"
                          >
                            {pair}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {account.description && (
                    <div className="col-span-2 mt-1">
                      <p className="text-gray-500">Description</p>
                      <p className="text-xs mt-0.5">{account.description}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="col-span-full py-10 text-center bg-gray-50 rounded-lg">
            <Briefcase className="h-10 w-10 mx-auto text-gray-300 mb-2" />
            <h3 className="text-lg font-medium mb-1">No Trading Accounts</h3>
            <p className="text-gray-500 mb-4">Add your first trading account to get started</p>
            <Button onClick={() => handleOpenDialog()}>
              <Plus className="h-4 w-4 mr-2" />
              Add Account
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AccountsManager;
