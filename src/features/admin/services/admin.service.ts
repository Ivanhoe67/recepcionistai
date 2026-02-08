'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

/**
 * Check if current user is admin
 */
async function requireAdmin(): Promise<boolean> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return false

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  return profile?.role === 'admin'
}

/**
 * Get all users with complete info (admin only)
 */
export async function getAllUsers() {
  if (!await requireAdmin()) {
    throw new Error('Unauthorized')
  }

  const supabase = createAdminClient()

  // Get users with profiles, subscriptions, and auth info
  const { data: profiles, error: profilesError } = await supabase
    .from('profiles')
    .select(`
      id,
      full_name,
      avatar_url,
      role,
      created_at,
      updated_at
    `)
    .order('created_at', { ascending: false })

  if (profilesError) throw profilesError

  // Get auth users for emails
  const { data: { users: authUsers }, error: authError } = await supabase.auth.admin.listUsers()

  if (authError) throw authError

  // Get subscriptions
  const { data: subscriptions } = await supabase
    .from('subscriptions')
    .select(`
      id,
      user_id,
      status,
      billing_cycle,
      current_period_end,
      plan:subscription_plans(
        id,
        name,
        display_name,
        price_monthly
      )
    `)
    .in('status', ['active', 'trial', 'cancelled'])

  // Get businesses count per user
  const { data: businesses } = await supabase
    .from('businesses')
    .select('id, user_id')

  // Combine data
  return profiles?.map(profile => {
    const authUser = authUsers?.find(u => u.id === profile.id)
    const userSubscription = subscriptions?.find(s => s.user_id === profile.id)
    const userBusinesses = businesses?.filter(b => b.user_id === profile.id) || []

    return {
      id: profile.id,
      email: authUser?.email || 'N/A',
      full_name: profile.full_name,
      avatar_url: profile.avatar_url,
      role: profile.role || 'user',
      created_at: profile.created_at,
      last_sign_in: authUser?.last_sign_in_at || null,
      subscription: userSubscription || null,
      business_count: userBusinesses.length,
    }
  }) || []
}

/**
 * Get user details (admin only)
 */
export async function getUserDetails(userId: string) {
  if (!await requireAdmin()) {
    throw new Error('Unauthorized')
  }

  const supabase = createAdminClient()

  // Get profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()

  // Get auth user
  const { data: { user: authUser } } = await supabase.auth.admin.getUserById(userId)

  // Get subscription
  const { data: subscription } = await supabase
    .from('subscriptions')
    .select(`
      *,
      plan:subscription_plans(*),
      usage:subscription_usage(*)
    `)
    .eq('user_id', userId)
    .in('status', ['active', 'trial'])
    .maybeSingle()

  // Get businesses
  const { data: businesses } = await supabase
    .from('businesses')
    .select('*')
    .eq('user_id', userId)

  // Get leads count
  let leadsCount = 0
  if (businesses && businesses.length > 0) {
    const { count } = await supabase
      .from('leads')
      .select('*', { count: 'exact', head: true })
      .in('business_id', businesses.map(b => b.id))
    leadsCount = count || 0
  }

  return {
    profile,
    email: authUser?.email,
    last_sign_in: authUser?.last_sign_in_at,
    subscription,
    businesses: businesses || [],
    leads_count: leadsCount || 0,
  }
}

/**
 * Update user role (admin only)
 */
export async function updateUserRole(userId: string, role: 'admin' | 'user') {
  if (!await requireAdmin()) {
    throw new Error('Unauthorized')
  }

  const supabase = createAdminClient()

  const { error } = await supabase
    .from('profiles')
    .update({ role, updated_at: new Date().toISOString() })
    .eq('id', userId)

  if (error) throw error

  revalidatePath('/admin')
  return { success: true }
}

/**
 * Assign plan to user (admin only)
 */
export async function assignPlanToUser(
  userId: string,
  planId: string,
  options: {
    billingCycle?: 'monthly' | 'yearly'
    trialDays?: number
    replaceExisting?: boolean
  } = {}
) {
  if (!await requireAdmin()) {
    throw new Error('Unauthorized')
  }

  const supabase = createAdminClient()
  const { billingCycle = 'monthly', trialDays = 0, replaceExisting = true } = options

  // Cancel existing subscription if needed
  if (replaceExisting) {
    await supabase
      .from('subscriptions')
      .update({ status: 'cancelled', cancelled_at: new Date().toISOString() })
      .eq('user_id', userId)
      .in('status', ['active', 'trial'])
  }

  // Create new subscription
  const now = new Date()
  const periodEnd = new Date()
  if (billingCycle === 'monthly') {
    periodEnd.setMonth(periodEnd.getMonth() + 1)
  } else {
    periodEnd.setFullYear(periodEnd.getFullYear() + 1)
  }

  const trialEndsAt = trialDays > 0
    ? new Date(now.getTime() + trialDays * 24 * 60 * 60 * 1000)
    : null

  const { data: subscription, error } = await supabase
    .from('subscriptions')
    .insert({
      user_id: userId,
      plan_id: planId,
      status: trialDays > 0 ? 'trial' : 'active',
      billing_cycle: billingCycle,
      current_period_start: now.toISOString(),
      current_period_end: periodEnd.toISOString(),
      trial_ends_at: trialEndsAt?.toISOString() || null,
    })
    .select()
    .single()

  if (error) throw error

  // Create initial usage record
  await supabase
    .from('subscription_usage')
    .insert({
      subscription_id: subscription.id,
      user_id: userId,
      period_start: now.toISOString(),
      period_end: periodEnd.toISOString(),
      messages_used: 0,
      voice_minutes_used: 0,
      leads_captured: 0,
    })

  revalidatePath('/admin')
  return { success: true, subscription }
}

/**
 * Cancel user subscription (admin only)
 */
export async function cancelUserSubscription(userId: string) {
  if (!await requireAdmin()) {
    throw new Error('Unauthorized')
  }

  const supabase = createAdminClient()

  const { error } = await supabase
    .from('subscriptions')
    .update({
      status: 'cancelled',
      cancelled_at: new Date().toISOString()
    })
    .eq('user_id', userId)
    .in('status', ['active', 'trial'])

  if (error) throw error

  revalidatePath('/admin')
  return { success: true }
}

/**
 * Create or update user business settings (admin only)
 */
export async function createOrUpdateUserBusiness(
  userId: string,
  businessId: string | null,
  data: {
    name: string
    phone_number?: string
    timezone?: string
    retell_agent_id?: string
    whatsapp_phone?: string
  }
) {
  if (!await requireAdmin()) {
    throw new Error('Unauthorized')
  }

  const supabase = createAdminClient()

  try {
    // If businessId exists, update it
    if (businessId) {
      const { error } = await supabase
        .from('businesses')
        .update({ 
          name: data.name,
          phone: data.phone_number || null,
          timezone: data.timezone || 'America/Mexico_City',
          retell_agent_id: data.retell_agent_id || null,
          whatsapp_phone: data.whatsapp_phone || null,
          updated_at: new Date().toISOString() 
        })
        .eq('id', businessId)

      if (error) {
        console.error('Error updating business:', error)
        throw new Error(`Error al actualizar el negocio: ${error.message}`)
      }
      
      revalidatePath('/admin')
      revalidatePath(`/admin/users/${userId}`)
      return { success: true, businessId }
    }

    // Otherwise, create a new business
    const { data: newBusiness, error } = await supabase
      .from('businesses')
      .insert({
        user_id: userId,
        name: data.name,
        phone: data.phone_number || null,
        timezone: data.timezone || 'America/Mexico_City',
        retell_agent_id: data.retell_agent_id || null,
        whatsapp_phone: data.whatsapp_phone || null,
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating business:', error)
      throw new Error(`Error al crear el negocio: ${error.message}`)
    }

    revalidatePath('/admin')
    revalidatePath(`/admin/users/${userId}`)
    return { success: true, businessId: newBusiness.id }
  } catch (error: any) {
    console.error('Error in createOrUpdateUserBusiness:', error)
    throw error
  }
}

/**
 * Update user business settings (admin only) - kept for backwards compatibility
 */
export async function updateUserBusiness(
  businessId: string,
  data: {
    name?: string
    phone_number?: string
    timezone?: string
    retell_agent_id?: string
    whatsapp_phone?: string
  }
) {
  if (!await requireAdmin()) {
    throw new Error('Unauthorized')
  }

  const supabase = createAdminClient()

  // Map phone_number to phone column
  const updateData: any = { ...data }
  if (data.phone_number !== undefined) {
    updateData.phone = data.phone_number
    delete updateData.phone_number
  }

  const { error } = await supabase
    .from('businesses')
    .update({ ...updateData, updated_at: new Date().toISOString() })
    .eq('id', businessId)

  if (error) throw error

  revalidatePath('/admin')
  return { success: true }
}

/**
 * Get admin dashboard stats
 */
export async function getAdminStats() {
  if (!await requireAdmin()) {
    throw new Error('Unauthorized')
  }

  const supabase = createAdminClient()

  // Get total users
  const { count: totalUsers } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true })

  // Get admin count
  const { count: adminCount } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true })
    .eq('role', 'admin')

  // Get active subscriptions
  const { data: activeSubscriptions } = await supabase
    .from('subscriptions')
    .select(`
      id,
      plan:subscription_plans(price_monthly)
    `)
    .in('status', ['active', 'trial'])

  // Calculate MRR
  const mrr = activeSubscriptions?.reduce((acc, sub) => {
    const plan = sub.plan as { price_monthly: number } | null
    return acc + (plan?.price_monthly || 0)
  }, 0) || 0

  // Get leads this month
  const startOfMonth = new Date()
  startOfMonth.setDate(1)
  startOfMonth.setHours(0, 0, 0, 0)

  const { count: leadsThisMonth } = await supabase
    .from('leads')
    .select('*', { count: 'exact', head: true })
    .gte('created_at', startOfMonth.toISOString())

  // Get appointments this month
  const { count: appointmentsThisMonth } = await supabase
    .from('appointments')
    .select('*', { count: 'exact', head: true })
    .gte('created_at', startOfMonth.toISOString())

  return {
    total_users: totalUsers || 0,
    admin_count: adminCount || 0,
    active_subscriptions: activeSubscriptions?.length || 0,
    mrr,
    leads_this_month: leadsThisMonth || 0,
    appointments_this_month: appointmentsThisMonth || 0,
  }
}
