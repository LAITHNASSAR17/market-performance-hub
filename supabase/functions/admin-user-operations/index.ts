
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { action, userId, data } = await req.json()
    
    switch (action) {
      case 'block':
        const { error: blockError } = await supabase
          .from('profiles')
          .update({ is_blocked: true })
          .eq('id', userId)
        if (blockError) throw blockError
        break

      case 'unblock':
        const { error: unblockError } = await supabase
          .from('profiles')
          .update({ is_blocked: false })
          .eq('id', userId)
        if (unblockError) throw unblockError
        break

      case 'delete':
        const { error: deleteError } = await supabase.auth.admin.deleteUser(userId)
        if (deleteError) throw deleteError
        break

      default:
        throw new Error('Invalid action')
    }

    return new Response(
      JSON.stringify({ success: true }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})
