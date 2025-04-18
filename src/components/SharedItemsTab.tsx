
import React, { useEffect, useState } from 'react';
import { useSharing, ShareItemType } from '@/hooks/useSharing';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Eye, Edit, FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';

interface SharedItemsTabProps {
  itemType: ShareItemType;
}

const SharedItemsTab: React.FC<SharedItemsTabProps> = ({ itemType }) => {
  const [sharedItems, setSharedItems] = useState<any[]>([]);
  const { getSharedWithMe } = useSharing();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSharedItems = async () => {
      const items = await getSharedWithMe(itemType);
      setSharedItems(items);
    };

    fetchSharedItems();
  }, [itemType]);

  const getPermissionIcon = (permission: string) => {
    switch (permission) {
      case 'edit':
        return <Edit className="h-4 w-4 text-blue-500" />;
      case 'note':
        return <FileText className="h-4 w-4 text-yellow-500" />;
      default:
        return <Eye className="h-4 w-4 text-gray-500" />;
    }
  };

  const handleItemClick = (itemId: string) => {
    navigate(`/${itemType}/${itemId}`);
  };

  if (sharedItems.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        لا يوجد عناصر مشتركة معك حالياً
      </div>
    );
  }

  return (
    <div className="grid gap-4">
      {sharedItems.map((item) => (
        <Card 
          key={item.id} 
          className="cursor-pointer hover:bg-muted/50 transition-colors"
          onClick={() => handleItemClick(item.item_id)}
        >
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center justify-between">
              <span>{item.shared_by_user.name}</span>
              {getPermissionIcon(item.permission)}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              تمت المشاركة {format(new Date(item.created_at), 'dd/MM/yyyy')}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default SharedItemsTab;
