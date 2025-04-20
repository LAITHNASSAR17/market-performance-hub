
import React from 'react';
import { Activity } from 'lucide-react';

interface TradeTableProps {
  trades: any[];
  onViewTrade: (id: string) => void;
  onEditTrade: (id: string) => void;
  onDeleteTrade: (id: string) => void;
  onRefresh: () => void;
  onExport: () => void;
}

const TradeTable: React.FC<TradeTableProps> = (props) => {
  return (
    <div>
      <div className="text-center p-8 text-gray-500">
        <Activity className="mx-auto h-12 w-12 text-gray-300 mb-4" />
        <h3 className="text-lg font-medium mb-2">Trade Table Component</h3>
        <p>Please create the TradeTable component to display trade data here.</p>
      </div>
    </div>
  );
};

export default TradeTable;
