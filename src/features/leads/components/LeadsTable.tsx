'use client'

import { Link } from '@/lib/navigation'
import { Lead } from '@/lib/database.types'
import { formatDistanceToNow } from 'date-fns'
import { es, enUS } from 'date-fns/locale'
import { useState } from 'react'
import { Phone, MessageSquare, MoreHorizontal, Inbox, Eye, CheckCircle, XCircle, Trash2 } from 'lucide-react'
import { useTranslations, useLocale } from 'next-intl'

import {
  LeadStatus,
} from '../types'
import { updateLeadStatus, deleteLead } from '../services/leads.service'

interface LeadsTableProps {
  leads: Lead[]
}

const statusBadgeClasses: Record<string, string> = {
  new: 'glass-badge-sky',
  qualified: 'glass-badge-success',
  appointment_scheduled: 'glass-badge-purple',
  converted: 'glass-badge-success',
  lost: 'glass-badge-danger',
}

const urgencyBadgeClasses: Record<string, string> = {
  low: 'glass-badge-sky',
  medium: 'glass-badge-warning',
  high: 'glass-badge-danger',
  urgent: 'glass-badge-danger',
}

export function LeadsTable({ leads }: LeadsTableProps) {
  const t = useTranslations('Leads')
  const tDashboard = useTranslations('Dashboard.recentLeads')
  const locale = useLocale()
  const dateLocale = locale === 'es' ? es : enUS

  const [openMenu, setOpenMenu] = useState<string | null>(null)

  if (leads.length === 0) {
    return (
      <div className="glass-card p-12 animate-fade-in">
        <div className="flex flex-col items-center justify-center text-center">
          <div className="glass-metric-icon w-16 h-16 mb-4">
            <Inbox className="h-8 w-8 text-sky-400" />
          </div>
          <h3 className="text-lg font-semibold text-sky-900">{tDashboard('empty')}</h3>
          <p className="mt-2 text-sm text-sky-600/70 max-w-sm">
            {tDashboard('emptyDesc')}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="glass-card overflow-hidden animate-fade-in">
      <div className="overflow-x-auto">
        <table className="glass-table">
          <thead>
            <tr>
              <th>{t('table.contact')}</th>
              <th>{t('table.source')}</th>
              <th>{t('table.caseType')}</th>
              <th>{t('table.urgency')}</th>
              <th>{t('table.status')}</th>
              <th>{t('table.date')}</th>
              <th className="w-[50px]"></th>
            </tr>
          </thead>
          <tbody>
            {leads.map((lead, index) => (
              <tr key={lead.id} className={`opacity-0 animate-fade-in stagger-${Math.min(index + 1, 6)}`}>
                <td>
                  <Link
                    href={`/leads/${lead.id}`}
                    className="block hover:text-sky-600 transition-colors"
                  >
                    <div className="font-medium text-sky-900">
                      {lead.name || t('table.noName')}
                    </div>
                    <div className="text-sm text-sky-600/60">{lead.phone}</div>
                    {lead.email && (
                      <div className="text-xs text-sky-500/50">{lead.email}</div>
                    )}
                  </Link>
                </td>
                <td>
                  <div className="flex items-center gap-2">
                    <div className="glass-metric-icon w-8 h-8">
                      {lead.source === 'call' ? (
                        <Phone className="h-4 w-4 text-sky-500" />
                      ) : (
                        <MessageSquare className="h-4 w-4 text-sky-500" />
                      )}
                    </div>
                    <span className="capitalize text-sky-700">{t(`source.${lead.source}`)}</span>
                  </div>
                </td>
                <td className="text-sky-800">
                  {lead.case_type || (
                    <span className="text-sky-400">-</span>
                  )}
                </td>
                <td>
                  {lead.urgency ? (
                    <span className={`glass-badge ${urgencyBadgeClasses[lead.urgency]}`}>
                      {t(`urgency.${lead.urgency}`)}
                    </span>
                  ) : (
                    <span className="text-sky-400">-</span>
                  )}
                </td>
                <td>
                  <span className={`glass-badge ${statusBadgeClasses[(lead.status ?? 'new') as LeadStatus]}`}>
                    {t(`status.${(lead.status ?? 'new') as LeadStatus}`)}
                  </span>
                </td>
                <td className="text-sky-600/60">
                  {lead.created_at ? formatDistanceToNow(new Date(lead.created_at as string), {
                    addSuffix: true,
                    locale: dateLocale,
                  }) : '-'}
                </td>
                <td>
                  <div className="relative">
                    <button
                      onClick={() => setOpenMenu(openMenu === lead.id ? null : lead.id)}
                      className="glass-button-ghost p-2 rounded-lg"
                    >
                      <MoreHorizontal className="h-4 w-4" />
                    </button>
                    {openMenu === lead.id && (
                      <>
                        <div
                          className="fixed inset-0 z-10"
                          onClick={() => setOpenMenu(null)}
                        />
                        <div className="absolute right-0 top-full mt-1 z-20 glass-card p-2 min-w-[180px] shadow-glass-lg">
                          <Link
                            href={`/leads/${lead.id}`}
                            className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-sky-700 hover:bg-glass-sky transition-colors"
                            onClick={() => setOpenMenu(null)}
                          >
                            <Eye className="h-4 w-4" />
                            {t('table.actions.viewDetails')}
                          </Link>
                          <button
                            onClick={() => {
                              updateLeadStatus(lead.id, 'qualified')
                              setOpenMenu(null)
                            }}
                            className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-sm text-sky-700 hover:bg-glass-sky transition-colors"
                          >
                            <CheckCircle className="h-4 w-4" />
                            {t('table.actions.markQualified')}
                          </button>
                          <button
                            onClick={() => {
                              updateLeadStatus(lead.id, 'converted')
                              setOpenMenu(null)
                            }}
                            className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-sm text-emerald-600 hover:bg-glass-sky transition-colors"
                          >
                            <CheckCircle className="h-4 w-4" />
                            {t('table.actions.markConverted')}
                          </button>
                          <button
                            onClick={() => {
                              updateLeadStatus(lead.id, 'lost')
                              setOpenMenu(null)
                            }}
                            className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-sm text-red-500 hover:bg-red-50 transition-colors"
                          >
                            <XCircle className="h-4 w-4" />
                            {t('table.actions.markLost')}
                          </button>
                          <hr className="my-2 border-sky-200/50" />
                          <button
                            onClick={() => {
                              deleteLead(lead.id)
                              setOpenMenu(null)
                            }}
                            className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-sm text-red-500 hover:bg-red-50 transition-colors"
                          >
                            <Trash2 className="h-4 w-4" />
                            {t('table.actions.delete')}
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
