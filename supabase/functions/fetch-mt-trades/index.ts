
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.4';

// Create a Supabase client
const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
const supabase = createClient(supabaseUrl, supabaseServiceKey);

interface RequestBody {
  userId: string;
}

interface MTConnectionInfo {
  id: string;
  user_id: string;
  account_id: string;
  api_key: string;
  password?: string;
  server: string;
  platform: 'mt4' | 'mt5';
}

// Mock fetchTradesFromMetaTrader (replace with actual MT4/MT5 API implementation)
async function fetchTradesFromMetaTrader(connection: MTConnectionInfo) {
  // In a real implementation, you would use a dedicated MT4/MT5 API client
  // This is a placeholder that returns sample data
  
  console.log(`Fetching trades for ${connection.platform} account ${connection.account_id}`);
  
  // Delay to simulate API call
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Simulated trade data
  const now = new Date();
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  
  // Return sample trades - in a real implementation this would come from the MT4/MT5 API
  return [
    {
      ticket: 12345678,
      symbol: 'EURUSD',
      type: 'buy', // buy or sell
      lots: 0.1,
      openTime: yesterday.toISOString(),
      closeTime: now.toISOString(),
      openPrice: 1.10243,
      closePrice: 1.10567,
      stopLoss: 1.09800,
      takeProfit: 1.10900,
      profit: 32.4,
      commission: 0.7,
      swap: -0.12,
      comment: 'Mobile Trade'
    },
    {
      ticket: 12345679,
      symbol: 'GBPUSD',
      type: 'sell',
      lots: 0.05,
      openTime: yesterday.toISOString(),
      closeTime: now.toISOString(),
      openPrice: 1.26543,
      closePrice: 1.26123,
      stopLoss: 1.27000,
      takeProfit: 1.26000,
      profit: 21.0,
      commission: 0.5,
      swap: -0.08,
      comment: ''
    }
  ];
}

serve(async (req) => {
  try {
    // Check if it's a POST request
    if (req.method !== 'POST') {
      return new Response(JSON.stringify({ error: 'Method not allowed' }), {
        status: 405,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Parse request body
    const { userId } = await req.json() as RequestBody;
    
    if (!userId) {
      return new Response(JSON.stringify({ error: 'User ID is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Get MetaTrader connection info from database
    const { data: connectionData, error: connectionError } = await supabase
      .from('mt_connections')
      .select('*')
      .eq('user_id', userId)
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (connectionError || !connectionData) {
      return new Response(JSON.stringify({ 
        success: false, 
        message: 'No active MetaTrader connection found' 
      }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Fetch trades from MetaTrader API
    const trades = await fetchTradesFromMetaTrader(connectionData);

    // Import trades to our trades table
    let importedCount = 0;
    for (const trade of trades) {
      // Create a record in our trades table
      const { error: tradeError } = await supabase
        .from('trades')
        .upsert({
          // Use broker ticket as a unique identifier for upsert
          external_id: trade.ticket.toString(),
          user_id: userId,
          symbol: trade.symbol,
          direction: trade.type === 'buy' ? 'long' : 'short',
          entry_price: trade.openPrice,
          exit_price: trade.closePrice,
          quantity: trade.lots,
          entry_date: trade.openTime,
          exit_date: trade.closeTime,
          profit_loss: trade.profit,
          fees: trade.commission + (trade.swap || 0),
          stop_loss: trade.stopLoss,
          take_profit: trade.takeProfit,
          notes: `Imported from ${connectionData.platform.toUpperCase()}: ${trade.comment || 'No comment'}`,
          tags: ['metatrader', connectionData.platform]
        });
      
      if (!tradeError) {
        importedCount++;
      } else {
        console.error('Error importing trade:', tradeError);
      }
    }

    // Update last sync timestamp
    await supabase
      .from('mt_connections')
      .update({ last_sync: new Date().toISOString() })
      .eq('id', connectionData.id);

    return new Response(JSON.stringify({ 
      success: true, 
      importedCount,
      message: `Successfully imported ${importedCount} trades` 
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
    
  } catch (error) {
    console.error('Error in fetch-mt-trades function:', error);
    return new Response(JSON.stringify({ 
      success: false,
      message: error.message || 'An unexpected error occurred' 
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
});
