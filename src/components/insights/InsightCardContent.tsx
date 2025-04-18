
import React from 'react';
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { TradingInsight } from '@/services/aiService';
import { 
  Brain, 
  AlertTriangle, 
  BarChart3, 
  Gauge, 
  Target,
  Lightbulb 
} from 'lucide-react';

interface InsightCardContentProps {
  insight?: TradingInsight;
  loading: boolean;
  tradesCount?: number;
}

export const InsightCardContent: React.FC<InsightCardContentProps> = ({
  insight,
  loading,
  tradesCount = 0
}) => {
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'performance':
        return <BarChart3 className="h-4 w-4" />;
      case 'risk':
        return <AlertTriangle className="h-4 w-4" />;
      case 'psychology':
        return <Brain className="h-4 w-4" />;
      case 'strategy':
        return <Target className="h-4 w-4" />;
      case 'pattern':
        return <Gauge className="h-4 w-4" />;
      default:
        return <Lightbulb className="h-4 w-4" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'performance':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300';
      case 'risk':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300';
      case 'psychology':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'strategy':
        return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-300';
      case 'pattern':
        return 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300';
      case 'error':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      case 'data':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
    }
  };

  const getImportanceColor = (importance: string) => {
    switch (importance) {
      case 'high':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      case 'low':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      default:
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
    }
  };

  const translateCategory = (category: string) => {
    switch (category) {
      case 'performance':
        return 'Performance';
      case 'risk':
        return 'Risk';
      case 'psychology':
        return 'Psychology';
      case 'strategy':
        return 'Strategy';
      case 'pattern':
        return 'Pattern';
      case 'data':
        return 'Data';
      case 'error':
        return 'Error';
      default:
        return category;
    }
  };

  const translateImportance = (importance: string) => {
    switch (importance) {
      case 'high':
        return 'High';
      case 'medium':
        return 'Medium';
      case 'low':
        return 'Low';
      default:
        return importance;
    }
  };

  if (loading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
      </div>
    );
  }

  if (!insight) {
    return (
      <div className="text-center py-4">
        <p className="text-muted-foreground">
          {tradesCount < 5 
            ? 'Add more trades to get personalized insights'
            : 'Click refresh to get smart trading insights'}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <Badge className={getCategoryColor(insight.category)}>
          {getCategoryIcon(insight.category)}
          <span className="mr-1">{translateCategory(insight.category)}</span>
        </Badge>
        <Badge className={getImportanceColor(insight.importance)}>
          {translateImportance(insight.importance)}
        </Badge>
      </div>
      
      <h3 className="text-xl font-medium">{insight.title}</h3>
      <div className="text-muted-foreground whitespace-pre-line">
        {insight.content}
      </div>
    </div>
  );
};
