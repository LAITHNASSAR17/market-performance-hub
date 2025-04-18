
import React from 'react';
import { Button } from "@/components/ui/button";
import { ChevronRight, ChevronLeft } from 'lucide-react';
import { CardFooter } from "@/components/ui/card";

interface InsightNavigationProps {
  currentInsight: number;
  totalInsights: number;
  onNext: () => void;
  onPrevious: () => void;
}

export const InsightNavigation: React.FC<InsightNavigationProps> = ({
  currentInsight,
  totalInsights,
  onNext,
  onPrevious
}) => {
  if (totalInsights <= 1) return null;

  return (
    <CardFooter className="flex justify-between pt-0">
      <Button variant="ghost" size="sm" onClick={onPrevious}>
        <ChevronLeft className="h-4 w-4" />
      </Button>
      <span className="text-xs text-muted-foreground">
        {currentInsight + 1} / {totalInsights}
      </span>
      <Button variant="ghost" size="sm" onClick={onNext}>
        <ChevronRight className="h-4 w-4" />
      </Button>
    </CardFooter>
  );
};
