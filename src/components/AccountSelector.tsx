
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useTrade } from '@/contexts/TradeContext';
import { Wallet } from 'lucide-react';

const AccountSelector: React.FC = () => {
  const { accounts, selectedAccount, setSelectedAccount } = useTrade();

  return (
    <Card className="shadow-sm">
      <CardContent className="pt-6">
        <div className="flex items-center space-x-4 mb-4 rtl:space-x-reverse">
          <div className="bg-primary/10 p-2 rounded-full">
            <Wallet className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h3 className="font-medium text-lg">حساب التداول</h3>
            <p className="text-muted-foreground text-sm">اختر الحساب لعرض بياناته</p>
          </div>
        </div>
        
        <Select 
          value={selectedAccount} 
          onValueChange={setSelectedAccount}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="اختر حساب التداول" />
          </SelectTrigger>
          <SelectContent>
            {accounts.map(account => (
              <SelectItem key={account} value={account}>
                {account}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </CardContent>
    </Card>
  );
};

export default AccountSelector;
