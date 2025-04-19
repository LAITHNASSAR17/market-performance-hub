
import { AlertTriangle, BadgeCheck, TrendingDown, TrendingUp, Info } from 'lucide-react';

interface AlertIconProps {
  type: string;
  className?: string;
}

export const AlertIcon: React.FC<AlertIconProps> = ({ type, className = "h-4 w-4" }) => {
  switch (type) {
    case 'mistake': return <AlertTriangle className={`${className} text-amber-500 shrink-0`} />;
    case 'success': return <BadgeCheck className={`${className} text-emerald-500 shrink-0`} />;
    case 'drop': return <TrendingDown className={`${className} text-red-500 shrink-0`} />;
    case 'improvement': return <TrendingUp className={`${className} text-blue-500 shrink-0`} />;
    default: return <Info className={`${className} text-gray-500 shrink-0`} />;
  }
};
