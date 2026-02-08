'use client'

import {
  MessageSquare,
  Users,
  TrendingUp,
  AlertCircle,
  Clock,
} from 'lucide-react'

interface SupportMetrics {
  totalQuestions: number
  totalConversations: number
  totalTickets: number
  escalationRate: string
  categoryCounts: Record<string, number>
  commonQuestions: string[]
  recentQuestions: number
}

interface Props {
  metrics: SupportMetrics
}

const CATEGORY_LABELS: Record<string, string> = {
  billing: 'Facturación',
  setup: 'Configuración',
  features: 'Características',
  technical: 'Soporte Técnico',
  general: 'General',
}

export function SupportAnalyticsDashboard({ metrics }: Props) {
  const {
    totalQuestions,
    totalConversations,
    totalTickets,
    escalationRate,
    categoryCounts,
    commonQuestions,
    recentQuestions,
  } = metrics

  return (
    <div className="space-y-6">
      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Questions */}
        <div className="glass-card p-6">
          <div className="flex items-center gap-4">
            <div className="glass-metric-icon">
              <MessageSquare className="h-6 w-6 text-sky-500" />
            </div>
            <div>
              <p className="text-sm text-sky-600">Total Preguntas</p>
              <p className="text-3xl font-bold text-sky-800">
                {totalQuestions.toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        {/* Total Conversations */}
        <div className="glass-card p-6">
          <div className="flex items-center gap-4">
            <div className="glass-metric-icon">
              <Users className="h-6 w-6 text-purple-500" />
            </div>
            <div>
              <p className="text-sm text-sky-600">Conversaciones</p>
              <p className="text-3xl font-bold text-sky-800">
                {totalConversations.toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        {/* Escalation Rate */}
        <div className="glass-card p-6">
          <div className="flex items-center gap-4">
            <div className="glass-metric-icon">
              <AlertCircle className="h-6 w-6 text-amber-500" />
            </div>
            <div>
              <p className="text-sm text-sky-600">Tasa Escalación</p>
              <p className="text-3xl font-bold text-sky-800">{escalationRate}%</p>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="glass-card p-6">
          <div className="flex items-center gap-4">
            <div className="glass-metric-icon">
              <Clock className="h-6 w-6 text-emerald-500" />
            </div>
            <div>
              <p className="text-sm text-sky-600">Últimos 7 días</p>
              <p className="text-3xl font-bold text-sky-800">
                {recentQuestions.toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Category Breakdown */}
      <div className="glass-card p-6">
        <h2 className="text-xl font-semibold text-sky-800 mb-4 flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-sky-500" />
          Preguntas por Categoría
        </h2>
        <div className="space-y-3">
          {Object.entries(categoryCounts).map(([category, count]) => {
            const percentage =
              totalQuestions > 0 ? (count / totalQuestions) * 100 : 0
            return (
              <div key={category}>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm font-medium text-sky-700">
                    {CATEGORY_LABELS[category] || category}
                  </span>
                  <span className="text-sm text-sky-600">
                    {count} ({percentage.toFixed(1)}%)
                  </span>
                </div>
                <div className="h-2 bg-sky-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-sky-400 to-sky-600 rounded-full transition-all duration-300"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Common Questions */}
      <div className="glass-card p-6">
        <h2 className="text-xl font-semibold text-sky-800 mb-4 flex items-center gap-2">
          <MessageSquare className="h-5 w-5 text-sky-500" />
          Preguntas Recientes
        </h2>
        {commonQuestions.length > 0 ? (
          <ul className="space-y-2">
            {commonQuestions.map((question, index) => (
              <li
                key={index}
                className="text-sky-700 text-sm border-l-2 border-sky-300 pl-3 py-1"
              >
                {question}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sky-600 text-sm">
            No hay preguntas registradas aún.
          </p>
        )}
      </div>

      {/* Tickets */}
      <div className="glass-card p-6">
        <h2 className="text-xl font-semibold text-sky-800 mb-2">
          Tickets de Soporte Humano
        </h2>
        <p className="text-sky-600 mb-4">
          Total de escalaciones a soporte humano: <strong>{totalTickets}</strong>
        </p>
        <div className="text-sm text-sky-600">
          Ratio de resolución AI:{' '}
          <strong className="text-sky-800">
            {totalQuestions > 0
              ? ((1 - totalTickets / totalQuestions) * 100).toFixed(1)
              : '100.0'}
            %
          </strong>
        </div>
      </div>
    </div>
  )
}
