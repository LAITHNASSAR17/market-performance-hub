
import React, { useState, useEffect } from 'react';
import { Responsive, WidthProvider } from 'react-grid-layout';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';
import { cn } from '@/lib/utils';

const ResponsiveGridLayout = WidthProvider(Responsive);

type DashboardItem = {
  id: string;
  title?: string;
  w: number;
  h: number;
  x: number;
  y: number;
  minW?: number;
  minH?: number;
  maxW?: number;
  maxH?: number;
  component: React.ReactNode;
  actions?: React.ReactNode;
}

interface DraggableDashboardProps {
  items: DashboardItem[];
  onLayoutChange?: (layout: any) => void;
  savedLayout?: any;
  className?: string;
}

const DraggableDashboard: React.FC<DraggableDashboardProps> = ({
  items,
  onLayoutChange,
  savedLayout,
  className
}) => {
  const [mounted, setMounted] = useState(false);
  
  // This prevents SSR layout shift
  useEffect(() => {
    setMounted(true);
  }, []);

  const generateLayout = () => {
    return items.map(item => ({
      i: item.id,
      x: item.x,
      y: item.y,
      w: item.w,
      h: item.h,
      minW: item.minW || 1,
      minH: item.minH || 1,
      maxW: item.maxW,
      maxH: item.maxH,
    }));
  };

  // Merge saved layout with default layout
  const getInitialLayout = () => {
    if (!savedLayout) return generateLayout();
    
    const mergedLayout = [...generateLayout()];
    savedLayout.forEach((saved: any) => {
      const index = mergedLayout.findIndex(item => item.i === saved.i);
      if (index !== -1) {
        mergedLayout[index] = {
          ...mergedLayout[index],
          x: saved.x,
          y: saved.y,
          w: saved.w,
          h: saved.h,
        };
      }
    });
    
    return mergedLayout;
  };

  const handleLayoutChange = (layout: any) => {
    if (onLayoutChange) {
      onLayoutChange(layout);
    }
  };

  if (!mounted) return null;

  return (
    <div className={cn("w-full", className)}>
      <ResponsiveGridLayout
        className="layout"
        layouts={{
          lg: getInitialLayout(),
          md: getInitialLayout(),
          sm: getInitialLayout(),
          xs: getInitialLayout(),
          xxs: getInitialLayout(),
        }}
        breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
        cols={{ lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 }}
        rowHeight={60}
        margin={[16, 16]}
        onLayoutChange={handleLayoutChange}
        isDraggable={true}
        isResizable={true}
        compactType="vertical"
        useCSSTransforms={mounted}
      >
        {items.map(item => (
          <div key={item.id} className="dashboard-item">
            <div className="h-full rounded-xl overflow-hidden bg-white dark:bg-gray-800 shadow-sm border border-gray-100 dark:border-gray-700">
              {item.title && (
                <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-gray-700">
                  <h3 className="font-medium text-gray-700 dark:text-gray-200">{item.title}</h3>
                  {item.actions && (
                    <div className="flex items-center space-x-2">
                      {item.actions}
                    </div>
                  )}
                </div>
              )}
              <div className={cn("h-full", item.title ? "pt-0" : "pt-4")}>
                {item.component}
              </div>
            </div>
          </div>
        ))}
      </ResponsiveGridLayout>
    </div>
  );
};

export default DraggableDashboard;
