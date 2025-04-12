
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, ButtonProps } from '@/components/ui/button';
import { CreditCard } from 'lucide-react';

interface PaymentButtonProps extends ButtonProps {
  text?: string;
}

const PaymentButton: React.FC<PaymentButtonProps> = ({ 
  text = "Subscribe Now", 
  className,
  ...props 
}) => {
  const navigate = useNavigate();

  return (
    <Button
      onClick={() => navigate('/subscriptions')}
      className={className}
      {...props}
    >
      <CreditCard className="mr-2 h-4 w-4" />
      {text}
    </Button>
  );
};

export default PaymentButton;
