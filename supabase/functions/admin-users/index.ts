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

    console.log('Admin Users API:', { method, action, user: user.id })

    // Log admin action
    await supabaseAdmin.from('admin_actions').insert({
      admin_user_id: user.id,
      action_type: `user_${action}`,
      target_type: 'user_management',
      details: { method, path: url.pathname }
    })

    switch (action) {
      case 'list':
        return await handleListUsers(supabaseAdmin, url)
      case 'update':
        return await handleUpdateUser(supabaseAdmin, req, user.id)
      case 'suspend':
        return await handleSuspendUser(supabaseAdmin, req, user.id)
      case 'assign-role':
        return await handleAssignRole(supabaseAdmin, req, user.id)
      case 'verification':
        return await handleVerificationActions(supabaseAdmin, req, user.id)
      default:
        return new Response(JSON.stringify({ error: 'Invalid action' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
    }
  } catch (error) {
    console.error('Admin Users API Error:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})

async function handleListUsers(supabase: any, url: URL) {
  const page = parseInt(url.searchParams.get('page') || '1')
  const limit = parseInt(url.searchParams.get('limit') || '20')
  const search = url.searchParams.get('search')
  const userType = url.searchParams.get('user_type')
  const status = url.searchParams.get('status')
  
  // Use secure query that only returns non-admin user profiles
  // This prevents exposure of admin user data through this endpoint
  let query = supabase
    .from('user_profiles')
    .select(`
      id,
      user_id,
      username,
      user_type,
      account_status,
      created_at,
      updated_at,
      user_roles(role),
      subscriptions(status, plan_type, current_period_end),
      agent_verifications(verification_status, license_number)
    `)
    .neq('user_type', 'admin') // Exclude admin users from general listing
    .range((page - 1) * limit, page * limit - 1)
    .order('created_at', { ascending: false })

  if (search) {
    query = query.or(`username.ilike.%${search}%,company.ilike.%${search}%`)
  }
  
  if (userType && userType !== 'admin') { // Prevent admin type filtering
    query = query.eq('user_type', userType)
  }
  
  if (status) {
    query = query.eq('account_status', status)
  }

  const { data, error, count } = await query

  if (error) {
    console.error('List users error:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }

  // Get admin stats using secure function
  const { data: adminStats } = await supabase.rpc('get_secure_admin_stats')
  
  return new Response(JSON.stringify({
    users: data,
    total: count,
    page,
    limit,
    totalPages: Math.ceil((count || 0) / limit),
    adminCount: adminStats?.active_admin_count || 0
  }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  })
}

async function handleUpdateUser(supabase: any, req: Request, adminId: string) {
  const { userId, updates } = await req.json()
  
  const { data, error } = await supabase
    .from('user_profiles')
    .update(updates)
    .eq('user_id', userId)
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
    action_type: 'user_update',
    target_type: 'user',
    target_id: userId,
    details: { updates }
  })

  return new Response(JSON.stringify({ user: data[0] }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  })
}

async function handleSuspendUser(supabase: any, req: Request, adminId: string) {
  const { userId, reason, suspend } = await req.json()
  
  const updates = suspend ? {
    account_status: 'suspended',
    suspended_at: new Date().toISOString(),
    suspended_by: adminId,
    admin_notes: reason
  } : {
    account_status: 'active',
    suspended_at: null,
    suspended_by: null
  }

  const { data, error } = await supabase
    .from('user_profiles')
    .update(updates)
    .eq('user_id', userId)
    .select()

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }

  // Log the suspension/unsuspension
  await supabase.from('admin_actions').insert({
    admin_user_id: adminId,
    action_type: suspend ? 'user_suspend' : 'user_unsuspend',
    target_type: 'user',
    target_id: userId,
    details: { reason, suspend }
  })

  return new Response(JSON.stringify({ user: data[0] }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  })
}

async function handleAssignRole(supabase: any, req: Request, adminId: string) {
  const { userId, role } = await req.json()
  
  // Insert or update user role
  const { data, error } = await supabase
    .from('user_roles')
    .upsert({ user_id: userId, role })
    .select()

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }

  // Update user type in profile
  await supabase
    .from('user_profiles')
    .update({ user_type: role })
    .eq('user_id', userId)

  // Log the role assignment
  await supabase.from('admin_actions').insert({
    admin_user_id: adminId,
    action_type: 'role_assign',
    target_type: 'user',
    target_id: userId,
    details: { role }
  })

  return new Response(JSON.stringify({ success: true, role: data[0] }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  })
}

async function handleVerificationActions(supabase: any, req: Request, adminId: string) {
  const { verificationId, action, notes } = await req.json()
  
  const status = action === 'approve' ? 'approved' : 'rejected'
  const updates = {
    verification_status: status,
    admin_notes: notes,
    verified_by: adminId,
    verified_at: new Date().toISOString()
  }

  const { data, error } = await supabase
    .from('agent_verifications')
    .update(updates)
    .eq('id', verificationId)
    .select()

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }

  // Log the verification action
  await supabase.from('admin_actions').insert({
    admin_user_id: adminId,
    action_type: `agent_verification_${action}`,
    target_type: 'agent_verification',
    target_id: verificationId,
    details: { notes, status }
  })

  return new Response(JSON.stringify({ verification: data[0] }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  })
}