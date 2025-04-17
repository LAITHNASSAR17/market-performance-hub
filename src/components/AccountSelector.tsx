
import React from 'react';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Plus, Wallet } from 'lucide-react';
import { useTrade } from '@/contexts/TradeContext';

interface AccountSelectorProps {
  onAddAccount: () => void;
  selectedAccount: string | null;
  onSelectAccount: (accountId: string) => void;
  className?: string;
}

const AccountSelector: React.FC<AccountSelectorProps> = ({ 
  onAddAccount, 
  selectedAccount, 
  onSelectAccount,
  className 
}) => {
  const { tradingAccounts } = useTrade();

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <Select 
        value={selectedAccount || 'default'} 
        onValueChange={onSelectAccount}
      >
        <SelectTrigger className="w-[200px]">
          <div className="flex items-center">
            <Wallet className="h-4 w-4 mr-2" />
            <SelectValue placeholder="اختر حساب التداول" />
          </div>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">جميع الحسابات</SelectItem>
          {tradingAccounts.map(account => (
            <SelectItem key={account.id} value={account.id}>
              {account.name} (${account.balance.toLocaleString()})
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      
      <Button 
        variant="outline" 
        size="icon" 
        onClick={onAddAccount} 
        title="إضافة حساب جديد"
      >
        <Plus className="h-4 w-4" />
      </Button>
    </div>
  );
};

export default AccountSelector;
