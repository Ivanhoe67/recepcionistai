import { Lead, SmsConversation, CallTranscript, Appointment } from '@/lib/database.types'

export type LeadStatus = Lead['status']
export type LeadSource = Lead['source']
export type LeadUrgency = NonNullable<Lead['urgency']>

export interface LeadWithRelations extends Lead {
  sms_conversations?: SmsConversation[]
  call_transcripts?: CallTranscript[]
  appointments?: Appointment[]
}

export const STATUS_LABELS: Record<LeadStatus, string> = {
  new: 'Nuevo',
  qualified: 'Calificado',
  appointment_scheduled: 'Cita Agendada',
  converted: 'Convertido',
  lost: 'Perdido',
}

export const STATUS_COLORS: Record<LeadStatus, string> = {
  new: 'bg-blue-100 text-blue-800',
  qualified: 'bg-yellow-100 text-yellow-800',
  appointment_scheduled: 'bg-purple-100 text-purple-800',
  converted: 'bg-green-100 text-green-800',
  lost: 'bg-gray-100 text-gray-800',
}

export const SOURCE_LABELS: Record<LeadSource, string> = {
  call: 'Llamada',
  sms: 'SMS',
  whatsapp: 'WhatsApp',
}

export const SOURCE_ICONS: Record<LeadSource, string> = {
  call: 'Phone',
  sms: 'MessageSquare',
  whatsapp: 'MessageCircle',
}

export const URGENCY_LABELS: Record<LeadUrgency, string> = {
  low: 'Baja',
  medium: 'Media',
  high: 'Alta',
  urgent: 'Urgente',
}

export const URGENCY_COLORS: Record<LeadUrgency, string> = {
  low: 'bg-gray-100 text-gray-800',
  medium: 'bg-blue-100 text-blue-800',
  high: 'bg-orange-100 text-orange-800',
  urgent: 'bg-red-100 text-red-800',
}
