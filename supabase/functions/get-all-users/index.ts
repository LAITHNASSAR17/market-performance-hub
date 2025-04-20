
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

serve(async (req) => {
  // Create a Supabase client with the Auth context of the logged in user
  const supabaseClient = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    {
      global: {
        headers: { Authorization: req.headers.get('Authorization')! },
      },
    }
  )
  
  // Get the session of the authenticated user
  const {
    data: { session },
    error: sessionError,
  } = await supabaseClient.auth.getSession()

  if (sessionError) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      headers: { 'Content-Type': 'application/json' },
      status: 401,
    })
  }

  // Check if the user is an admin
  const currentUser = session?.user
  const { data: userMetadata } = await supabaseClient
    .from('profiles')
    .select('is_admin')
    .eq('id', currentUser?.id)
    .single()

  if (!userMetadata?.is_admin) {
    return new Response(JSON.stringify({ error: 'Forbidden' }), {
      headers: { 'Content-Type': 'application/json' },
      status: 403,
    })
  }

  // If user is admin, get all users data
  try {
    // We access Auth data via RPC
    const { data, error } = await supabaseClient.rpc('get_all_users')
    
    if (error) throw error
    
    return new Response(JSON.stringify(data), {
      headers: { 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})
