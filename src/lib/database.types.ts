export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          phone: string | null
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          phone?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          phone?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      businesses: {
        Row: {
          id: string
          user_id: string
          name: string
          phone: string | null
          timezone: string
          business_hours: Json
          services: Json
          qualification_questions: Json
          assistant_script: string | null
          retell_agent_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          phone?: string | null
          timezone?: string
          business_hours?: Json
          services?: Json
          qualification_questions?: Json
          assistant_script?: string | null
          retell_agent_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          phone?: string | null
          timezone?: string
          business_hours?: Json
          services?: Json
          qualification_questions?: Json
          assistant_script?: string | null
          retell_agent_id?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      leads: {
        Row: {
          id: string
          business_id: string
          name: string | null
          phone: string
          email: string | null
          source: 'call' | 'sms' | 'whatsapp'
          status: 'new' | 'qualified' | 'appointment_scheduled' | 'converted' | 'lost'
          case_type: string | null
          urgency: 'low' | 'medium' | 'high' | 'urgent' | null
          notes: string | null
          retell_call_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          business_id: string
          name?: string | null
          phone: string
          email?: string | null
          source: 'call' | 'sms' | 'whatsapp'
          status?: 'new' | 'qualified' | 'appointment_scheduled' | 'converted' | 'lost'
          case_type?: string | null
          urgency?: 'low' | 'medium' | 'high' | 'urgent' | null
          notes?: string | null
          retell_call_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          business_id?: string
          name?: string | null
          phone?: string
          email?: string | null
          source?: 'call' | 'sms' | 'whatsapp'
          status?: 'new' | 'qualified' | 'appointment_scheduled' | 'converted' | 'lost'
          case_type?: string | null
          urgency?: 'low' | 'medium' | 'high' | 'urgent' | null
          notes?: string | null
          retell_call_id?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      sms_conversations: {
        Row: {
          id: string
          lead_id: string
          messages: Json
          last_message_at: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          lead_id: string
          messages?: Json
          last_message_at?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          lead_id?: string
          messages?: Json
          last_message_at?: string
          created_at?: string
          updated_at?: string
        }
      }
      call_transcripts: {
        Row: {
          id: string
          lead_id: string
          retell_call_id: string
          transcript: Json | null
          summary: string | null
          duration_seconds: number | null
          call_status: string | null
          recording_url: string | null
          created_at: string
        }
        Insert: {
          id?: string
          lead_id: string
          retell_call_id: string
          transcript?: Json | null
          summary?: string | null
          duration_seconds?: number | null
          call_status?: string | null
          recording_url?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          lead_id?: string
          retell_call_id?: string
          transcript?: Json | null
          summary?: string | null
          duration_seconds?: number | null
          call_status?: string | null
          recording_url?: string | null
          created_at?: string
        }
      }
      appointments: {
        Row: {
          id: string
          lead_id: string
          business_id: string
          scheduled_at: string
          duration_minutes: number
          source: 'retell' | 'sms' | 'manual'
          status: 'scheduled' | 'confirmed' | 'completed' | 'cancelled' | 'no_show'
          google_event_id: string | null
          cal_event_id: string | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          lead_id: string
          business_id: string
          scheduled_at: string
          duration_minutes?: number
          source: 'retell' | 'sms' | 'manual'
          status?: 'scheduled' | 'confirmed' | 'completed' | 'cancelled' | 'no_show'
          google_event_id?: string | null
          cal_event_id?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          lead_id?: string
          business_id?: string
          scheduled_at?: string
          duration_minutes?: number
          source?: 'retell' | 'sms' | 'manual'
          status?: 'scheduled' | 'confirmed' | 'completed' | 'cancelled' | 'no_show'
          google_event_id?: string | null
          cal_event_id?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      notifications: {
        Row: {
          id: string
          user_id: string
          lead_id: string | null
          type: 'new_lead' | 'appointment' | 'missed_call' | 'sms_received'
          channel: 'email' | 'sms' | 'push'
          title: string
          body: string | null
          read: boolean
          sent_at: string
          read_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          lead_id?: string | null
          type: 'new_lead' | 'appointment' | 'missed_call' | 'sms_received'
          channel: 'email' | 'sms' | 'push'
          title: string
          body?: string | null
          read?: boolean
          sent_at?: string
          read_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          lead_id?: string | null
          type?: 'new_lead' | 'appointment' | 'missed_call' | 'sms_received'
          channel?: 'email' | 'sms' | 'push'
          title?: string
          body?: string | null
          read?: boolean
          sent_at?: string
          read_at?: string | null
        }
      }
    }
    Views: {
      lead_metrics: {
        Row: {
          business_id: string
          user_id: string
          total_leads: number
          new_leads: number
          qualified_leads: number
          scheduled_leads: number
          converted_leads: number
          lost_leads: number
          call_leads: number
          sms_leads: number
          whatsapp_leads: number
          leads_last_7_days: number
          leads_last_30_days: number
        }
      }
    }
  }
}

// Helper types
export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row']
export type InsertTables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Insert']
export type UpdateTables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Update']

// Convenience types
export type Profile = Tables<'profiles'>
export type Business = Tables<'businesses'>
export type Lead = Tables<'leads'>
export type SmsConversation = Tables<'sms_conversations'>
export type CallTranscript = Tables<'call_transcripts'>
export type Appointment = Tables<'appointments'>
export type Notification = Tables<'notifications'>

// SMS Message type
export interface SmsMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: string
}

// Classification types for analytics
export interface ClassificationFlags {
  urgent?: boolean
  needs_follow_up?: boolean
  potential_high_value?: boolean
  complaint?: boolean
}

export interface Classification {
  intent?: 'consultation' | 'appointment' | 'information' | 'complaint' | 'follow_up'
  sentiment?: 'positive' | 'neutral' | 'negative'
  quality?: 'high' | 'medium' | 'low' | 'spam'
  topics?: string[]
  summary?: string
  flags?: ClassificationFlags
  classified_at?: string
  classified_by?: 'ai' | 'manual'
}

// Analytics types
export interface AnalyticsOverview {
  totalLeads: number
  leadsLast7Days: number
  leadsLast30Days: number
  conversionRate: number
  appointmentCompletionRate: number
}

export interface StatusDistribution {
  new: number
  qualified: number
  scheduled: number
  converted: number
  lost: number
}

export interface SourceDistribution {
  call: number
  sms: number
  whatsapp: number
}

export interface UrgencyDistribution {
  urgent: number
  high: number
  medium: number
  low: number
}

export interface CallMetrics {
  totalCalls: number
  avgDuration: number
  callsWithTranscripts: number
}

export interface AppointmentMetrics {
  total: number
  scheduled: number
  completed: number
  cancelled: number
  noShow: number
  completionRate: number
}

export interface LeadsByDate {
  date: string
  leadCount: number
  callCount: number
  smsCount: number
}

export interface CaseTypeStats {
  caseType: string
  count: number
  percentage: number
}

export interface AnalyticsData {
  overview: AnalyticsOverview
  statusDistribution: StatusDistribution
  sourceDistribution: SourceDistribution
  urgencyDistribution: UrgencyDistribution
  callMetrics: CallMetrics
  appointmentMetrics: AppointmentMetrics
  leadsByDate: LeadsByDate[]
  caseTypeStats: CaseTypeStats[]
}

// Business Hours type
export interface BusinessHours {
  [day: string]: {
    start: string
    end: string
  } | null
}

// Service type
export interface Service {
  id: string
  name: string
  description?: string
  price?: number
}

// Qualification Question type
export interface QualificationQuestion {
  id: string
  question: string
  type: 'text' | 'select' | 'multi_select'
  options?: string[]
  required: boolean
}
