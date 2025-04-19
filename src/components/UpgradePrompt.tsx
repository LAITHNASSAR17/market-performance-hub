
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { Lock } from 'lucide-react';

interface UpgradePromptProps {
  title: string;
  description: string;
  feature: string;
  className?: string;
}

const UpgradePrompt: React.FC<UpgradePromptProps> = ({
  title,
  description,
  feature,
  className
}) => {
  const navigate = useNavigate();

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center text-lg">
          <Lock className="w-5 h-5 mr-2" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="text-center">
        <p className="text-muted-foreground mb-4">{description}</p>
        <Button onClick={() => navigate('/subscriptions')}>
          Upgrade to Access {feature}
        </Button>
      </CardContent>
    </Card>
  );
};

export default UpgradePrompt;
