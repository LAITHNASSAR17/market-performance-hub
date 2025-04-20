
import React from 'react';
import { useParams } from 'react-router-dom';
import Layout from '@/components/Layout';
import TradeForm from '@/components/trade/TradeForm';
import AddPairDialog from '@/components/AddPairDialog';
import { useTradeForm } from '@/hooks/useTradeForm';

const AddTrade: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const {
    initialTradeData,
    loading,
    pairs,
    tradingAccounts,
    handleAddSymbol,
    handleSave,
    isAddPairDialogOpen,
    setIsAddPairDialogOpen,
    handlePairAdded
  } = useTradeForm(id);

  return (
    <Layout>
      <div className="container mx-auto py-8">
        <TradeForm
          isEditMode={!!id}
          initialData={initialTradeData}
          pairs={pairs}
          tradingAccounts={tradingAccounts}
          onAddSymbol={handleAddSymbol}
          onSave={handleSave}
          loading={loading}
        />
        <AddPairDialog 
          isOpen={isAddPairDialogOpen} 
          onClose={() => setIsAddPairDialogOpen(false)} 
          onPairAdded={handlePairAdded} 
        />
      </div>
    </Layout>
  );
};

export default AddTrade;
