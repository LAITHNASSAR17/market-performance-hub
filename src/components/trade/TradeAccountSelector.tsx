
import React from 'react';
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface TradeAccountSelectorProps {
  accounts: string[];
  selectedAccount: string;
  onAccountChange: (value: string) => void;
}

const TradeAccountSelector: React.FC<TradeAccountSelectorProps> = ({
  accounts,
  selectedAccount,
  onAccountChange
}) => {
  return (
    <div>
      <Label htmlFor="account">Account</Label>
      <Select onValueChange={onAccountChange}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Select account" defaultValue={selectedAccount} />
        </SelectTrigger>
        <SelectContent>
          {accounts.map((account) => (
            <SelectItem key={account} value={account}>{account}</SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default TradeAccountSelector;
