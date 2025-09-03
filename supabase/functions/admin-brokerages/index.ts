import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.8'
import { corsHeaders } from '../_shared/cors.ts'

const supabaseUrl = Deno.env.get('SUPABASE_URL')!
const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'No authorization header' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // Create admin client with service role key for admin operations
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)
    
    // Create regular client to verify user is admin
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } }
    })

    // Verify user is admin
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    const { data: roleData } = await supabase.rpc('is_admin', { user_id: user.id })
    if (!roleData) {
      return new Response(JSON.stringify({ error: 'Admin access required' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    const url = new URL(req.url)
    const method = req.method
    const pathSegments = url.pathname.split('/').filter(Boolean)
    const action = pathSegments[pathSegments.length - 1]

    console.log('Admin Brokerages API:', { method, action, user: user.id })

    // Log admin action
    await supabaseAdmin.from('admin_actions').insert({
      admin_user_id: user.id,
      action_type: `brokerage_${action}`,
      target_type: 'brokerage_management',
      details: { method, path: url.pathname }
    })

    switch (action) {
      case 'list':
        return await handleListBrokerages(supabaseAdmin, url)
      case 'create':
        return await handleCreateBrokerage(supabaseAdmin, req, user.id)
      case 'update':
        return await handleUpdateBrokerage(supabaseAdmin, req, user.id)
      case 'agents':
        return await handleBrokerageAgents(supabaseAdmin, url)
      case 'analytics':
        return await handleBrokerageAnalytics(supabaseAdmin, url)
      default:
        return new Response(JSON.stringify({ error: 'Invalid action' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
    }
  } catch (error) {
    console.error('Admin Brokerages API Error:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})

async function handleListBrokerages(supabase: any, url: URL) {
  const page = parseInt(url.searchParams.get('page') || '1')
  const limit = parseInt(url.searchParams.get('limit') || '20')
  const search = url.searchParams.get('search')
  const status = url.searchParams.get('status')
  const tier = url.searchParams.get('tier')
  
  let query = supabase
    .from('brokerages')
    .select(`
      *,
      agent_count:agent_verifications(count),
      subscription_count:subscriptions(count)
    `)
    .range((page - 1) * limit, page * limit - 1)
    .order('created_at', { ascending: false })

  if (search) {
    query = query.or(`name.ilike.%${search}%,license_number.ilike.%${search}%,city.ilike.%${search}%`)
  }
  
  if (status) {
    query = query.eq('status', status)
  }
  
  if (tier) {
    query = query.eq('tier', tier)
  }

  const { data, error, count } = await query

  if (error) {
    console.error('List brokerages error:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }

  return new Response(JSON.stringify({
    brokerages: data,
    total: count,
    page,
    limit,
    totalPages: Math.ceil((count || 0) / limit)
  }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  })
}

async function handleCreateBrokerage(supabase: any, req: Request, adminId: string) {
  const brokerageData = await req.json()
  
  const { data, error } = await supabase
    .from('brokerages')
    .insert(brokerageData)
    .select()

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }

  // Log the creation
  await supabase.from('admin_actions').insert({
    admin_user_id: adminId,
    action_type: 'brokerage_create',
    target_type: 'brokerage',
    target_id: data[0].id,
    details: { brokerageData }
  })

  return new Response(JSON.stringify({ brokerage: data[0] }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  })
}

async function handleUpdateBrokerage(supabase: any, req: Request, adminId: string) {
  const { brokerageId, updates } = await req.json()
  
  const { data, error } = await supabase
    .from('brokerages')
    .update(updates)
    .eq('id', brokerageId)
    .select()

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }

  // Log the update
  await supabase.from('admin_actions').insert({
    admin_user_id: adminId,
    action_type: 'brokerage_update',
    target_type: 'brokerage',
    target_id: brokerageId,
    details: { updates }
  })

  return new Response(JSON.stringify({ brokerage: data[0] }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  })
}

async function handleBrokerageAgents(supabase: any, url: URL) {
  const brokerageId = url.searchParams.get('brokerage_id')
  const page = parseInt(url.searchParams.get('page') || '1')
  const limit = parseInt(url.searchParams.get('limit') || '20')
  
  if (!brokerageId) {
    return new Response(JSON.stringify({ error: 'Brokerage ID required' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }

  const { data, error, count } = await supabase
    .from('agent_verifications')
    .select(`
      *,
      user_profiles!agent_verifications_user_id_fkey(username, email, phone),
      subscriptions(status, plan_type, current_period_end)
    `)
    .eq('brokerage_id', brokerageId)
    .range((page - 1) * limit, page * limit - 1)
    .order('created_at', { ascending: false })

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }

  return new Response(JSON.stringify({
    agents: data,
    total: count,
    page,
    limit,
    totalPages: Math.ceil((count || 0) / limit)
  }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  })
}

async function handleBrokerageAnalytics(supabase: any, url: URL) {
  const brokerageId = url.searchParams.get('brokerage_id')
  
  if (!brokerageId) {
    return new Response(JSON.stringify({ error: 'Brokerage ID required' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }

  try {
    // Get brokerage info
    const { data: brokerage } = await supabase
      .from('brokerages')
      .select('*')
      .eq('id', brokerageId)
      .single()

    // Get agent count
    const { count: agentCount } = await supabase
      .from('agent_verifications')
      .select('*', { count: 'exact', head: true })
      .eq('brokerage_id', brokerageId)
      .eq('verification_status', 'approved')

    // Get active subscriptions
    const { count: activeSubscriptions } = await supabase
      .from('subscriptions')
      .select('*', { count: 'exact', head: true })
      .eq('brokerage_id', brokerageId)
      .eq('status', 'active')

    // Get total listings from agents
    const { data: agents } = await supabase
      .from('agent_verifications')
      .select('user_id')
      .eq('brokerage_id', brokerageId)
      .eq('verification_status', 'approved')

    let totalListings = 0
    if (agents && agents.length > 0) {
      const agentIds = agents.map(a => a.user_id)
      const { count } = await supabase
        .from('properties')
        .select('*', { count: 'exact', head: true })
        .in('user_id', agentIds)
        .eq('approval_status', 'approved')
      
      totalListings = count || 0
    }

    // Calculate monthly revenue
    const { data: subscriptions } = await supabase
      .from('subscriptions')
      .select('plan_type')
      .eq('brokerage_id', brokerageId)
      .eq('status', 'active')

    const planPrices = { basic: 99, premium: 199 }
    const monthlyRevenue = subscriptions?.reduce((total, sub) => {
      return total + (planPrices[sub.plan_type as keyof typeof planPrices] || 0)
    }, 0) || 0

    return new Response(JSON.stringify({
      brokerage,
      metrics: {
        agentCount: agentCount || 0,
        activeSubscriptions: activeSubscriptions || 0,
        totalListings,
        monthlyRevenue
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  } catch (error) {
    console.error('Brokerage analytics error:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
}