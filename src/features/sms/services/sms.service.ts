'use server'
// @ts-nocheck

import { createClient } from '@/lib/supabase/server'
import { SmsConversation } from '@/lib/database.types'

export type SmsWithLead = SmsConversation & {
    leads: {
        name: string | null
        phone: string
    }
}

export async function getSmsConversations(): Promise<SmsWithLead[]> {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('No authenticated user')

    const { data, error } = await supabase
        .from('sms_conversations')
        .select(`
      *,
      leads!inner (
        name,
        phone,
        business_id
      )
    `)
        .eq('leads.business_id', (
            await supabase
                .from('businesses')
                .select('id')
                .eq('user_id', user.id)
                .single()
        ).data?.id)
        .order('last_message_at', { ascending: false })

    if (error) throw error
    return data as unknown as SmsWithLead[]
}
