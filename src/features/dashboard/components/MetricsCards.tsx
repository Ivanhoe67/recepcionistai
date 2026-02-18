'use client'

import {
  Users,
  UserCheck,
  Calendar,
  TrendingUp,
  Phone,
} from 'lucide-react'
import { useTranslations } from 'next-intl'

interface Metrics {
  total_leads: number
  new_leads: number
  qualified_leads: number
  scheduled_leads: number
  converted_leads: number
  lost_leads: number
  call_leads: number
  sms_leads: number
  whatsapp_leads?: number
  leads_last_7_days: number
  leads_last_30_days: number
}

interface MetricsCardsProps {
  metrics: Metrics
}

export function MetricsCards({ metrics }: MetricsCardsProps) {
  const t = useTranslations('Dashboard.metrics')

  const conversionRate = metrics.total_leads > 0
    ? Math.round((metrics.converted_leads / metrics.total_leads) * 100)
    : 0

  const cards = [
    {
      title: t('total_leads'),
      value: metrics.total_leads,
      description: t('last7Days', { count: metrics.leads_last_7_days }),
      icon: Users,
      gradient: 'from-sky-400 to-sky-600',
    },
    {
      title: t('new'),
      value: metrics.new_leads,
      description: t('pendingQualification'),
      icon: Users,
      gradient: 'from-amber-400 to-orange-500',
    },
    {
      title: t('qualified'),
      value: metrics.qualified_leads,
      description: t('readyForFollowup'),
      icon: UserCheck,
      gradient: 'from-emerald-400 to-green-600',
    },
    {
      title: t('appointments'),
      value: metrics.scheduled_leads,
      description: t('pendingAttendance'),
      icon: Calendar,
      gradient: 'from-violet-400 to-purple-600',
    },
    {
      title: t('conversion'),
      value: `${conversionRate}%`,
      description: t('convertedCount', { count: metrics.converted_leads }),
      icon: TrendingUp,
      gradient: 'from-cyan-400 to-teal-600',
    },
    {
      title: t('byChannel'),
      value: (metrics.call_leads || 0) + (metrics.sms_leads || 0) + (metrics.whatsapp_leads || 0),
      description: t('callsMessages', {
        calls: metrics.call_leads || 0,
        messages: (metrics.sms_leads || 0) + (metrics.whatsapp_leads || 0)
      }),
      icon: Phone,
      gradient: 'from-indigo-400 to-blue-600',
    },
  ]

  return (
    <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
      {cards.map((card, index) => (
        <div
          key={card.title}
          className={`glass-metric-card opacity-0 animate-fade-in stagger-${index + 1}`}
        >
          <div className="flex items-start justify-between">
            <div className="space-y-3">
              <p className="text-sm font-medium text-sky-700/80">
                {card.title}
              </p>
              <p className="text-3xl font-bold text-sky-900">
                {card.value}
              </p>
              <p className="text-sm text-sky-600/70">
                {card.description}
              </p>
            </div>
            <div className={`glass-metric-icon bg-gradient-to-br ${card.gradient}`}>
              <card.icon className="h-5 w-5 text-white" />
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
