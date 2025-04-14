
import React, { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useTrade } from '@/contexts/TradeContext';
import { supabase } from '@/lib/supabase';
import HashtagsTable from '@/components/admin/HashtagsTable';
import Layout from '@/components/Layout';

interface Hashtag {
  name: string;
  count: number;
  addedBy: string;
  lastUsed: string;
}

const AdminHashtags: React.FC = () => {
  const { toast } = useToast();
  const { allHashtags } = useTrade();
  const [hashtags, setHashtags] = useState<Hashtag[]>([]);
  const [loading, setLoading] = useState(true);

  // Load hashtags from database
  useEffect(() => {
    const fetchHashtagsData = async () => {
      try {
        setLoading(true);
        // Fetch all trades to extract hashtag usage data
        const { data: tradesData, error } = await supabase
          .from('trades')
          .select('tags, created_at, user_id')
          .order('created_at', { ascending: false });
          
        if (error) throw error;
        
        if (!tradesData || tradesData.length === 0) {
          // If no trades, use default hashtags with empty counts
          const defaultHashtags = allHashtags.map(tag => ({
            name: tag,
            count: 0,
            addedBy: 'System',
            lastUsed: '-'
          }));
          setHashtags(defaultHashtags);
          setLoading(false);
          return;
        }
        
        // Process hashtag usage
        const hashtagMap = new Map<string, { count: number, lastUsed: string, addedByUserId: string }>();
        
        // Collect all tags, their counts, and last used dates
        tradesData.forEach(trade => {
          if (Array.isArray(trade.tags)) {
            trade.tags.forEach(tag => {
              const existing = hashtagMap.get(tag);
              const tradeDate = new Date(trade.created_at);
              
              if (!existing || new Date(existing.lastUsed) < tradeDate) {
                hashtagMap.set(tag, {
                  count: existing ? existing.count + 1 : 1,
                  lastUsed: trade.created_at,
                  addedByUserId: trade.user_id
                });
              } else if (existing) {
                hashtagMap.set(tag, {
                  ...existing,
                  count: existing.count + 1
                });
              }
            });
          }
        });
        
        // Get user details for the added by field
        const userIds = [...new Set(Array.from(hashtagMap.values()).map(h => h.addedByUserId))];
        const { data: usersData, error: usersError } = await supabase
          .from('users')
          .select('id, name')
          .in('id', userIds);
          
        if (usersError) throw usersError;
        
        // Create a map of user ids to names
        const userMap = new Map();
        if (usersData) {
          usersData.forEach(user => {
            userMap.set(user.id, user.name);
          });
        }
        
        // Create final hashtags array
        const hashtagsArray: Hashtag[] = Array.from(hashtagMap).map(([name, data]) => ({
          name,
          count: data.count,
          addedBy: userMap.get(data.addedByUserId) || 'Unknown',
          lastUsed: new Date(data.lastUsed).toISOString().split('T')[0]
        }));
        
        // Sort by count (descending)
        hashtagsArray.sort((a, b) => b.count - a.count);
        
        setHashtags(hashtagsArray);
      } catch (error) {
        console.error('Error fetching hashtags data:', error);
        toast({
          title: "Error Loading Hashtags",
          description: "Failed to load hashtags data. Please try again later.",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchHashtagsData();
  }, [allHashtags, toast]);

  const handleAddHashtag = async (name: string) => {
    try {
      // Check if we need to update an existing trade to add this tag
      // This ensures the tag is actually present in the database
      const { data: trades, error: tradesError } = await supabase
        .from('trades')
        .select('id, tags')
        .limit(1);
        
      if (tradesError) throw tradesError;
      
      if (trades && trades.length > 0) {
        const trade = trades[0];
        const updatedTags = [...(trade.tags || [])];
        
        if (!updatedTags.includes(name)) {
          updatedTags.push(name);
          
          // Update the trade with the new tag
          const { error: updateError } = await supabase
            .from('trades')
            .update({ tags: updatedTags })
            .eq('id', trade.id);
            
          if (updateError) throw updateError;
        }
      }
      
      // Update local state
      const newHashtag = {
        name,
        count: 0,
        addedBy: 'Admin',
        lastUsed: new Date().toISOString().split('T')[0]
      };
      
      setHashtags([...hashtags, newHashtag]);
      
      toast({
        title: "Hashtag Added",
        description: `#${name} has been added to the system`
      });
    } catch (error) {
      console.error('Error adding hashtag:', error);
      toast({
        title: "Error Adding Hashtag",
        description: "Failed to add the hashtag. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleEditHashtag = async (oldName: string, newName: string) => {
    try {
      // Update all trades that use this hashtag
      const { data: trades, error: fetchError } = await supabase
        .from('trades')
        .select('id, tags')
        .contains('tags', [oldName]);
        
      if (fetchError) throw fetchError;
      
      // Update each trade with the new tag name
      const updatePromises = trades?.map(trade => {
        const updatedTags = (trade.tags || []).map(tag => 
          tag === oldName ? newName : tag
        );
        
        return supabase
          .from('trades')
          .update({ tags: updatedTags })
          .eq('id', trade.id);
      });
      
      if (updatePromises?.length) {
        await Promise.all(updatePromises);
      }
      
      // Update local state
      const updatedHashtags = hashtags.map(tag => 
        tag.name === oldName ? { ...tag, name: newName } : tag
      );
      
      setHashtags(updatedHashtags);
      
      toast({
        title: "Hashtag Updated",
        description: `#${oldName} has been renamed to #${newName}`
      });
    } catch (error) {
      console.error('Error updating hashtag:', error);
      toast({
        title: "Error Updating Hashtag",
        description: "Failed to update the hashtag. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleDeleteHashtag = async (name: string) => {
    try {
      // Remove this hashtag from all trades
      const { data: trades, error: fetchError } = await supabase
        .from('trades')
        .select('id, tags')
        .contains('tags', [name]);
        
      if (fetchError) throw fetchError;
      
      // Update each trade to remove the tag
      const updatePromises = trades?.map(trade => {
        const updatedTags = (trade.tags || []).filter(tag => tag !== name);
        
        return supabase
          .from('trades')
          .update({ tags: updatedTags })
          .eq('id', trade.id);
      });
      
      if (updatePromises?.length) {
        await Promise.all(updatePromises);
      }
      
      // Update local state
      const updatedHashtags = hashtags.filter(tag => tag.name !== name);
      setHashtags(updatedHashtags);
      
      toast({
        title: "Hashtag Deleted",
        description: `#${name} has been removed from the system`
      });
    } catch (error) {
      console.error('Error deleting hashtag:', error);
      toast({
        title: "Error Deleting Hashtag",
        description: "Failed to delete the hashtag. Please try again.",
        variant: "destructive"
      });
    }
  };

  return (
    <Layout>
      <div>
        <header className="mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
            إدارة الهاشتاغات
          </h1>
          <p className="mt-1 text-sm md:text-base text-gray-500 dark:text-gray-400">
            إدارة الهاشتاغات المستخدمة عبر المنصة.
          </p>
        </header>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          {loading ? (
            <div className="flex justify-center items-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500"></div>
            </div>
          ) : (
            <HashtagsTable 
              hashtags={hashtags}
              onAddHashtag={handleAddHashtag}
              onEditHashtag={handleEditHashtag}
              onDeleteHashtag={handleDeleteHashtag}
            />
          )}
        </div>
      </div>
    </Layout>
  );
};

export default AdminHashtags;
