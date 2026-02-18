import { getLeads } from '@/features/leads/services/leads.service'
import { LeadsTable } from '@/features/leads/components/LeadsTable'
import { Users } from 'lucide-react'
import { getTranslations } from 'next-intl/server'

export default async function LeadsPage() {
  const t = await getTranslations('Leads')
  const leads = await getLeads()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between animate-fade-in">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-sky-600 to-sky-800 bg-clip-text text-transparent">
            {t('title')}
          </h1>
          <p className="text-sky-600/70 mt-1">
            {t(leads.length === 1 ? 'total_lead' : 'total_leads', { count: leads.length })}
          </p>
        </div>
        <div className="glass-metric-icon">
          <Users className="h-5 w-5 text-sky-500" />
        </div>
      </div>

      <LeadsTable leads={leads} />
    </div>
  )
}
