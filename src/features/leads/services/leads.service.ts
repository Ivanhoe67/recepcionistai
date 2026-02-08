// @ts-nocheck
'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { Lead, UpdateTables } from '@/lib/database.types'
import { LeadWithRelations } from '../types'

export async function getLeads(): Promise<Lead[]> {
  const supabase = await createClient()

  // First get the user's business
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('No authenticated user')

  const { data: business } = await supabase
    .from('businesses')
    .select('id')
    .eq('user_id', user.id)
    .single()

  if (!business) {
    return []
  }

  const { data, error } = await supabase
    .from('leads')
    .select('*')
    .eq('business_id', business.id)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data || []
}

export async function getLead(id: string): Promise<LeadWithRelations | null> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('leads')
    .select(`
      *,
      sms_conversations (*),
      call_transcripts (*),
      appointments (*)
    `)
    .eq('id', id)
    .single()

  if (error) {
    if (error.code === 'PGRST116') return null // Not found
    throw error
  }

  return data as LeadWithRelations
}

export async function updateLead(
  id: string,
  updates: UpdateTables<'leads'>
): Promise<Lead> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('leads')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error

  revalidatePath('/leads')
  revalidatePath(`/leads/${id}`)

  return data
}

export async function updateLeadStatus(
  id: string,
  status: Lead['status']
): Promise<void> {
  await updateLead(id, { status })
}

export async function deleteLead(id: string): Promise<void> {
  const supabase = await createClient()

  const { error } = await supabase
    .from('leads')
    .delete()
    .eq('id', id)

  if (error) throw error

  revalidatePath('/leads')
}

export async function getLeadMetrics() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('No authenticated user')

  const { data, error } = await supabase
    .from('lead_metrics')
    .select('*')
    .eq('user_id', user.id)
    .single()

  if (error && error.code !== 'PGRST116') throw error

  return data || {
    total_leads: 0,
    new_leads: 0,
    qualified_leads: 0,
    scheduled_leads: 0,
    converted_leads: 0,
    lost_leads: 0,
    call_leads: 0,
    sms_leads: 0,
    whatsapp_leads: 0,
    leads_last_7_days: 0,
    leads_last_30_days: 0,
  }
}
