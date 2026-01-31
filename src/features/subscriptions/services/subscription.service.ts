'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/server'
import {
  SubscriptionPlan,
  Subscription,
  SubscriptionUsage,
  UserPlanFeatures,
  PlanName,
} from '@/lib/database.types'

export interface SubscriptionWithPlan extends Subscription {
  plan: SubscriptionPlan
  usage?: SubscriptionUsage | null
}

/**
 * Get all active subscription plans
 */
export async function getSubscriptionPlans(): Promise<SubscriptionPlan[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('subscription_plans')
    .select('*')
    .eq('is_active', true)
    .order('sort_order', { ascending: true })

  if (error) throw error
  return data as SubscriptionPlan[]
}

/**
 * Get a specific plan by name
 */
export async function getPlanByName(name: PlanName): Promise<SubscriptionPlan | null> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('subscription_plans')
    .select('*')
    .eq('name', name)
    .single()

  if (error) return null
  return data as SubscriptionPlan
}

/**
 * Get current user's subscription with plan details
 */
export async function getCurrentSubscription(): Promise<SubscriptionWithPlan | null> {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: subscription, error } = await supabase
    .from('subscriptions')
    .select(`
      *,
      plan:subscription_plans(*),
      usage:subscription_usage(*)
    `)
    .eq('user_id', user.id)
    .in('status', ['active', 'trial'])
    .single()

  if (error || !subscription) return null

  // Get current period usage
  const usageArray = subscription.usage as SubscriptionUsage[] | null
  const currentUsage = usageArray?.find(u =>
    new Date() >= new Date(u.period_start) &&
    new Date() <= new Date(u.period_end)
  ) || null

  return {
    ...subscription,
    plan: subscription.plan as SubscriptionPlan,
    usage: currentUsage,
  }
}

/**
 * Get user's plan features (including admin check)
 */
export async function getUserPlanFeatures(): Promise<UserPlanFeatures> {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return getDefaultFeatures()
  }

  // Get profile to check admin status
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  const isAdmin = profile?.role === 'admin'

  // Admins get everything
  if (isAdmin) {
    return {
      plan_name: 'premium',
      has_messaging: true,
      has_voice: true,
      has_appointments: true,
      has_analytics: true,
      has_priority_support: true,
      max_messages_monthly: null, // unlimited
      max_voice_minutes_monthly: null, // unlimited
      messages_used: 0,
      voice_minutes_used: 0,
      subscription_status: 'active',
      is_admin: true,
    }
  }

  // Get subscription for regular users
  const subscription = await getCurrentSubscription()

  if (!subscription) {
    return getDefaultFeatures()
  }

  return {
    plan_name: subscription.plan.name as PlanName,
    has_messaging: subscription.plan.has_messaging,
    has_voice: subscription.plan.has_voice,
    has_appointments: subscription.plan.has_appointments,
    has_analytics: subscription.plan.has_analytics,
    has_priority_support: subscription.plan.has_priority_support,
    max_messages_monthly: subscription.plan.max_messages_monthly,
    max_voice_minutes_monthly: subscription.plan.max_voice_minutes_monthly,
    messages_used: subscription.usage?.messages_used || 0,
    voice_minutes_used: subscription.usage?.voice_minutes_used || 0,
    subscription_status: subscription.status,
    is_admin: false,
  }
}

/**
 * Check if user can use a specific feature
 */
export async function canUseFeature(feature: 'messaging' | 'voice' | 'appointments' | 'analytics'): Promise<boolean> {
  const features = await getUserPlanFeatures()

  if (features.is_admin) return true

  switch (feature) {
    case 'messaging':
      return features.has_messaging
    case 'voice':
      return features.has_voice
    case 'appointments':
      return features.has_appointments
    case 'analytics':
      return features.has_analytics
    default:
      return false
  }
}

/**
 * Check if user has usage remaining
 */
export async function hasUsageRemaining(usageType: 'messages' | 'voice_minutes'): Promise<boolean> {
  const features = await getUserPlanFeatures()

  if (features.is_admin) return true

  if (usageType === 'messages') {
    if (features.max_messages_monthly === null) return true // unlimited
    return features.messages_used < features.max_messages_monthly
  }

  if (usageType === 'voice_minutes') {
    if (features.max_voice_minutes_monthly === null) return true // unlimited
    return features.voice_minutes_used < features.max_voice_minutes_monthly
  }

  return false
}

/**
 * Get user's current role
 */
export async function getUserRole(): Promise<'admin' | 'user' | null> {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  return profile?.role as 'admin' | 'user' || 'user'
}

/**
 * Check if current user is admin
 */
export async function isAdmin(): Promise<boolean> {
  const role = await getUserRole()
  return role === 'admin'
}

// ============================================================
// Admin-only functions
// ============================================================

/**
 * Create a subscription for a user (admin only)
 */
export async function createSubscription(
  userId: string,
  planId: string,
  billingCycle: 'monthly' | 'yearly' = 'monthly',
  trialDays: number = 0
): Promise<Subscription | null> {
  const supabase = createAdminClient()

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

  const { data, error } = await supabase
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

  if (error) {
    console.error('Error creating subscription:', error)
    return null
  }

  // Create initial usage record
  await supabase
    .from('subscription_usage')
    .insert({
      subscription_id: data.id,
      period_start: now.toISOString(),
      period_end: periodEnd.toISOString(),
      messages_used: 0,
      voice_minutes_used: 0,
      leads_created: 0,
    })

  return data as Subscription
}

/**
 * Update user role (admin only)
 */
export async function updateUserRole(
  userId: string,
  role: 'admin' | 'user'
): Promise<boolean> {
  const supabase = createAdminClient()

  const { error } = await supabase
    .from('profiles')
    .update({ role })
    .eq('id', userId)

  return !error
}

/**
 * Get all users with their subscriptions (admin only)
 */
export async function getAllUsersWithSubscriptions() {
  const supabase = createAdminClient()

  const { data, error } = await supabase
    .from('profiles')
    .select(`
      *,
      subscription:subscriptions(
        *,
        plan:subscription_plans(*)
      )
    `)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data
}

/**
 * Increment usage for a user (used by webhooks)
 */
export async function incrementUsage(
  userId: string,
  usageType: 'messages' | 'voice_minutes',
  amount: number = 1
): Promise<boolean> {
  const supabase = createAdminClient()

  // Get active subscription
  const { data: subscription } = await supabase
    .from('subscriptions')
    .select('id, current_period_start, current_period_end')
    .eq('user_id', userId)
    .in('status', ['active', 'trial'])
    .single()

  if (!subscription) return false

  // Upsert usage
  const { error } = await supabase
    .from('subscription_usage')
    .upsert({
      subscription_id: subscription.id,
      period_start: subscription.current_period_start,
      period_end: subscription.current_period_end,
      messages_used: usageType === 'messages' ? amount : 0,
      voice_minutes_used: usageType === 'voice_minutes' ? amount : 0,
    }, {
      onConflict: 'subscription_id,period_start',
    })

  if (error) {
    // If upsert with increment fails, try update
    const updateField = usageType === 'messages' ? 'messages_used' : 'voice_minutes_used'
    const { error: updateError } = await supabase.rpc('increment_usage', {
      p_user_id: userId,
      p_usage_type: usageType,
      p_amount: amount,
    })
    return !updateError
  }

  return !error
}

// Helper function
function getDefaultFeatures(): UserPlanFeatures {
  return {
    plan_name: 'none',
    has_messaging: false,
    has_voice: false,
    has_appointments: false,
    has_analytics: false,
    has_priority_support: false,
    max_messages_monthly: 0,
    max_voice_minutes_monthly: 0,
    messages_used: 0,
    voice_minutes_used: 0,
    subscription_status: 'none',
    is_admin: false,
  }
}
