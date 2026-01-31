'use client'

import {
  Users,
  UserCheck,
  Calendar,
  TrendingUp,
  Phone,
  MessageSquare,
} from 'lucide-react'

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
  const conversionRate = metrics.total_leads > 0
    ? Math.round((metrics.converted_leads / metrics.total_leads) * 100)
    : 0

  const cards = [
    {
      title: 'Total Leads',
      value: metrics.total_leads,
      description: `${metrics.leads_last_7_days} últimos 7 días`,
      icon: Users,
      gradient: 'from-sky-400 to-sky-600',
    },
    {
      title: 'Nuevos',
      value: metrics.new_leads,
      description: 'Pendientes de calificar',
      icon: Users,
      gradient: 'from-amber-400 to-orange-500',
    },
    {
      title: 'Calificados',
      value: metrics.qualified_leads,
      description: 'Listos para seguimiento',
      icon: UserCheck,
      gradient: 'from-emerald-400 to-green-600',
    },
    {
      title: 'Citas Agendadas',
      value: metrics.scheduled_leads,
      description: 'Pendientes de atender',
      icon: Calendar,
      gradient: 'from-violet-400 to-purple-600',
    },
    {
      title: 'Conversión',
      value: `${conversionRate}%`,
      description: `${metrics.converted_leads} convertidos`,
      icon: TrendingUp,
      gradient: 'from-cyan-400 to-teal-600',
    },
    {
      title: 'Por Canal',
      value: (metrics.call_leads || 0) + (metrics.sms_leads || 0) + (metrics.whatsapp_leads || 0),
      description: `${metrics.call_leads || 0} llamadas, ${(metrics.sms_leads || 0) + (metrics.whatsapp_leads || 0)} mensajes`,
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
