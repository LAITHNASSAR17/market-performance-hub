
import React, { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import TradeTable from '@/components/admin/TradeTable';
import AdminLayout from '@/components/layouts/AdminLayout';
import { AdminController } from '@/controllers/AdminController';

const AdminTrades: React.FC = () => {
  const [trades, setTrades] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const { toast } = useToast();
  
  const adminController = new AdminController();

  // Load trades on component mount
  useEffect(() => {
    loadTrades();
  }, []);

  const loadTrades = async () => {
    setLoading(true);
    try {
      const allTrades = await adminController.getAllTrades();
      setTrades(allTrades);
    } catch (error) {
      console.error("Error loading trades:", error);
      toast({
        title: "Error",
        description: "Failed to load trades",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleViewTrade = (id: string) => {
    toast({
      title: "View Trade",
      description: `Viewing trade ${id}`
    });
    // Navigate to trade detail page or open modal
  };

  const handleEditTrade = (id: string) => {
    toast({
      title: "Edit Trade",
      description: `Editing trade ${id}`
    });
    // Navigate to trade edit page
  };

  const handleDeleteTrade = async (id: string) => {
    try {
      await adminController.deleteTrade(parseInt(id));
      loadTrades(); // Refresh trade list
      toast({
        title: "Trade Deleted",
        description: `Trade ${id} has been deleted`
      });
    } catch (error) {
      console.error("Error deleting trade:", error);
      toast({
        title: "Error",
        description: "Failed to delete trade",
        variant: "destructive"
      });
    }
  };

  const handleRefreshTrades = () => {
    loadTrades();
    toast({
      title: "Trades Refreshed",
      description: "Trade list has been updated"
    });
  };

  const handleExportTrades = () => {
    // In a real app, this would generate a CSV or Excel file
    const headers = "ID,User,Date,Pair,Type,Entry,Exit,Profit/Loss\n";
    const csv = headers + trades.map(trade => 
      `${trade.id},${trade.userId},${trade.date},${trade.pair},${trade.type},${trade.entry},${trade.exit},${trade.profitLoss}`
    ).join("\n");
    
    // Create download link
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('hidden', '');
    a.setAttribute('href', url);
    a.setAttribute('download', 'trades.csv');
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    
    toast({
      title: "Export Complete",
      description: "Trades exported to CSV"
    });
  };

  return (
    <AdminLayout>
      <header className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
          Trade Management
        </h1>
        <p className="mt-1 text-sm md:text-base text-gray-500 dark:text-gray-400">
          View and manage all trades across the platform.
        </p>
      </header>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
        {loading ? (
          <div className="p-8 text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
            <p className="mt-2 text-gray-500 dark:text-gray-400">Loading trades...</p>
          </div>
        ) : (
          <TradeTable 
            trades={trades}
            onViewTrade={handleViewTrade}
            onEditTrade={handleEditTrade}
            onDeleteTrade={handleDeleteTrade}
            onRefresh={handleRefreshTrades}
            onExport={handleExportTrades}
          />
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminTrades;
