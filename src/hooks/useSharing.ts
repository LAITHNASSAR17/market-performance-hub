
import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/components/ui/use-toast';

export type SharePermission = 'view' | 'note' | 'edit';
export type ShareItemType = 'trade' | 'playbook';

interface ShareItemParams {
  itemId: string;
  itemType: ShareItemType;
  email: string;
  permission: SharePermission;
}

export const useSharing = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const shareItem = async ({ itemId, itemType, email, permission }: ShareItemParams) => {
    try {
      setIsLoading(true);

      // First, find the user by email
      const { data: users, error: userError } = await supabase
        .from('users')
        .select('id')
        .eq('email', email)
        .single();

      if (userError || !users) {
        toast({
          title: "خطأ",
          description: "لم يتم العثور على المستخدم",
          variant: "destructive"
        });
        return false;
      }

      // Create share record
      const { error: shareError } = await supabase
        .from('shared_items')
        .insert({
          item_type: itemType,
          item_id: itemId,
          shared_with: users.id,
          shared_by: (await supabase.auth.getUser()).data.user?.id,
          permission
        });

      if (shareError) {
        toast({
          title: "خطأ",
          description: "فشل في مشاركة العنصر",
          variant: "destructive"
        });
        return false;
      }

      toast({
        title: "تمت المشاركة",
        description: "تمت مشاركة العنصر بنجاح"
      });
      return true;
    } catch (error) {
      console.error('Error sharing item:', error);
      toast({
        title: "خطأ",
        description: "حدث خطأ غير متوقع",
        variant: "destructive"
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const getSharedWithMe = async (itemType: ShareItemType) => {
    const { data, error } = await supabase
      .from('shared_items')
      .select(`
        *,
        shared_by_user:users!shared_items_shared_by_fkey(name, email)
      `)
      .eq('item_type', itemType)
      .eq('shared_with', (await supabase.auth.getUser()).data.user?.id);

    if (error) {
      console.error('Error fetching shared items:', error);
      return [];
    }

    return data;
  };

  return {
    shareItem,
    getSharedWithMe,
    isLoading
  };
};
