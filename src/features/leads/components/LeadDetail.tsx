'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import {
  Phone,
  MessageSquare,
  Calendar,
  Clock,
  ArrowLeft,
  FileText,
  ChevronDown,
} from 'lucide-react'

import { LeadWithRelations, LeadStatus, STATUS_LABELS, URGENCY_LABELS } from '../types'
import { updateLeadStatus } from '../services/leads.service'
import { SmsMessage } from '@/lib/database.types'

interface LeadDetailProps {
  lead: LeadWithRelations
}

const statusBadgeClasses: Record<string, string> = {
  new: 'glass-badge-sky',
  qualified: 'glass-badge-success',
  appointment_scheduled: 'glass-badge-purple',
  converted: 'glass-badge-success',
  lost: 'glass-badge-danger',
}

export function LeadDetail({ lead }: LeadDetailProps) {
  const router = useRouter()
  const [status, setStatus] = useState(lead.status ?? 'new')
  const [showStatusMenu, setShowStatusMenu] = useState(false)
  const [activeTab, setActiveTab] = useState<'call' | 'sms' | 'appointments'>(
    lead.source === 'call' ? 'call' : 'sms'
  )

  async function handleStatusChange(newStatus: LeadStatus) {
    setStatus(newStatus)
    setShowStatusMenu(false)
    await updateLeadStatus(lead.id, newStatus)
  }

  const smsMessages = lead.sms_conversations?.[0]?.messages as SmsMessage[] | undefined
  const transcript = lead.call_transcripts?.[0]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4 animate-fade-in">
        <button
          onClick={() => router.back()}
          className="glass-button-ghost p-3 rounded-xl"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-sky-600 to-sky-800 bg-clip-text text-transparent">
            {lead.name || 'Lead sin nombre'}
          </h1>
          <p className="text-sky-600/70">{lead.phone}</p>
        </div>
        <div className="relative">
          <button
            onClick={() => setShowStatusMenu(!showStatusMenu)}
            className="glass-button-secondary flex items-center gap-2 px-4 py-2 rounded-xl"
          >
            <span className={`glass-badge ${statusBadgeClasses[status]}`}>
              {STATUS_LABELS[status]}
            </span>
            <ChevronDown className="h-4 w-4" />
          </button>
          {showStatusMenu && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setShowStatusMenu(false)} />
              <div className="absolute right-0 top-full mt-2 z-20 glass-card p-2 min-w-[180px]">
                {Object.entries(STATUS_LABELS).map(([value, label]) => (
                  <button
                    key={value}
                    onClick={() => handleStatusChange(value as LeadStatus)}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                      status === value
                        ? 'bg-glass-sky text-sky-800'
                        : 'text-sky-700 hover:bg-glass-sky'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Info Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        {[
          {
            icon: lead.source === 'call' ? Phone : MessageSquare,
            label: 'Fuente',
            value: lead.source,
            capitalize: true,
          },
          {
            icon: FileText,
            label: 'Tipo de Caso',
            value: lead.case_type || '-',
          },
          {
            icon: Clock,
            label: 'Urgencia',
            value: lead.urgency ? URGENCY_LABELS[lead.urgency] : '-',
          },
          {
            icon: Calendar,
            label: 'Creado',
            value: lead.created_at ? format(new Date(lead.created_at as string), 'dd MMM yyyy', { locale: es }) : '-',
          },
        ].map((card, index) => (
          <div
            key={card.label}
            className={`glass-card p-5 opacity-0 animate-fade-in stagger-${index + 1}`}
          >
            <div className="flex items-center gap-3">
              <div className="glass-metric-icon w-10 h-10">
                <card.icon className="h-5 w-5 text-sky-500" />
              </div>
              <div>
                <p className="text-sm text-sky-600/70">{card.label}</p>
                <p className={`font-medium text-sky-900 ${card.capitalize ? 'capitalize' : ''}`}>
                  {card.value}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="animate-fade-in">
        <div className="glass-tabs inline-flex mb-4">
          <button
            onClick={() => setActiveTab('call')}
            disabled={!transcript}
            className={`glass-tab flex items-center gap-2 ${activeTab === 'call' ? 'active' : ''} ${!transcript ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <Phone className="h-4 w-4" />
            Llamada
          </button>
          <button
            onClick={() => setActiveTab('sms')}
            disabled={!smsMessages?.length}
            className={`glass-tab flex items-center gap-2 ${activeTab === 'sms' ? 'active' : ''} ${!smsMessages?.length ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <MessageSquare className="h-4 w-4" />
            SMS
          </button>
          <button
            onClick={() => setActiveTab('appointments')}
            className={`glass-tab flex items-center gap-2 ${activeTab === 'appointments' ? 'active' : ''}`}
          >
            <Calendar className="h-4 w-4" />
            Citas
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === 'call' && (
          <div className="glass-card p-6">
            {transcript ? (
              <>
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-sky-900">Transcripción de Llamada</h3>
                  {transcript.duration_seconds && (
                    <span className="glass-badge glass-badge-sky">
                      {Math.floor(transcript.duration_seconds / 60)}:
                      {String(transcript.duration_seconds % 60).padStart(2, '0')}
                    </span>
                  )}
                </div>

                {transcript.summary && (
                  <div className="glass-card glass-card-sky p-4 mb-6">
                    <p className="text-sm font-medium text-sky-800">Resumen</p>
                    <p className="mt-1 text-sm text-sky-700">{transcript.summary}</p>
                  </div>
                )}

                <div className="space-y-3">
                  {(transcript.transcript as Array<{ role: string; content: string }>)?.map(
                    (message, index) => (
                      <div
                        key={index}
                        className={`rounded-xl p-4 ${
                          message.role === 'agent'
                            ? 'bg-glass-sky border border-sky-200/50'
                            : 'bg-white/50 border border-white/50'
                        }`}
                      >
                        <p className="text-xs font-medium text-sky-600 mb-1">
                          {message.role === 'agent' ? 'Asistente' : 'Cliente'}
                        </p>
                        <p className="text-sm text-sky-900">{message.content}</p>
                      </div>
                    )
                  )}
                </div>
              </>
            ) : (
              <div className="py-8 text-center text-sky-600/70">
                No hay transcripción de llamada disponible.
              </div>
            )}
          </div>
        )}

        {activeTab === 'sms' && (
          <div className="glass-card p-6">
            {smsMessages?.length ? (
              <>
                <h3 className="text-lg font-semibold text-sky-900 mb-6">Conversación SMS</h3>
                <div className="space-y-3">
                  {smsMessages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.role === 'assistant' ? 'justify-start' : 'justify-end'}`}
                    >
                      <div
                        className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                          message.role === 'assistant'
                            ? 'bg-glass-sky text-sky-900 rounded-bl-md'
                            : 'bg-gradient-to-br from-sky-400 to-sky-500 text-white rounded-br-md'
                        }`}
                      >
                        <p className="text-sm">{message.content}</p>
                        <p
                          className={`mt-1 text-xs ${
                            message.role === 'assistant' ? 'text-sky-600/70' : 'text-sky-100'
                          }`}
                        >
                          {format(new Date(message.timestamp), 'HH:mm', { locale: es })}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="py-8 text-center text-sky-600/70">
                No hay conversaciones SMS.
              </div>
            )}
          </div>
        )}

        {activeTab === 'appointments' && (
          <div className="space-y-4">
            {lead.appointments?.length ? (
              lead.appointments.map((appointment, index) => (
                <div key={appointment.id} className={`glass-card p-5 opacity-0 animate-fade-in stagger-${index + 1}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="glass-metric-icon w-12 h-12 bg-gradient-to-br from-violet-400 to-purple-500">
                        <Calendar className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <p className="font-medium text-sky-900">
                          {format(
                            new Date(appointment.scheduled_at),
                            "EEEE d 'de' MMMM, HH:mm",
                            { locale: es }
                          )}
                        </p>
                        <p className="text-sm text-sky-600/70">
                          {appointment.duration_minutes} minutos
                        </p>
                      </div>
                    </div>
                    <span
                      className={`glass-badge ${
                        appointment.status === 'scheduled'
                          ? 'glass-badge-sky'
                          : appointment.status === 'completed'
                          ? 'glass-badge-success'
                          : appointment.status === 'cancelled'
                          ? 'glass-badge-danger'
                          : 'glass-badge-sky'
                      }`}
                    >
                      {appointment.status}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="glass-card p-6">
                <div className="py-8 text-center text-sky-600/70">
                  No hay citas programadas.
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Notes */}
      {lead.notes && (
        <div className="glass-card p-6 animate-fade-in">
          <h3 className="text-lg font-semibold text-sky-900 mb-4">Notas</h3>
          <p className="text-sm text-sky-700">{lead.notes}</p>
        </div>
      )}
    </div>
  )
}
