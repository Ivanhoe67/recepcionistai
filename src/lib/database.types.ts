export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      appointments: {
        Row: {
          business_id: string
          cal_event_id: string | null
          created_at: string | null
          duration_minutes: number | null
          google_event_id: string | null
          id: string
          lead_id: string
          notes: string | null
          scheduled_at: string
          source: string
          status: string | null
          updated_at: string | null
        }
        Insert: {
          business_id: string
          cal_event_id?: string | null
          created_at?: string | null
          duration_minutes?: number | null
          google_event_id?: string | null
          id?: string
          lead_id: string
          notes?: string | null
          scheduled_at: string
          source: string
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          business_id?: string
          cal_event_id?: string | null
          created_at?: string | null
          duration_minutes?: number | null
          google_event_id?: string | null
          id?: string
          lead_id?: string
          notes?: string | null
          scheduled_at?: string
          source?: string
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "appointments_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "analytics_summary"
            referencedColumns: ["business_id"]
          },
          {
            foreignKeyName: "appointments_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointments_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "lead_metrics"
            referencedColumns: ["business_id"]
          },
          {
            foreignKeyName: "appointments_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
        ]
      }
      businesses: {
        Row: {
          assistant_script: string | null
          business_hours: Json | null
          created_at: string | null
          id: string
          name: string
          phone: string | null
          qualification_questions: Json | null
          retell_agent_id: string | null
          services: Json | null
          timezone: string | null
          updated_at: string | null
          user_id: string
          whatsapp_phone: string | null
        }
        Insert: {
          assistant_script?: string | null
          business_hours?: Json | null
          created_at?: string | null
          id?: string
          name: string
          phone?: string | null
          qualification_questions?: Json | null
          retell_agent_id?: string | null
          services?: Json | null
          timezone?: string | null
          updated_at?: string | null
          user_id: string
          whatsapp_phone?: string | null
        }
        Update: {
          assistant_script?: string | null
          business_hours?: Json | null
          created_at?: string | null
          id?: string
          name?: string
          phone?: string | null
          qualification_questions?: Json | null
          retell_agent_id?: string | null
          services?: Json | null
          timezone?: string | null
          updated_at?: string | null
          user_id?: string
          whatsapp_phone?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "businesses_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "admin_users_overview"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "businesses_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      call_transcripts: {
        Row: {
          call_status: string | null
          classification: Json | null
          created_at: string | null
          duration_seconds: number | null
          id: string
          lead_id: string
          recording_url: string | null
          retell_call_id: string
          sentiment_score: number | null
          summary: string | null
          transcript: Json | null
        }
        Insert: {
          call_status?: string | null
          classification?: Json | null
          created_at?: string | null
          duration_seconds?: number | null
          id?: string
          lead_id: string
          recording_url?: string | null
          retell_call_id: string
          sentiment_score?: number | null
          summary?: string | null
          transcript?: Json | null
        }
        Update: {
          call_status?: string | null
          classification?: Json | null
          created_at?: string | null
          duration_seconds?: number | null
          id?: string
          lead_id?: string
          recording_url?: string | null
          retell_call_id?: string
          sentiment_score?: number | null
          summary?: string | null
          transcript?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "call_transcripts_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
        ]
      }
      leads: {
        Row: {
          business_id: string
          case_type: string | null
          classification: Json | null
          created_at: string | null
          email: string | null
          first_response_seconds: number | null
          id: string
          name: string | null
          notes: string | null
          phone: string
          retell_call_id: string | null
          source: string
          status: string | null
          updated_at: string | null
          urgency: string | null
        }
        Insert: {
          business_id: string
          case_type?: string | null
          classification?: Json | null
          created_at?: string | null
          email?: string | null
          first_response_seconds?: number | null
          id?: string
          name?: string | null
          notes?: string | null
          phone: string
          retell_call_id?: string | null
          source: string
          status?: string | null
          updated_at?: string | null
          urgency?: string | null
        }
        Update: {
          business_id?: string
          case_type?: string | null
          classification?: Json | null
          created_at?: string | null
          email?: string | null
          first_response_seconds?: number | null
          id?: string
          name?: string | null
          notes?: string | null
          phone?: string
          retell_call_id?: string | null
          source?: string
          status?: string | null
          updated_at?: string | null
          urgency?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "leads_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "analytics_summary"
            referencedColumns: ["business_id"]
          },
          {
            foreignKeyName: "leads_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "leads_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "lead_metrics"
            referencedColumns: ["business_id"]
          },
        ]
      }
      notifications: {
        Row: {
          body: string | null
          channel: string
          id: string
          lead_id: string | null
          read: boolean | null
          read_at: string | null
          sent_at: string | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          body?: string | null
          channel: string
          id?: string
          lead_id?: string | null
          read?: boolean | null
          read_at?: string | null
          sent_at?: string | null
          title: string
          type: string
          user_id: string
        }
        Update: {
          body?: string | null
          channel?: string
          id?: string
          lead_id?: string | null
          read?: boolean | null
          read_at?: string | null
          sent_at?: string | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "admin_users_overview"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          email: string
          full_name: string | null
          id: string
          phone: string | null
          role: string | null
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          email: string
          full_name?: string | null
          id: string
          phone?: string | null
          role?: string | null
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          email?: string
          full_name?: string | null
          id?: string
          phone?: string | null
          role?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      sms_conversations: {
        Row: {
          classification: Json | null
          created_at: string | null
          id: string
          last_message_at: string | null
          lead_id: string
          messages: Json | null
          updated_at: string | null
        }
        Insert: {
          classification?: Json | null
          created_at?: string | null
          id?: string
          last_message_at?: string | null
          lead_id: string
          messages?: Json | null
          updated_at?: string | null
        }
        Update: {
          classification?: Json | null
          created_at?: string | null
          id?: string
          last_message_at?: string | null
          lead_id?: string
          messages?: Json | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "sms_conversations_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
        ]
      }
      subscription_plans: {
        Row: {
          created_at: string | null
          currency: string | null
          description: string | null
          display_name: string
          has_analytics: boolean | null
          has_api_access: boolean | null
          has_appointments: boolean | null
          has_messaging: boolean | null
          has_priority_support: boolean | null
          has_voice: boolean | null
          has_white_label: boolean | null
          id: string
          is_active: boolean | null
          max_businesses: number | null
          max_leads_monthly: number | null
          max_messages_monthly: number | null
          max_voice_minutes_monthly: number | null
          name: string
          overage_per_message_cents: number | null
          overage_per_minute_cents: number | null
          price_monthly: number | null
          price_yearly: number | null
          sort_order: number | null
          stripe_price_id_monthly: string | null
          stripe_price_id_yearly: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          currency?: string | null
          description?: string | null
          display_name: string
          has_analytics?: boolean | null
          has_api_access?: boolean | null
          has_appointments?: boolean | null
          has_messaging?: boolean | null
          has_priority_support?: boolean | null
          has_voice?: boolean | null
          has_white_label?: boolean | null
          id?: string
          is_active?: boolean | null
          max_businesses?: number | null
          max_leads_monthly?: number | null
          max_messages_monthly?: number | null
          max_voice_minutes_monthly?: number | null
          name: string
          overage_per_message_cents?: number | null
          overage_per_minute_cents?: number | null
          price_monthly?: number | null
          price_yearly?: number | null
          sort_order?: number | null
          stripe_price_id_monthly?: string | null
          stripe_price_id_yearly?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          currency?: string | null
          description?: string | null
          display_name?: string
          has_analytics?: boolean | null
          has_api_access?: boolean | null
          has_appointments?: boolean | null
          has_messaging?: boolean | null
          has_priority_support?: boolean | null
          has_voice?: boolean | null
          has_white_label?: boolean | null
          id?: string
          is_active?: boolean | null
          max_businesses?: number | null
          max_leads_monthly?: number | null
          max_messages_monthly?: number | null
          max_voice_minutes_monthly?: number | null
          name?: string
          overage_per_message_cents?: number | null
          overage_per_minute_cents?: number | null
          price_monthly?: number | null
          price_yearly?: number | null
          sort_order?: number | null
          stripe_price_id_monthly?: string | null
          stripe_price_id_yearly?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      subscription_usage: {
        Row: {
          created_at: string | null
          id: string
          leads_created: number | null
          messages_used: number | null
          period_end: string
          period_start: string
          subscription_id: string
          updated_at: string | null
          voice_minutes_used: number | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          leads_created?: number | null
          messages_used?: number | null
          period_end: string
          period_start: string
          subscription_id: string
          updated_at?: string | null
          voice_minutes_used?: number | null
        }
        Update: {
          created_at?: string | null
          id?: string
          leads_created?: number | null
          messages_used?: number | null
          period_end?: string
          period_start?: string
          subscription_id?: string
          updated_at?: string | null
          voice_minutes_used?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "subscription_usage_subscription_id_fkey"
            columns: ["subscription_id"]
            isOneToOne: false
            referencedRelation: "subscriptions"
            referencedColumns: ["id"]
          },
        ]
      }
      subscriptions: {
        Row: {
          billing_cycle: string | null
          cancel_reason: string | null
          cancelled_at: string | null
          created_at: string | null
          current_period_end: string | null
          current_period_start: string | null
          id: string
          plan_id: string
          status: string | null
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          trial_ends_at: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          billing_cycle?: string | null
          cancel_reason?: string | null
          cancelled_at?: string | null
          created_at?: string | null
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          plan_id: string
          status?: string | null
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          trial_ends_at?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          billing_cycle?: string | null
          cancel_reason?: string | null
          cancelled_at?: string | null
          created_at?: string | null
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          plan_id?: string
          status?: string | null
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          trial_ends_at?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "subscriptions_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "subscription_plans"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "subscriptions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "admin_users_overview"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "subscriptions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      support_analytics: {
        Row: {
          conversation_id: string | null
          created_at: string | null
          id: string
          question_category: string | null
          question_summary: string | null
          response_time_seconds: number | null
          satisfaction_rating: number | null
          user_id: string | null
          was_answered: boolean | null
          was_escalated: boolean | null
        }
        Insert: {
          conversation_id?: string | null
          created_at?: string | null
          id?: string
          question_category?: string | null
          question_summary?: string | null
          response_time_seconds?: number | null
          satisfaction_rating?: number | null
          user_id?: string | null
          was_answered?: boolean | null
          was_escalated?: boolean | null
        }
        Update: {
          conversation_id?: string | null
          created_at?: string | null
          id?: string
          question_category?: string | null
          question_summary?: string | null
          response_time_seconds?: number | null
          satisfaction_rating?: number | null
          user_id?: string | null
          was_answered?: boolean | null
          was_escalated?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "support_analytics_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "support_conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      support_conversations: {
        Row: {
          created_at: string | null
          id: string
          last_message_at: string | null
          messages: Json | null
          status: string | null
          title: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          last_message_at?: string | null
          messages?: Json | null
          status?: string | null
          title?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          last_message_at?: string | null
          messages?: Json | null
          status?: string | null
          title?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      support_embeddings: {
        Row: {
          content: string
          created_at: string | null
          embedding: string | null
          id: string
          resource_id: string | null
        }
        Insert: {
          content: string
          created_at?: string | null
          embedding?: string | null
          id?: string
          resource_id?: string | null
        }
        Update: {
          content?: string
          created_at?: string | null
          embedding?: string | null
          id?: string
          resource_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "support_embeddings_resource_id_fkey"
            columns: ["resource_id"]
            isOneToOne: false
            referencedRelation: "support_resources"
            referencedColumns: ["id"]
          },
        ]
      }
      support_resources: {
        Row: {
          content: string
          created_at: string | null
          id: string
          metadata: Json | null
          updated_at: string | null
        }
        Insert: {
          content: string
          created_at?: string | null
          id?: string
          metadata?: Json | null
          updated_at?: string | null
        }
        Update: {
          content?: string
          created_at?: string | null
          id?: string
          metadata?: Json | null
          updated_at?: string | null
        }
        Relationships: []
      }
      support_tickets: {
        Row: {
          assigned_to: string | null
          conversation_id: string | null
          created_at: string | null
          description: string | null
          id: string
          priority: string | null
          resolved_at: string | null
          status: string | null
          subject: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          assigned_to?: string | null
          conversation_id?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          priority?: string | null
          resolved_at?: string | null
          status?: string | null
          subject: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          assigned_to?: string | null
          conversation_id?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          priority?: string | null
          resolved_at?: string | null
          status?: string | null
          subject?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "support_tickets_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "support_conversations"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      admin_users_overview: {
        Row: {
          business_count: number | null
          current_period_end: string | null
          email: string | null
          full_name: string | null
          messages_used: number | null
          plan_display_name: string | null
          plan_name: string | null
          role: string | null
          subscription_status: string | null
          total_leads: number | null
          user_created_at: string | null
          user_id: string | null
          voice_minutes_used: number | null
        }
        Relationships: []
      }
      analytics_summary: {
        Row: {
          appointment_completion_rate: number | null
          avg_call_duration: number | null
          business_id: string | null
          call_leads: number | null
          cancelled_appointments: number | null
          completed_appointments: number | null
          conversion_rate: number | null
          converted_leads: number | null
          high_urgency_leads: number | null
          leads_last_30_days: number | null
          leads_last_7_days: number | null
          lost_leads: number | null
          low_urgency_leads: number | null
          medium_urgency_leads: number | null
          new_leads: number | null
          no_show_appointments: number | null
          qualified_leads: number | null
          scheduled_appointments: number | null
          scheduled_leads: number | null
          sms_leads: number | null
          total_appointments: number | null
          total_calls: number | null
          total_leads: number | null
          urgent_leads: number | null
          user_id: string | null
          whatsapp_leads: number | null
        }
        Relationships: [
          {
            foreignKeyName: "businesses_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "admin_users_overview"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "businesses_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      lead_metrics: {
        Row: {
          business_id: string | null
          call_leads: number | null
          converted_leads: number | null
          leads_last_30_days: number | null
          leads_last_7_days: number | null
          lost_leads: number | null
          new_leads: number | null
          qualified_leads: number | null
          scheduled_leads: number | null
          sms_leads: number | null
          total_leads: number | null
          user_id: string | null
          whatsapp_leads: number | null
        }
        Relationships: [
          {
            foreignKeyName: "businesses_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "admin_users_overview"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "businesses_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      can_use_feature: {
        Args: { p_feature: string; p_user_id: string }
        Returns: boolean
      }
      get_case_type_stats: {
        Args: { p_business_id: string }
        Returns: {
          case_type: string
          count: number
          percentage: number
        }[]
      }
      get_leads_by_date: {
        Args: {
          p_business_id: string
          p_end_date: string
          p_start_date: string
        }
        Returns: {
          call_count: number
          date: string
          lead_count: number
          sms_count: number
        }[]
      }
      get_user_plan_features: {
        Args: { p_user_id: string }
        Returns: {
          has_analytics: boolean
          has_appointments: boolean
          has_messaging: boolean
          has_priority_support: boolean
          has_voice: boolean
          is_admin: boolean
          max_messages_monthly: number
          max_voice_minutes_monthly: number
          messages_used: number
          plan_name: string
          subscription_status: string
          voice_minutes_used: number
        }[]
      }
      increment_usage: {
        Args: { p_amount?: number; p_usage_type: string; p_user_id: string }
        Returns: boolean
      }
      is_admin: { Args: never; Returns: boolean }
      match_support_embeddings: {
        Args: {
          match_count?: number
          match_threshold?: number
          query_embedding: string
        }
        Returns: {
          content: string
          id: string
          similarity: number
        }[]
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {},
  },
} as const
