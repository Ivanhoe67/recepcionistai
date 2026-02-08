'use client'

import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'
import { Phone, MessageSquare, ArrowRight, Inbox } from 'lucide-react'

import { Lead } from '@/lib/database.types'
import { STATUS_LABELS } from '@/features/leads/types'

interface RecentLeadsProps {
  leads: Lead[]
}

const statusBadgeClasses: Record<string, string> = {
  new: 'glass-badge-sky',
  qualified: 'glass-badge-success',
  appointment_scheduled: 'glass-badge-purple',
  converted: 'glass-badge-success',
  lost: 'glass-badge-danger',
}

export function RecentLeads({ leads }: RecentLeadsProps) {
  if (leads.length === 0) {
    return (
      <div className="glass-card p-6 animate-fade-in">
        <h2 className="text-lg font-semibold text-sky-900 mb-6">Leads Recientes</h2>
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="glass-metric-icon w-16 h-16 mb-4">
            <Inbox className="h-8 w-8 text-sky-400" />
          </div>
          <h3 className="font-medium text-sky-900">No hay leads aún</h3>
          <p className="mt-2 text-sm text-sky-600/70 max-w-xs">
            Los leads aparecerán aquí cuando recibas llamadas o mensajes.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="glass-card p-6 animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-sky-900">Leads Recientes</h2>
        <Link
          href="/leads"
          className="glass-button-ghost flex items-center gap-2 text-sm px-4 py-2 rounded-xl"
        >
          Ver todos
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
      <div className="space-y-3">
        {leads.slice(0, 5).map((lead, index) => (
          <Link
            key={lead.id}
            href={`/leads/${lead.id}`}
            className={`flex items-center justify-between rounded-xl p-4 transition-all hover:bg-glass-sky border border-transparent hover:border-sky-200/50 opacity-0 animate-fade-in stagger-${index + 1}`}
          >
            <div className="flex items-center gap-4">
              <div className="glass-metric-icon w-10 h-10">
                {lead.source === 'call' ? (
                  <Phone className="h-4 w-4 text-sky-500" />
                ) : (
                  <MessageSquare className="h-4 w-4 text-sky-500" />
                )}
              </div>
              <div>
                <p className="font-medium text-sky-900">
                  {lead.name || lead.phone}
                </p>
                <p className="text-sm text-sky-600/70">
                  {lead.case_type || 'Sin tipo de caso'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className={`glass-badge ${statusBadgeClasses[String(lead.status || 'new')] || 'glass-badge-sky'}`}>
                {STATUS_LABELS[String(lead.status || 'new') as keyof typeof STATUS_LABELS]}
              </span>
              <span className="text-sm text-sky-600/60">
                {lead.created_at ? formatDistanceToNow(new Date(lead.created_at as string), {
                  addSuffix: true,
                  locale: es,
                }) : '-'}
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
