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

    console.log('Admin Properties API:', { method, action, user: user.id })

    // Log admin action
    await supabaseAdmin.from('admin_actions').insert({
      admin_user_id: user.id,
      action_type: `property_${action}`,
      target_type: 'property_management',
      details: { method, path: url.pathname }
    })

    switch (action) {
      case 'list':
        return await handleListProperties(supabaseAdmin, url)
      case 'approve':
        return await handleApproveProperty(supabaseAdmin, req, user.id)
      case 'reject':
        return await handleRejectProperty(supabaseAdmin, req, user.id)
      case 'update':
        return await handleUpdateProperty(supabaseAdmin, req, user.id)
      case 'flag':
        return await handleFlagProperty(supabaseAdmin, req, user.id)
      case 'feature':
        return await handleFeatureProperty(supabaseAdmin, req, user.id)
      case 'flags':
        return await handleListFlags(supabaseAdmin, url)
      default:
        return new Response(JSON.stringify({ error: 'Invalid action' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
    }
  } catch (error) {
    console.error('Admin Properties API Error:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})

async function handleListProperties(supabase: any, url: URL) {
  const page = parseInt(url.searchParams.get('page') || '1')
  const limit = parseInt(url.searchParams.get('limit') || '20')
  const search = url.searchParams.get('search')
  const status = url.searchParams.get('status')
  const approvalStatus = url.searchParams.get('approval_status')
  const agentId = url.searchParams.get('agent_id')
  
  let query = supabase
    .from('properties')
    .select(`
      *,
      user_profiles!properties_user_id_fkey(username, email, phone)
    `)
    .range((page - 1) * limit, page * limit - 1)
    .order('created_at', { ascending: false })

  if (search) {
    query = query.or(`property_title.ilike.%${search}%,address.ilike.%${search}%,city.ilike.%${search}%`)
  }
  
  if (status) {
    query = query.eq('status', status)
  }
  
  if (approvalStatus) {
    query = query.eq('approval_status', approvalStatus)
  }

  if (agentId) {
    query = query.eq('user_id', agentId)
  }

  const { data, error, count } = await query

  if (error) {
    console.error('List properties error:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }

  return new Response(JSON.stringify({
    properties: data,
    total: count,
    page,
    limit,
    totalPages: Math.ceil((count || 0) / limit)
  }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  })
}

async function handleApproveProperty(supabase: any, req: Request, adminId: string) {
  const { propertyId, notes } = await req.json()
  
  const { data, error } = await supabase
    .from('properties')
    .update({
      approval_status: 'approved',
      admin_notes: notes,
      approved_by: adminId,
      approved_at: new Date().toISOString(),
      status: 'active'
    })
    .eq('id', propertyId)
    .select()

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }

  // Log the approval
  await supabase.from('admin_actions').insert({
    admin_user_id: adminId,
    action_type: 'property_approve',
    target_type: 'property',
    target_id: propertyId,
    details: { notes }
  })

  return new Response(JSON.stringify({ property: data[0] }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  })
}

async function handleRejectProperty(supabase: any, req: Request, adminId: string) {
  const { propertyId, reason } = await req.json()
  
  const { data, error } = await supabase
    .from('properties')
    .update({
      approval_status: 'rejected',
      admin_notes: reason,
      approved_by: adminId,
      approved_at: new Date().toISOString(),
      status: 'inactive'
    })
    .eq('id', propertyId)
    .select()

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }

  // Log the rejection
  await supabase.from('admin_actions').insert({
    admin_user_id: adminId,
    action_type: 'property_reject',
    target_type: 'property',
    target_id: propertyId,
    details: { reason }
  })

  return new Response(JSON.stringify({ property: data[0] }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  })
}

async function handleUpdateProperty(supabase: any, req: Request, adminId: string) {
  const { propertyId, updates } = await req.json()
  
  const { data, error } = await supabase
    .from('properties')
    .update(updates)
    .eq('id', propertyId)
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
    action_type: 'property_update',
    target_type: 'property',
    target_id: propertyId,
    details: { updates }
  })

  return new Response(JSON.stringify({ property: data[0] }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  })
}

async function handleFlagProperty(supabase: any, req: Request, adminId: string) {
  const { propertyId, reason, description } = await req.json()
  
  // Create flag record
  const { data: flagData, error: flagError } = await supabase
    .from('property_flags')
    .insert({
      property_id: propertyId,
      flagged_by: adminId,
      reason,
      description
    })
    .select()

  if (flagError) {
    return new Response(JSON.stringify({ error: flagError.message }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }

  // Update property flagged status
  await supabase
    .from('properties')
    .update({ flagged: true })
    .eq('id', propertyId)

  return new Response(JSON.stringify({ flag: flagData[0] }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  })
}

async function handleFeatureProperty(supabase: any, req: Request, adminId: string) {
  const { propertyId, featured } = await req.json()
  
  const { data, error } = await supabase
    .from('properties')
    .update({ featured })
    .eq('id', propertyId)
    .select()

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }

  // Log the feature action
  await supabase.from('admin_actions').insert({
    admin_user_id: adminId,
    action_type: featured ? 'property_feature' : 'property_unfeature',
    target_type: 'property',
    target_id: propertyId,
    details: { featured }
  })

  return new Response(JSON.stringify({ property: data[0] }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  })
}

async function handleListFlags(supabase: any, url: URL) {
  const page = parseInt(url.searchParams.get('page') || '1')
  const limit = parseInt(url.searchParams.get('limit') || '20')
  const status = url.searchParams.get('status')
  
  let query = supabase
    .from('property_flags')
    .select(`
      *,
      properties(property_title, address, city),
      user_profiles!property_flags_flagged_by_fkey(username, email)
    `)
    .range((page - 1) * limit, page * limit - 1)
    .order('created_at', { ascending: false })

  if (status) {
    query = query.eq('status', status)
  }

  const { data, error, count } = await query

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }

  return new Response(JSON.stringify({
    flags: data,
    total: count,
    page,
    limit,
    totalPages: Math.ceil((count || 0) / limit)
  }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  })
}