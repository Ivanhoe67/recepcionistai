// @ts-nocheck
'use server'

import { createClient } from '@/lib/supabase/server'
import { Business, UpdateTables, InsertTables } from '@/lib/database.types'
import { revalidatePath } from 'next/cache'

export async function getBusiness(): Promise<Business | null> {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('No authenticated user')

    const { data, error } = await supabase
        .from('businesses')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle()

    if (error) {
        console.error('Error fetching business:', error)
        throw error
    }

    return data
}

export async function upsertBusiness(
    updates: Omit<UpdateTables<'businesses'>, 'user_id'>
): Promise<Business> {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('No authenticated user')

    // Check if business exists
    const { data: existingBusiness } = await supabase
        .from('businesses')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle()

    let result

    if (existingBusiness) {
        const { data, error } = await supabase
            .from('businesses')
            .update(updates)
            .eq('id', existingBusiness.id)
            .select()
            .single()

        if (error) throw error
        result = data
    } else {
        const { data, error } = await supabase
            .from('businesses')
            .insert({
                ...updates as InsertTables<'businesses'>,
                user_id: user.id,
            })
            .select()
            .single()

        if (error) throw error
        result = data
    }

    revalidatePath('/settings')
    revalidatePath('/analytics')
    revalidatePath('/dashboard')

    return result
}
