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

    console.log('Admin Settings API:', { method, action, user: user.id })

    switch (action) {
      case 'get':
        return await handleGetSettings(supabaseAdmin, url)
      case 'update':
        return await handleUpdateSettings(supabaseAdmin, req, user.id)
      case 'pricing':
        return await handlePricingSettings(supabaseAdmin, req, user.id)
      case 'email-templates':
        return await handleEmailTemplates(supabaseAdmin, req, user.id)
      case 'app-config':
        return await handleAppConfig(supabaseAdmin, req, user.id)
      default:
        return new Response(JSON.stringify({ error: 'Invalid action' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
    }
  } catch (error) {
    console.error('Admin Settings API Error:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})

async function handleGetSettings(supabase: any, url: URL) {
  const key = url.searchParams.get('key')
  
  let query = supabase.from('system_settings').select('*')
  
  if (key) {
    query = query.eq('key', key)
    const { data, error } = await query.single()
    
    if (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }
    
    return new Response(JSON.stringify({ setting: data }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  } else {
    const { data, error } = await query.order('key')
    
    if (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }
    
    return new Response(JSON.stringify({ settings: data }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
}

async function handleUpdateSettings(supabase: any, req: Request, adminId: string) {
  const { key, value, description } = await req.json()
  
  const { data, error } = await supabase
    .from('system_settings')
    .upsert({
      key,
      value,
      description,
      updated_by: adminId
    })
    .select()

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }

  // Log the settings update
  await supabase.from('admin_actions').insert({
    admin_user_id: adminId,
    action_type: 'settings_update',
    target_type: 'system_settings',
    target_id: data[0].id,
    details: { key, value, description }
  })

  return new Response(JSON.stringify({ setting: data[0] }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  })
}

async function handlePricingSettings(supabase: any, req: Request, adminId: string) {
  const { pricingTiers } = await req.json()
  
  const { data, error } = await supabase
    .from('system_settings')
    .upsert({
      key: 'pricing_tiers',
      value: pricingTiers,
      description: 'Pricing tier configuration',
      updated_by: adminId
    })
    .select()

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }

  // Log the pricing update
  await supabase.from('admin_actions').insert({
    admin_user_id: adminId,
    action_type: 'pricing_update',
    target_type: 'system_settings',
    target_id: data[0].id,
    details: { pricingTiers }
  })

  return new Response(JSON.stringify({ setting: data[0] }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  })
}

async function handleEmailTemplates(supabase: any, req: Request, adminId: string) {
  const { templates } = await req.json()
  
  const { data, error } = await supabase
    .from('system_settings')
    .upsert({
      key: 'email_templates',
      value: templates,
      description: 'Email template configuration',
      updated_by: adminId
    })
    .select()

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }

  // Log the template update
  await supabase.from('admin_actions').insert({
    admin_user_id: adminId,
    action_type: 'email_templates_update',
    target_type: 'system_settings',
    target_id: data[0].id,
    details: { templates }
  })

  return new Response(JSON.stringify({ setting: data[0] }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  })
}

async function handleAppConfig(supabase: any, req: Request, adminId: string) {
  const { config } = await req.json()
  
  const { data, error } = await supabase
    .from('system_settings')
    .upsert({
      key: 'app_settings',
      value: config,
      description: 'General application settings',
      updated_by: adminId
    })
    .select()

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }

  // Log the config update
  await supabase.from('admin_actions').insert({
    admin_user_id: adminId,
    action_type: 'app_config_update',
    target_type: 'system_settings',
    target_id: data[0].id,    
    details: { config }
  })

  return new Response(JSON.stringify({ setting: data[0] }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  })
}