import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import path from 'path'

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Error: NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY is missing in .env.local')
    process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
})

const adminEmail = process.env.ADMIN_EMAIL
const adminPassword = process.env.ADMIN_PASSWORD

if (!adminEmail || !adminPassword) {
    console.error('Error: ADMIN_EMAIL or ADMIN_PASSWORD is missing in .env.local')
    process.exit(1)
}

async function createAdmin() {
    console.log(`Setting up admin user: ${adminEmail}...`)

    // 1. Check if user exists
    const { data: { users }, error: listError } = await supabase.auth.admin.listUsers()

    if (listError) {
        console.error('Error listing users:', listError.message)
        return
    }

    const existingUser = users.find(u => u.email === adminEmail)

    if (existingUser) {
        console.log('User already exists. Updating password...')
        const { error: updateError } = await supabase.auth.admin.updateUserById(
            existingUser.id,
            { password: adminPassword, email_confirm: true }
        )

        if (updateError) {
            console.error('Error updating user:', updateError.message)
        } else {
            console.log('Admin user updated successfully!')
        }
    } else {
        console.log('Creating new admin user...')
        const { error: createError } = await supabase.auth.admin.createUser({
            email: adminEmail,
            password: adminPassword,
            email_confirm: true,
            user_metadata: { role: 'admin' }
        })

        if (createError) {
            console.error('Error creating user:', createError.message)
        } else {
            console.log('Admin user created successfully!')
        }
    }
}

createAdmin()
