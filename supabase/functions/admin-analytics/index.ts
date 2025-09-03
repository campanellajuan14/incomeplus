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
    const pathSegments = url.pathname.split('/').filter(Boolean)
    const endpoint = pathSegments[pathSegments.length - 1]

    console.log('Admin Analytics API:', { endpoint, user: user.id })

    switch (endpoint) {
      case 'overview':
        return await handleOverviewStats(supabaseAdmin)
      case 'users':
        return await handleUserAnalytics(supabaseAdmin, url)
      case 'properties':
        return await handlePropertyAnalytics(supabaseAdmin, url)
      case 'revenue':
        return await handleRevenueAnalytics(supabaseAdmin, url)
      case 'growth':
        return await handleGrowthAnalytics(supabaseAdmin, url)
      default:
        return new Response(JSON.stringify({ error: 'Invalid endpoint' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
    }
  } catch (error) {
    console.error('Admin Analytics API Error:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})

async function handleOverviewStats(supabase: any) {
  try {
    // Get total counts
    const [usersResult, propertiesResult, agentsResult, subscriptionsResult] = await Promise.all([
      supabase.from('user_profiles').select('*', { count: 'exact', head: true }),
      supabase.from('properties').select('*', { count: 'exact', head: true }),
      supabase.from('user_roles').select('*', { count: 'exact', head: true }).eq('role', 'agent'),
      supabase.from('subscriptions').select('*', { count: 'exact', head: true }).eq('status', 'active')
    ])

    // Get pending verifications
    const { count: pendingVerifications } = await supabase
      .from('agent_verifications')
      .select('*', { count: 'exact', head: true })
      .eq('verification_status', 'pending')

    // Get active listings (approved properties)
    const { count: activeListings } = await supabase
      .from('properties')
      .select('*', { count: 'exact', head: true })
      .eq('approval_status', 'approved')
      .eq('status', 'active')

    // Get flagged content
    const { count: flaggedProperties } = await supabase
      .from('property_flags')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'pending')

    return new Response(JSON.stringify({
      totalUsers: usersResult.count || 0,
      totalProperties: propertiesResult.count || 0,
      totalAgents: agentsResult.count || 0,
      activeSubscriptions: subscriptionsResult.count || 0,
      pendingVerifications: pendingVerifications || 0,
      activeListings: activeListings || 0,
      flaggedProperties: flaggedProperties || 0
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  } catch (error) {
    console.error('Overview stats error:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
}

async function handleUserAnalytics(supabase: any, url: URL) {
  const period = url.searchParams.get('period') || '30d'
  const dateFilter = getDateFilter(period)

  try {
    // User growth over time
    const { data: userGrowth } = await supabase
      .from('user_profiles')
      .select('created_at, user_type')
      .gte('created_at', dateFilter)
      .order('created_at')

    // User type distribution
    const { data: userTypes } = await supabase
      .from('user_profiles')
      .select('user_type')

    // User activity by city
    const { data: usersByCity } = await supabase
      .from('user_profiles')
      .select('city')
      .not('city', 'is', null)

    // Account status distribution
    const { data: accountStatuses } = await supabase
      .from('user_profiles')
      .select('account_status')

    return new Response(JSON.stringify({
      userGrowth: processTimeSeriesData(userGrowth, 'created_at'),
      userTypeDistribution: processDistributionData(userTypes, 'user_type'),
      usersByCity: processDistributionData(usersByCity, 'city').slice(0, 10),
      accountStatusDistribution: processDistributionData(accountStatuses, 'account_status')
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  } catch (error) {
    console.error('User analytics error:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
}

async function handlePropertyAnalytics(supabase: any, url: URL) {
  const period = url.searchParams.get('period') || '30d'
  const dateFilter = getDateFilter(period)

  try {
    // Property listings over time
    const { data: propertyGrowth } = await supabase
      .from('properties')
      .select('created_at, approval_status')
      .gte('created_at', dateFilter)
      .order('created_at')

    // Properties by city
    const { data: propertiesByCity } = await supabase
      .from('properties')
      .select('city, purchase_price')
      .not('city', 'is', null)

    // Average property prices by city
    const cityPrices = propertiesByCity?.reduce((acc: any, prop: any) => {
      if (!acc[prop.city]) {
        acc[prop.city] = { total: 0, count: 0 }
      }
      acc[prop.city].total += prop.purchase_price
      acc[prop.city].count += 1
      return acc
    }, {})

    const avgPricesByCity = Object.entries(cityPrices || {}).map(([city, data]: [string, any]) => ({
      city,
      avgPrice: data.total / data.count,
      count: data.count
    })).sort((a, b) => b.count - a.count).slice(0, 10)

    // Property status distribution
    const { data: propertyStatuses } = await supabase
      .from('properties')
      .select('approval_status, status')

    return new Response(JSON.stringify({
      propertyGrowth: processTimeSeriesData(propertyGrowth, 'created_at'),
      propertiesByCity: processDistributionData(propertiesByCity, 'city').slice(0, 10),
      avgPricesByCity,
      statusDistribution: processDistributionData(propertyStatuses, 'approval_status')
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  } catch (error) {
    console.error('Property analytics error:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
}

async function handleRevenueAnalytics(supabase: any, url: URL) {
  const period = url.searchParams.get('period') || '30d'
  const dateFilter = getDateFilter(period)

  try {
    // Subscription revenue over time
    const { data: subscriptions } = await supabase
      .from('subscriptions')
      .select('created_at, plan_type, status')
      .gte('created_at', dateFilter)
      .order('created_at')

    // Plan type distribution
    const { data: planTypes } = await supabase
      .from('subscriptions')
      .select('plan_type')
      .eq('status', 'active')

    // Monthly recurring revenue estimate
    const planPrices = { basic: 99, premium: 199 } // from system settings
    const mrr = planTypes?.reduce((total: number, sub: any) => {
      return total + (planPrices[sub.plan_type as keyof typeof planPrices] || 0)
    }, 0) || 0

    return new Response(JSON.stringify({
      subscriptionGrowth: processTimeSeriesData(subscriptions, 'created_at'),
      planDistribution: processDistributionData(planTypes, 'plan_type'),
      monthlyRecurringRevenue: mrr,
      totalActiveSubscriptions: planTypes?.length || 0
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  } catch (error) {
    console.error('Revenue analytics error:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
}

async function handleGrowthAnalytics(supabase: any, url: URL) {
  const period = url.searchParams.get('period') || '30d'
  const dateFilter = getDateFilter(period)

  try {
    // Combined growth metrics
    const [users, properties, subscriptions] = await Promise.all([
      supabase.from('user_profiles').select('created_at').gte('created_at', dateFilter),
      supabase.from('properties').select('created_at').gte('created_at', dateFilter),
      supabase.from('subscriptions').select('created_at').gte('created_at', dateFilter)
    ])

    return new Response(JSON.stringify({
      userGrowth: processTimeSeriesData(users.data, 'created_at'),
      propertyGrowth: processTimeSeriesData(properties.data, 'created_at'),
      subscriptionGrowth: processTimeSeriesData(subscriptions.data, 'created_at')
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  } catch (error) {
    console.error('Growth analytics error:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
}

function getDateFilter(period: string): string {
  const now = new Date()
  const days = period === '7d' ? 7 : period === '30d' ? 30 : period === '90d' ? 90 : 365
  const date = new Date(now.getTime() - days * 24 * 60 * 60 * 1000)
  return date.toISOString()
}

function processTimeSeriesData(data: any[], dateField: string) {
  if (!data) return []
  
  const grouped = data.reduce((acc: any, item: any) => {
    const date = new Date(item[dateField]).toISOString().split('T')[0]
    acc[date] = (acc[date] || 0) + 1
    return acc
  }, {})

  return Object.entries(grouped).map(([date, count]) => ({ date, count }))
}

function processDistributionData(data: any[], field: string) {
  if (!data) return []
  
  const grouped = data.reduce((acc: any, item: any) => {
    const value = item[field] || 'Unknown'
    acc[value] = (acc[value] || 0) + 1
    return acc
  }, {})

  return Object.entries(grouped)
    .map(([name, count]) => ({ name, count }))
    .sort((a: any, b: any) => b.count - a.count)
}