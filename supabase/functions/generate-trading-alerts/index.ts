
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Fetch users to generate alerts for
    const { data: users, error: userError } = await supabase
      .from('users')
      .select('id')

    if (userError) throw userError

    // Process alerts for each user
    for (const user of users) {
      await generateUserAlerts(supabase, user.id)
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { 
        ...corsHeaders,
        'Content-Type': 'application/json' 
      }
    })
  } catch (error) {
    console.error('Error generating alerts:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 
        ...corsHeaders,
        'Content-Type': 'application/json' 
      }
    })
  }
})

async function generateUserAlerts(supabase: any, userId: string) {
  // Fetch user's recent trades (last 14 days)
  const { data: trades, error: tradesError } = await supabase
    .from('trades')
    .select('*')
    .eq('user_id', userId)
    .gte('entry_date', new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString())
    .order('entry_date', { ascending: false })

  if (tradesError || !trades) return

  // Analyze repeated mistakes
  const mistakeTags = analyzeMistakeTags(trades)
  if (mistakeTags.length > 0) {
    await createAlert(supabase, {
      userId,
      type: 'mistake',
      title: 'Repeated Trading Mistakes Detected',
      message: `You've repeatedly made mistakes tagged as: ${mistakeTags.join(', ')}. Consider reviewing your trading strategy.`,
      severity: 'warning',
      relatedTag: mistakeTags[0]
    })
  }

  // Analyze performance drop
  const performanceDrop = analyzePerformanceDrop(trades)
  if (performanceDrop) {
    await createAlert(supabase, {
      userId,
      type: 'drop',
      title: 'Performance Decline Alert',
      message: 'Your recent trading performance has declined. Take a moment to review your recent trades.',
      severity: 'critical'
    })
  }

  // Check for best trade achievement
  const bestTradeAchievement = checkBestTradeAchievement(trades)
  if (bestTradeAchievement) {
    await createAlert(supabase, {
      userId,
      type: 'success',
      title: 'New Personal Best!',
      message: 'Congratulations! You\'ve recorded your best trade yet. Keep up the great work!',
      severity: 'info'
    })
  }
}

function analyzeMistakeTags(trades: any[]): string[] {
  // Count repeated tags across last 10 trades
  const tagCounts: { [key: string]: number } = {}
  const lastTenTrades = trades.slice(0, 10)

  lastTenTrades.forEach(trade => {
    trade.tags?.forEach((tag: string) => {
      if (tag.includes('mistake') || tag.includes('bad-trade')) {
        tagCounts[tag] = (tagCounts[tag] || 0) + 1
      }
    })
  })

  // Return tags that appear 3 or more times
  return Object.entries(tagCounts)
    .filter(([_, count]) => count >= 3)
    .map(([tag, _]) => tag)
}

function analyzePerformanceDrop(trades: any[]): boolean {
  if (trades.length < 7) return false

  // Compare win rate and total P/L of first 7 trades vs last 7 trades
  const firstWeek = trades.slice(0, 7)
  const secondWeek = trades.slice(7, 14)

  const firstWeekWinRate = firstWeek.filter(trade => trade.total > 0).length / firstWeek.length
  const secondWeekWinRate = secondWeek.filter(trade => trade.total > 0).length / secondWeek.length

  const firstWeekPL = firstWeek.reduce((sum, trade) => sum + trade.total, 0)
  const secondWeekPL = secondWeek.reduce((sum, trade) => sum + trade.total, 0)

  // Check if performance dropped by more than 20%
  return (firstWeekWinRate - secondWeekWinRate > 0.2) || 
         (firstWeekPL - secondWeekPL > firstWeekPL * 0.2)
}

function checkBestTradeAchievement(trades: any[]): boolean {
  if (trades.length === 0) return false

  // Sort trades by total P/L in descending order
  const sortedTrades = [...trades].sort((a, b) => b.total - a.total)
  
  // Check if the most recent trade is the best trade ever
  return sortedTrades[0].id === trades[0].id && sortedTrades[0].total > 0
}

async function createAlert(supabase: any, alertData: {
  userId: string,
  type: string,
  title: string,
  message: string,
  severity: string,
  relatedTag?: string
}) {
  const { error } = await supabase
    .from('alerts')
    .insert({
      user_id: alertData.userId,
      type: alertData.type,
      title: alertData.title,
      message: alertData.message,
      severity: alertData.severity,
      related_tag: alertData.relatedTag
    })

  if (error) {
    console.error('Error creating alert:', error)
  }
}
