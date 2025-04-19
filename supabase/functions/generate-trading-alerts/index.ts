
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

  // 1. Analyze repeated hashtags
  await analyzeRepeatedHashtags(supabase, userId, trades)

  // 2. Analyze emotional tags and their impact
  await analyzeEmotionalTags(supabase, userId, trades)

  // 3. Analyze playbook performance
  await analyzePlaybookPerformance(supabase, userId, trades)

  // 4. Analyze session performance
  await analyzeSessionPerformance(supabase, userId, trades)

  // Original alert generation logic
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

async function analyzeRepeatedHashtags(supabase: any, userId: string, trades: any[]) {
  // Focus on last 10 trades
  const recentTrades = trades.slice(0, 10)
  if (recentTrades.length < 5) return // Need at least 5 trades for meaningful analysis
  
  // Count hashtag occurrences
  const hashtagCounts: { [key: string]: number } = {}
  
  recentTrades.forEach(trade => {
    trade.tags?.forEach((tag: string) => {
      if (!tag.includes('mistake') && !tag.includes('emotion:')) { // Skip mistake tags and emotion tags
        hashtagCounts[tag] = (hashtagCounts[tag] || 0) + 1
      }
    })
  })
  
  // Find hashtags used 3+ times
  const frequentHashtags = Object.entries(hashtagCounts)
    .filter(([_, count]) => (count as number) >= 3)
    .sort((a, b) => (b[1] as number) - (a[1] as number))
  
  // Generate alerts for frequent hashtags
  for (const [tag, count] of frequentHashtags) {
    // Check if tag is associated with mostly losing trades
    const taggedTrades = recentTrades.filter(trade => trade.tags?.includes(tag))
    const losingTaggedTrades = taggedTrades.filter(trade => trade.profit_loss < 0)
    const winRate = taggedTrades.length > 0 ? 
      (taggedTrades.length - losingTaggedTrades.length) / taggedTrades.length * 100 : 0
    
    if (winRate < 40 && taggedTrades.length >= 3) {
      // This tag is associated with poor performance
      await createAlert(supabase, {
        userId,
        type: 'mistake',
        title: `Hashtag Performance Issue: #${tag}`,
        message: `You've used #${tag} in ${count} recent trades with only ${winRate.toFixed(0)}% win rate. Consider reviewing your approach when this factor is present.`,
        severity: 'warning',
        relatedTag: tag
      })
    } else if (winRate > 70 && taggedTrades.length >= 3) {
      // This tag is associated with good performance
      await createAlert(supabase, {
        userId,
        type: 'success',
        title: `Strong Performance with #${tag}`,
        message: `You've used #${tag} in ${count} recent trades with a ${winRate.toFixed(0)}% win rate. This might be a key part of your edge.`,
        severity: 'info',
        relatedTag: tag
      })
    } else if (count >= 4) {
      // Just notify about the frequent usage
      await createAlert(supabase, {
        userId,
        type: 'info',
        title: `Frequent Tag: #${tag}`,
        message: `You've used #${tag} in ${count} of your last 10 trades. Consider if this is a pattern you should be aware of.`,
        severity: 'info',
        relatedTag: tag
      })
    }
  }
}

async function analyzeEmotionalTags(supabase: any, userId: string, trades: any[]) {
  if (trades.length < 5) return // Need at least 5 trades for meaningful analysis
  
  // Extract emotion tags (assumed format: "emotion:fear", "emotion:confidence", etc.)
  const emotionTrades: { [emotion: string]: any[] } = {}
  
  trades.forEach(trade => {
    trade.tags?.forEach((tag: string) => {
      if (tag.startsWith('emotion:')) {
        const emotion = tag.replace('emotion:', '')
        if (!emotionTrades[emotion]) {
          emotionTrades[emotion] = []
        }
        emotionTrades[emotion].push(trade)
      }
    })
  })
  
  // Analyze each emotion's impact on performance
  for (const [emotion, emotionTradesList] of Object.entries(emotionTrades)) {
    if (emotionTradesList.length < 3) continue // Need at least 3 trades with this emotion
    
    const losingTrades = emotionTradesList.filter(trade => trade.profit_loss < 0)
    const losingPercentage = (losingTrades.length / emotionTradesList.length) * 100
    
    // If emotion is present in >60% of losing trades
    if (losingPercentage >= 60 && losingTrades.length >= 3) {
      await createAlert(supabase, {
        userId,
        type: 'mistake',
        title: `Emotion Impact: ${emotion}`,
        message: `${losingPercentage.toFixed(0)}% of your trades tagged with '${emotion}' resulted in losses. Your emotional state might be affecting your trading decisions.`,
        severity: 'warning',
        relatedTag: `emotion:${emotion}`
      })
    }
    
    // If emotion is associated with profitable trades (win rate > 70%)
    const winRate = 100 - losingPercentage
    if (winRate >= 70 && emotionTradesList.length >= 3) {
      await createAlert(supabase, {
        userId,
        type: 'success',
        title: `Positive Emotion Impact: ${emotion}`,
        message: `Trading with '${emotion}' shows a ${winRate.toFixed(0)}% win rate. This emotional state seems beneficial for your trading decisions.`,
        severity: 'info',
        relatedTag: `emotion:${emotion}`
      })
    }
  }
}

async function analyzePlaybookPerformance(supabase: any, userId: string, trades: any[]) {
  // Extract playbook usage
  const playbookTrades: { [playbook: string]: any[] } = {}
  
  trades.forEach(trade => {
    if (trade.playbook) {
      // Fetch playbook name if it's a UUID reference
      const playbookName = trade.playbook.toString() 
      if (!playbookTrades[playbookName]) {
        playbookTrades[playbookName] = []
      }
      playbookTrades[playbookName].push(trade)
    }
  })
  
  // Analyze each playbook's performance
  for (const [playbook, playbookTradesList] of Object.entries(playbookTrades)) {
    if (playbookTradesList.length < 3) continue // Need minimum trades for analysis
    
    // Get playbook details if it's a UUID
    let playbookName = playbook
    try {
      if (playbook.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
        const { data: playbookData } = await supabase
          .from('playbooks')
          .select('name')
          .eq('id', playbook)
          .single()
        
        if (playbookData) {
          playbookName = playbookData.name
        }
      }
    } catch (err) {
      console.error('Error fetching playbook details:', err)
    }
    
    const winningTrades = playbookTradesList.filter(trade => trade.profit_loss > 0)
    const winRate = (winningTrades.length / playbookTradesList.length) * 100
    
    // Playbooks with poor performance (<40% win rate)
    if (winRate < 40 && playbookTradesList.length >= 3) {
      await createAlert(supabase, {
        userId,
        type: 'drop',
        title: `Playbook Underperforming: ${playbookName}`,
        message: `Your '${playbookName}' strategy has only a ${winRate.toFixed(0)}% success rate from ${playbookTradesList.length} trades. Consider reviewing the entry criteria or execution.`,
        severity: 'warning',
        relatedTag: playbook
      })
    }
    
    // Playbooks with strong performance (>80% win rate)
    if (winRate > 80 && playbookTradesList.length >= 3) {
      await createAlert(supabase, {
        userId,
        type: 'success',
        title: `Playbook Excellence: ${playbookName}`,
        message: `Your '${playbookName}' strategy has an impressive ${winRate.toFixed(0)}% win rate from ${playbookTradesList.length} trades. This might be your edge – consider using it more consistently.`,
        severity: 'info',
        relatedTag: playbook
      })
    }
  }
}

async function analyzeSessionPerformance(supabase: any, userId: string, trades: any[]) {
  if (trades.length < 10) return // Need sufficient trades for session analysis
  
  // Analyze performance by session if marketSession field exists
  const sessionPerformance: { 
    [session: string]: { 
      trades: number, 
      wins: number, 
      totalPL: number,
      avgPL: number 
    } 
  } = {}
  
  let hasSessions = false
  
  trades.forEach(trade => {
    if (trade.market_session) {
      hasSessions = true
      const session = trade.market_session
      
      if (!sessionPerformance[session]) {
        sessionPerformance[session] = { trades: 0, wins: 0, totalPL: 0, avgPL: 0 }
      }
      
      sessionPerformance[session].trades++
      if (trade.profit_loss > 0) {
        sessionPerformance[session].wins++
      }
      sessionPerformance[session].totalPL += trade.profit_loss || 0
    }
  })
  
  if (!hasSessions) return // No session data available
  
  // Calculate averages and find best/worst sessions
  const sessions = Object.entries(sessionPerformance)
  
  if (sessions.length <= 1) return // Need multiple sessions to compare
  
  for (const [session, stats] of sessions) {
    stats.avgPL = stats.totalPL / stats.trades
  }
  
  // Sort sessions by win rate
  const sortedByWinRate = [...sessions].sort((a, b) => {
    const winRateA = a[1].wins / a[1].trades
    const winRateB = b[1].wins / b[1].trades
    return winRateB - winRateA
  })
  
  // Sort sessions by average P/L
  const sortedByPL = [...sessions].sort((a, b) => {
    return b[1].avgPL - a[1].avgPL
  })
  
  // Best session by win rate
  const bestWinRateSession = sortedByWinRate[0]
  const bestWinRate = (bestWinRateSession[1].wins / bestWinRateSession[1].trades) * 100
  
  if (bestWinRate > 60 && bestWinRateSession[1].trades >= 5) {
    await createAlert(supabase, {
      userId,
      type: 'success',
      title: `Best Session: ${bestWinRateSession[0]}`,
      message: `Your trading during the ${bestWinRateSession[0]} session shows a ${bestWinRate.toFixed(0)}% win rate. Consider focusing more on this timeframe.`,
      severity: 'info',
      relatedTag: `session:${bestWinRateSession[0]}`
    })
  }
  
  // Worst session by win rate
  const worstWinRateSession = sortedByWinRate[sortedByWinRate.length - 1]
  const worstWinRate = (worstWinRateSession[1].wins / worstWinRateSession[1].trades) * 100
  
  if (worstWinRate < 40 && worstWinRateSession[1].trades >= 5) {
    await createAlert(supabase, {
      userId,
      type: 'drop',
      title: `Challenging Session: ${worstWinRateSession[0]}`,
      message: `Your trading during the ${worstWinRateSession[0]} session shows only a ${worstWinRate.toFixed(0)}% win rate. Consider adjusting your approach or avoiding this timeframe.`,
      severity: 'warning',
      relatedTag: `session:${worstWinRateSession[0]}`
    })
  }
  
  // Significant difference between best and worst sessions
  if (bestWinRate - worstWinRate > 30 && 
      bestWinRateSession[1].trades >= 5 && 
      worstWinRateSession[1].trades >= 5) {
    await createAlert(supabase, {
      userId,
      type: 'improvement',
      title: 'Session Optimization Opportunity',
      message: `There's a ${(bestWinRate - worstWinRate).toFixed(0)}% difference in win rate between your best session (${bestWinRateSession[0]}) and worst session (${worstWinRateSession[0]}). Consider focusing more on your stronger timeframes.`,
      severity: 'info',
      relatedTag: `session:${bestWinRateSession[0]}`
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

  const firstWeekWinRate = firstWeek.filter(trade => trade.profit_loss > 0).length / firstWeek.length
  const secondWeekWinRate = secondWeek.filter(trade => trade.profit_loss > 0).length / secondWeek.length

  const firstWeekPL = firstWeek.reduce((sum, trade) => sum + (trade.profit_loss || 0), 0)
  const secondWeekPL = secondWeek.reduce((sum, trade) => sum + (trade.profit_loss || 0), 0)

  // Check if performance dropped by more than 20%
  return (firstWeekWinRate - secondWeekWinRate > 0.2) || 
         (firstWeekPL - secondWeekPL > firstWeekPL * 0.2)
}

function checkBestTradeAchievement(trades: any[]): boolean {
  if (trades.length === 0) return false

  // Sort trades by total P/L in descending order
  const sortedTrades = [...trades].sort((a, b) => (b.profit_loss || 0) - (a.profit_loss || 0))
  
  // Check if the most recent trade is the best trade ever
  return sortedTrades[0].id === trades[0].id && sortedTrades[0].profit_loss > 0
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
