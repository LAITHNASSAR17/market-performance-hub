
import React from 'react';
import { useParams } from 'react-router-dom';
import Layout from '@/components/Layout';
import TradeForm from '@/components/trade/TradeForm';
import { useTradeForm } from '@/hooks/useTradeForm';

const AddTrade: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const {
    initialTradeData,
    loading,
    pairs,
    tradingAccounts,
    handleAddSymbol,
    handleSave
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
      </div>
    </Layout>
  );
};

export default AddTrade;
