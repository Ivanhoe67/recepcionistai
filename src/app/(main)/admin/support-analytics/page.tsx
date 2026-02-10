import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { isAdmin } from '@/features/subscriptions/services/subscription.service'
import { AdminGuard } from '@/features/admin/components/AdminGuard'
import { SupportAnalyticsDashboard } from '@/features/support-chat/components/SupportAnalyticsDashboard'
import { getAllSupportMetrics } from '@/features/support-chat/services/analytics.service'

/**
 * Support Analytics Admin Page
 *
 * Shows metrics about support chat usage:
 * - Total questions
 * - Category breakdown
 * - Escalation rate
 * - Common questions
 */

export default async function SupportAnalyticsPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const adminStatus = await isAdmin()

  if (!adminStatus) {
    return <AdminGuard isAdmin={false}>{null}</AdminGuard>
  }

  // Get all support metrics
  const metrics = await getAllSupportMetrics()

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-sky-800 mb-2">
          Analytics de Soporte AI
        </h1>
        <p className="text-sky-600">
          Métricas y estadísticas del chat de soporte con IA
        </p>
      </div>

      <SupportAnalyticsDashboard metrics={metrics} />
    </div>
  )
}
