'use client'

import { useEffect, useState } from 'react'
import { useTranslations } from 'next-intl'
import {
  BarChart3,
  TrendingUp,
  Users,
  Phone,
  MessageSquare,
  Calendar,
  Clock,
  AlertTriangle,
  CheckCircle,
  XCircle,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react'

interface Analytics {
  overview: {
    totalLeads: number
    leadsLast7Days: number
    leadsLast30Days: number
    conversionRate: number
    appointmentCompletionRate: number
  }
  statusDistribution: {
    new: number
    qualified: number
    scheduled: number
    converted: number
    lost: number
  }
  sourceDistribution: {
    call: number
    sms: number
    whatsapp: number
  }
  urgencyDistribution: {
    urgent: number
    high: number
    medium: number
    low: number
  }
  callMetrics: {
    totalCalls: number
    avgDuration: number
    callsWithTranscripts: number
  }
  appointmentMetrics: {
    total: number
    scheduled: number
    confirmed: number
    completed: number
    cancelled: number
    noShow: number
    completionRate: number
  }
  leadsByDate: Array<{ date: string; leadCount: number; callCount: number; smsCount: number }>
  caseTypeStats: Array<{ caseType: string; count: number; percentage: number }>
  qualityDistribution: {
    high: number
    medium: number
    low: number
    lost: number
  }
  painPoints: Array<{
    caseType: string
    sessionCount: number
    lostRate: number
    conversionRate: number
    urgentRate: number
  }>
  contentGaps: Array<{
    caseType: string
    sessionCount: number
    lostRate: number
    conversionRate: number
    gapScore: number
    recommendation: 'urgent' | 'recommended' | 'monitor' | 'ok'
  }>
}

export default function AnalyticsPage() {
  const t = useTranslations('Analytics')
  const [analytics, setAnalytics] = useState<Analytics | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchAnalytics()
  }, [])

  async function fetchAnalytics() {
    try {
      setLoading(true)
      setError(null)
      const res = await fetch('/api/analytics')
      if (res.ok) {
        const data = await res.json()
        setAnalytics(data)
      } else {
        const data = await res.json()
        setError(data.error || 'Fallo al cargar las analíticas')
      }
    } catch (error) {
      console.error('Failed to fetch analytics:', error)
      setError('Error de conexión al servidor')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="w-10 h-10 border-3 border-sky-200 border-t-sky-500 rounded-full animate-spin" />
      </div>
    )
  }

  if (error || !analytics) {
    return (
      <div className="glass-card p-12 text-center max-w-lg mx-auto mt-12 animate-fade-in">
        <div className="glass-metric-icon bg-gradient-to-br from-red-400 to-red-500 w-16 h-16 mx-auto mb-6">
          <AlertTriangle className="h-8 w-8 text-white" />
        </div>
        <h2 className="text-xl font-bold text-sky-900 mb-2">
          Error al cargar las analíticas
        </h2>
        <p className="text-sky-600/70 mb-8">
          {error || 'No se pudieron recuperar los datos de analíticas en este momento.'}
        </p>
        <button
          onClick={() => fetchAnalytics()}
          className="glass-button px-8 py-3 bg-sky-500 text-white font-semibold rounded-xl hover:bg-sky-600 transition-colors inline-flex items-center gap-2"
        >
          <BarChart3 className="w-4 h-4" />
          Reintentar
        </button>
      </div>
    )
  }

  const totalQuality =
    analytics.qualityDistribution.high +
    analytics.qualityDistribution.medium +
    analytics.qualityDistribution.low +
    analytics.qualityDistribution.lost

  const totalSource =
    analytics.sourceDistribution.call +
    analytics.sourceDistribution.sms +
    analytics.sourceDistribution.whatsapp

  return (
    <div className="space-y-6 relative z-10">
      {/* Header */}
      <div className="animate-fade-in">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-sky-600 to-sky-800 bg-clip-text text-transparent">
          {t('title')}
        </h1>
        <p className="text-sky-600/70 mt-1">{t('subtitle')}</p>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {[
          {
            label: t('overview.totalLeads'),
            value: analytics.overview.totalLeads,
            icon: Users,
            color: 'from-sky-400 to-sky-500',
          },
          {
            label: t('overview.last7Days'),
            value: analytics.overview.leadsLast7Days,
            icon: TrendingUp,
            color: 'from-emerald-400 to-emerald-500',
          },
          {
            label: t('overview.last30Days'),
            value: analytics.overview.leadsLast30Days,
            icon: BarChart3,
            color: 'from-violet-400 to-violet-500',
          },
          {
            label: t('overview.conversionRate'),
            value: `${analytics.overview.conversionRate}%`,
            icon: CheckCircle,
            color: 'from-green-400 to-green-500',
            isRate: true,
            rate: analytics.overview.conversionRate,
          },
          {
            label: t('overview.appointmentsCompleted'),
            value: `${analytics.overview.appointmentCompletionRate}%`,
            icon: Calendar,
            color: 'from-amber-400 to-amber-500',
            isRate: true,
            rate: analytics.overview.appointmentCompletionRate,
          },
        ].map((card, index) => (
          <div
            key={card.label}
            className={`glass-metric-card opacity-0 animate-fade-in stagger-${index + 1}`}
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-sky-600/70 font-medium">{card.label}</p>
                <p className={`text-2xl font-bold mt-2 ${card.isRate
                  ? card.rate >= 70
                    ? 'text-green-500'
                    : card.rate >= 40
                      ? 'text-amber-500'
                      : 'text-red-500'
                  : 'text-sky-900'
                  }`}>
                  {card.value}
                </p>
              </div>
              <div className={`glass-metric-icon bg-gradient-to-br ${card.color}`}>
                <card.icon className="h-5 w-5 text-white" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Quality Distribution - Donut */}
        <div className="glass-card p-6 animate-fade-in">
          <h3 className="text-lg font-semibold text-sky-900 mb-6">{t('quality.title')}</h3>

          {totalQuality === 0 ? (
            <p className="text-sky-600/60 text-center py-8">{t('noData')}</p>
          ) : (
            <div className="flex items-center gap-8">
              {/* Donut Chart */}
              <div className="relative w-40 h-40 flex-shrink-0">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="12"
                    className="text-sky-100"
                  />
                  {(() => {
                    const segments = [
                      { value: analytics.qualityDistribution.high, color: '#22c55e' },
                      { value: analytics.qualityDistribution.medium, color: '#eab308' },
                      { value: analytics.qualityDistribution.low, color: '#f97316' },
                      { value: analytics.qualityDistribution.lost, color: '#ef4444' },
                    ]
                    let offset = 0
                    const circumference = 2 * Math.PI * 40

                    return segments.map((segment, i) => {
                      const percent = (segment.value / totalQuality) * 100
                      const dashLength = (percent / 100) * circumference
                      const element = (
                        <circle
                          key={i}
                          cx="50"
                          cy="50"
                          r="40"
                          fill="none"
                          stroke={segment.color}
                          strokeWidth="12"
                          strokeDasharray={`${dashLength} ${circumference}`}
                          strokeDashoffset={-offset}
                          className="transition-all duration-700"
                        />
                      )
                      offset += dashLength
                      return element
                    })
                  })()}
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-2xl font-bold text-sky-900">{totalQuality}</span>
                </div>
              </div>

              {/* Legend */}
              <div className="space-y-3 flex-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-green-500" />
                    <span className="text-sm text-sky-700">{t('quality.high')}</span>
                  </div>
                  <span className="text-sm font-medium text-sky-900">{analytics.qualityDistribution.high}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-yellow-500" />
                    <span className="text-sm text-sky-700">{t('quality.medium')}</span>
                  </div>
                  <span className="text-sm font-medium text-sky-900">{analytics.qualityDistribution.medium}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-orange-500" />
                    <span className="text-sm text-sky-700">{t('quality.low')}</span>
                  </div>
                  <span className="text-sm font-medium text-sky-900">{analytics.qualityDistribution.low}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-red-500" />
                    <span className="text-sm text-sky-700">{t('quality.lost')}</span>
                  </div>
                  <span className="text-sm font-medium text-sky-900">{analytics.qualityDistribution.lost}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Source Distribution */}
        <div className="glass-card p-6 animate-fade-in">
          <h3 className="text-lg font-semibold text-sky-900 mb-6">{t('source.title')}</h3>

          {totalSource === 0 ? (
            <p className="text-sky-600/60 text-center py-8">No hay datos todavía</p>
          ) : (
            <div className="space-y-4">
              {[
                { label: t('source.calls'), value: analytics.sourceDistribution.call, icon: Phone, color: 'bg-sky-500' },
                { label: t('source.sms'), value: analytics.sourceDistribution.sms, icon: MessageSquare, color: 'bg-emerald-500' },
                { label: t('source.whatsapp'), value: analytics.sourceDistribution.whatsapp, icon: MessageSquare, color: 'bg-green-500' },
              ].map((source) => {
                const percentage = totalSource > 0 ? Math.round((source.value / totalSource) * 100) : 0
                return (
                  <div key={source.label}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <source.icon className="h-4 w-4 text-sky-500" />
                        <span className="text-sm text-sky-700">{source.label}</span>
                      </div>
                      <span className="text-sm font-medium text-sky-900">
                        {source.value} ({percentage}%)
                      </span>
                    </div>
                    <div className="h-3 bg-sky-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-700 ${source.color}`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* Status Distribution */}
      <div className="glass-card p-6 animate-fade-in">
        <h3 className="text-lg font-semibold text-sky-900 mb-6">{t('status.title')}</h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {[
            { label: t('status.new'), value: analytics.statusDistribution.new, color: 'glass-badge-sky', icon: Users },
            { label: t('status.qualified'), value: analytics.statusDistribution.qualified, color: 'glass-badge-purple', icon: CheckCircle },
            { label: t('status.scheduled'), value: analytics.statusDistribution.scheduled, color: 'glass-badge-warning', icon: Calendar },
            { label: t('status.converted'), value: analytics.statusDistribution.converted, color: 'glass-badge-success', icon: TrendingUp },
            { label: t('status.lost'), value: analytics.statusDistribution.lost, color: 'glass-badge-danger', icon: XCircle },
          ].map((status) => (
            <div key={status.label} className="glass-card glass-card-light p-4 text-center">
              <status.icon className="h-6 w-6 text-sky-500 mx-auto mb-2" />
              <p className="text-2xl font-bold text-sky-900">{status.value}</p>
              <p className="text-xs text-sky-600/70 mt-1">{status.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Call & Appointment Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Call Metrics */}
        <div className="glass-card p-6 animate-fade-in">
          <div className="flex items-center gap-3 mb-6">
            <div className="glass-metric-icon bg-gradient-to-br from-sky-400 to-sky-500">
              <Phone className="h-5 w-5 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-sky-900">{t('calls.title')}</h3>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <p className="text-3xl font-bold text-sky-900">{analytics.callMetrics.totalCalls}</p>
              <p className="text-xs text-sky-600/70 mt-1">{t('calls.total')}</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-sky-900">
                {Math.floor(analytics.callMetrics.avgDuration / 60)}:{String(analytics.callMetrics.avgDuration % 60).padStart(2, '0')}
              </p>
              <p className="text-xs text-sky-600/70 mt-1">{t('calls.avgDuration')}</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-sky-900">{analytics.callMetrics.callsWithTranscripts}</p>
              <p className="text-xs text-sky-600/70 mt-1">{t('calls.transcripts')}</p>
            </div>
          </div>
        </div>

        {/* Appointment Metrics */}
        <div className="glass-card p-6 animate-fade-in">
          <div className="flex items-center gap-3 mb-6">
            <div className="glass-metric-icon bg-gradient-to-br from-violet-400 to-violet-500">
              <Calendar className="h-5 w-5 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-sky-900">{t('appointments.title')}</h3>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-sky-900">{analytics.appointmentMetrics.total}</p>
              <p className="text-xs text-sky-600/70">{t('appointments.total')}</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-green-500">{analytics.appointmentMetrics.completed}</p>
              <p className="text-xs text-sky-600/70">{t('appointments.completed')}</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-red-500">{analytics.appointmentMetrics.cancelled}</p>
              <p className="text-xs text-sky-600/70">{t('appointments.cancelled')}</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-amber-500">{analytics.appointmentMetrics.noShow}</p>
              <p className="text-xs text-sky-600/70">{t('appointments.noShow')}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Case Type Distribution */}
      {analytics.caseTypeStats.length > 0 && (
        <div className="glass-card p-6 animate-fade-in">
          <h3 className="text-lg font-semibold text-sky-900 mb-6">Distribución por Tipo de Caso</h3>
          <div className="space-y-4">
            {analytics.caseTypeStats.map((ct, i) => (
              <div key={ct.caseType}>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-sky-700 font-medium">{ct.caseType}</span>
                  <span className="text-sky-600/70">
                    {ct.count} ({ct.percentage}%)
                  </span>
                </div>
                <div className="h-3 bg-sky-100 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{
                      width: `${ct.percentage}%`,
                      backgroundColor: `hsl(${200 - i * 25}, 80%, 55%)`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Pain Points Table */}
      {analytics.painPoints.length > 0 && (
        <div className="glass-card p-6 animate-fade-in">
          <h3 className="text-lg font-semibold text-sky-900 mb-2">{t('caseType.title')}</h3>
          <p className="text-sm text-sky-600/70 mb-6">{t('caseType.subtitle')}</p>

          <div className="overflow-x-auto">
            <table className="glass-table">
              <thead>
                <tr>
                  <th>{t('caseType.table.type')}</th>
                  <th>{t('caseType.table.leads')}</th>
                  <th>{t('caseType.table.lostRate')}</th>
                  <th>{t('caseType.table.conversionRate')}</th>
                  <th>{t('caseType.table.urgentRate')}</th>
                </tr>
              </thead>
              <tbody>
                {analytics.painPoints.map((pp) => (
                  <tr key={pp.caseType}>
                    <td className="font-medium">{pp.caseType}</td>
                    <td>{pp.sessionCount}</td>
                    <td>
                      <span className={`${pp.lostRate >= 50 ? 'text-red-500' :
                        pp.lostRate >= 25 ? 'text-orange-500' :
                          'text-green-500'
                        } font-medium`}>
                        {pp.lostRate}%
                      </span>
                    </td>
                    <td>
                      <span className={`${pp.conversionRate >= 50 ? 'text-green-500' :
                        pp.conversionRate >= 25 ? 'text-yellow-500' :
                          'text-red-500'
                        } font-medium`}>
                        {pp.conversionRate}%
                      </span>
                    </td>
                    <td>
                      <span className={`${pp.urgentRate >= 50 ? 'text-red-500' :
                        pp.urgentRate >= 25 ? 'text-orange-500' :
                          'text-sky-600'
                        }`}>
                        {pp.urgentRate}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Content Gaps / Recommendations */}
      {analytics.contentGaps.length > 0 && (
        <div className="glass-card p-6 animate-fade-in">
          <h3 className="text-lg font-semibold text-sky-900 mb-2">{t('contentGaps.title')}</h3>
          <p className="text-sm text-sky-600/70 mb-6">
            {t('contentGaps.subtitle')}
          </p>

          <div className="space-y-3">
            {analytics.contentGaps.map((gap) => (
              <div
                key={gap.caseType}
                className="flex items-center justify-between p-4 glass-card glass-card-light"
              >
                <div className="flex items-center gap-4">
                  <RecommendationBadge recommendation={gap.recommendation} />
                  <div>
                    <p className="font-medium text-sky-900">{gap.caseType}</p>
                    <p className="text-sm text-sky-600/70">
                      {gap.sessionCount} {t('contentGaps.leads')} · {gap.lostRate}% {t('contentGaps.lost')} · {gap.conversionRate}% {t('contentGaps.converted')}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs text-sky-600/70">{t('contentGaps.scoreLabel')}</p>
                  <p className="text-xl font-bold text-sky-900">{gap.gapScore}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 p-4 glass-card glass-card-sky">
            <p className="text-sm font-medium text-sky-800 mb-1">{t('contentGaps.explanationTitle')}</p>
            <p className="text-xs text-sky-700">
              {t('contentGaps.explanationDesc')}
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

function RecommendationBadge({
  recommendation,
}: {
  recommendation: 'urgent' | 'recommended' | 'monitor' | 'ok'
}) {
  const t = useTranslations('Analytics.recommendations')
  const config = {
    urgent: { bg: 'bg-red-500', text: t('urgent') },
    recommended: { bg: 'bg-orange-500', text: t('recommended') },
    monitor: { bg: 'bg-yellow-500', text: t('monitor') },
    ok: { bg: 'bg-green-500', text: t('ok') },
  }

  const { bg, text } = config[recommendation]

  return (
    <span className={`px-3 py-1 text-xs font-bold rounded-full ${bg} text-white`}>
      {text}
    </span>
  )
}
