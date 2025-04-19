
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, ButtonProps } from '@/components/ui/button';
import { CreditCard } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface PaymentButtonProps extends ButtonProps {
  text?: string;
  tier?: 'premium' | 'enterprise' | 'pro' | 'elite';
}

const PaymentButton: React.FC<PaymentButtonProps> = ({ 
  text = "الاشتراك الآن", 
  tier = 'premium',
  className,
  ...props 
}) => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleClick = () => {
    // Store selected tier in sessionStorage for access in payment page
    sessionStorage.setItem('selected_subscription_tier', tier);
    navigate('/payment');
  };

  // Don't show if user already has this tier or higher
  if (user?.subscription_tier === tier || 
      (user?.subscription_tier === 'enterprise' && tier !== 'enterprise') ||
      (user?.subscription_tier === 'elite' && tier !== 'elite') ||
      (user?.subscription_tier === 'premium' && tier === 'premium') ||
      (user?.subscription_tier === 'pro' && tier === 'pro')) {
    return null;
  }

  return (
    <Button
      onClick={handleClick}
      className={className}
      {...props}
    >
      <CreditCard className="mr-2 h-4 w-4" />
      {text}
    </Button>
  );
};

export default PaymentButton;
