
import React from 'react';
import { useTrade } from '@/contexts/TradeContext';
import { useToast } from '@/components/ui/use-toast';
import TradeTable from '@/components/admin/TradeTable';

const AdminTrades: React.FC = () => {
  const { trades, deleteTrade, loading, error, refreshTrades } = useTrade();
  const { toast } = useToast();

  const handleViewTrade = (id: string) => {
    toast({
      title: "View Trade",
      description: `Viewing trade ${id}`
    });
  };

  const handleEditTrade = (id: string) => {
    toast({
      title: "Edit Trade",
      description: `Editing trade ${id}`
    });
  };

  const handleDeleteTrade = (id: string) => {
    deleteTrade(id);
    toast({
      title: "Trade Deleted",
      description: `Trade ${id} has been deleted`
    });
  };

  const handleRefreshTrades = () => {
    refreshTrades();
    toast({
      title: "Trades Refreshed",
      description: "Trade list has been updated"
    });
  };

  const handleExportTrades = () => {
    toast({
      title: "Export Started",
      description: "Exporting trades to CSV"
    });
  };

  return (
    <div>
      <header className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
          إدارة التداولات
        </h1>
        <p className="mt-1 text-sm md:text-base text-gray-500 dark:text-gray-400">
          عرض وإدارة جميع التداولات عبر المنصة.
        </p>
      </header>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
        <TradeTable 
          trades={trades || []}
          onViewTrade={handleViewTrade}
          onEditTrade={handleEditTrade}
          onDeleteTrade={handleDeleteTrade}
          onRefresh={handleRefreshTrades}
          onExport={handleExportTrades}
          isLoading={loading}
          error={error}
        />
      </div>
    </div>
  );
};

export default AdminTrades;
