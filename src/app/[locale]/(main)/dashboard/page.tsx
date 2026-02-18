import { getLeads, getLeadMetrics } from '@/features/leads/services/leads.service'
import { MetricsCards, RecentLeads } from '@/features/dashboard/components'
import { getTranslations } from 'next-intl/server'

export default async function DashboardPage() {
  const t = await getTranslations('Dashboard')

  const [leads, metrics] = await Promise.all([
    getLeads(),
    getLeadMetrics(),
  ])

  return (
    <div className="space-y-8">
      <div className="animate-fade-in">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-sky-600 to-sky-800 bg-clip-text text-transparent">
          {t('title')}
        </h1>
        <p className="text-sky-600/70 mt-1">
          {t('subtitle')}
        </p>
      </div>

      <MetricsCards metrics={metrics} />

      <RecentLeads leads={leads} />
    </div>
  )
}
