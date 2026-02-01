import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { isAdmin, getSubscriptionPlans } from '@/features/subscriptions/services/subscription.service'
import { getAllUsers, getAdminStats } from '@/features/admin/services/admin.service'
import { AdminGuard } from '@/features/admin/components/AdminGuard'
import { AdminDashboard } from '@/features/admin/components/AdminDashboard'

export default async function AdminPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const adminStatus = await isAdmin()

  if (!adminStatus) {
    return <AdminGuard isAdmin={false}>{null}</AdminGuard>
  }

  const [users, plans, stats] = await Promise.all([
    getAllUsers(),
    getSubscriptionPlans(),
    getAdminStats(),
  ])

  return (
    <AdminDashboard
      users={users}
      plans={plans}
      stats={stats}
    />
  )
}
