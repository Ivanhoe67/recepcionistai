import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { isAdmin } from '@/features/subscriptions/services/subscription.service'
import { getUserDetails } from '@/features/admin/services/admin.service'
import { AdminGuard } from '@/features/admin/components/AdminGuard'
import { UserDetailView } from '@/features/admin/components/UserDetailView'

export default async function UserDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const adminStatus = await isAdmin()

  if (!adminStatus) {
    return <AdminGuard isAdmin={false}>{null}</AdminGuard>
  }

  const userDetails = await getUserDetails(id)

  return (
    <UserDetailView
      userId={id}
      user={userDetails}
    />
  )
}
