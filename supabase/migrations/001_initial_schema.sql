-- =====================================================
-- LeadCapture AI - Initial Database Schema
-- =====================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- TABLES
-- =====================================================

-- Profiles (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  phone TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Businesses (configuración del negocio)
CREATE TABLE IF NOT EXISTS public.businesses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  phone TEXT,
  timezone TEXT DEFAULT 'America/New_York',
  business_hours JSONB DEFAULT '{"monday": {"start": "09:00", "end": "17:00"}, "tuesday": {"start": "09:00", "end": "17:00"}, "wednesday": {"start": "09:00", "end": "17:00"}, "thursday": {"start": "09:00", "end": "17:00"}, "friday": {"start": "09:00", "end": "17:00"}}',
  services JSONB DEFAULT '[]',
  qualification_questions JSONB DEFAULT '[]',
  assistant_script TEXT,
  retell_agent_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Leads (contactos capturados)
CREATE TABLE IF NOT EXISTS public.leads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,

  -- Contact info
  name TEXT,
  phone TEXT NOT NULL,
  email TEXT,

  -- Source and status
  source TEXT NOT NULL CHECK (source IN ('call', 'sms', 'whatsapp')),
  status TEXT DEFAULT 'new' CHECK (status IN ('new', 'qualified', 'appointment_scheduled', 'converted', 'lost')),

  -- Qualification data
  case_type TEXT,
  urgency TEXT CHECK (urgency IN ('low', 'medium', 'high', 'urgent')),
  notes TEXT,

  -- Metadata
  retell_call_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- SMS Conversations
CREATE TABLE IF NOT EXISTS public.sms_conversations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  lead_id UUID NOT NULL REFERENCES public.leads(id) ON DELETE CASCADE,
  messages JSONB DEFAULT '[]',
  last_message_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Call Transcripts (from Retell.ai)
CREATE TABLE IF NOT EXISTS public.call_transcripts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  lead_id UUID NOT NULL REFERENCES public.leads(id) ON DELETE CASCADE,
  retell_call_id TEXT NOT NULL,
  transcript JSONB,
  summary TEXT,
  duration_seconds INTEGER,
  call_status TEXT,
  recording_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Appointments
CREATE TABLE IF NOT EXISTS public.appointments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  lead_id UUID NOT NULL REFERENCES public.leads(id) ON DELETE CASCADE,
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,

  -- Scheduling
  scheduled_at TIMESTAMPTZ NOT NULL,
  duration_minutes INTEGER DEFAULT 30,

  -- Source and status
  source TEXT NOT NULL CHECK (source IN ('retell', 'sms', 'manual')),
  status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'confirmed', 'completed', 'cancelled', 'no_show')),

  -- External integrations
  google_event_id TEXT,
  cal_event_id TEXT,

  -- Notes
  notes TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Notifications
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  lead_id UUID REFERENCES public.leads(id) ON DELETE SET NULL,

  type TEXT NOT NULL CHECK (type IN ('new_lead', 'appointment', 'missed_call', 'sms_received')),
  channel TEXT NOT NULL CHECK (channel IN ('email', 'sms', 'push')),
  title TEXT NOT NULL,
  body TEXT,

  read BOOLEAN DEFAULT FALSE,
  sent_at TIMESTAMPTZ DEFAULT NOW(),
  read_at TIMESTAMPTZ
);

-- =====================================================
-- INDEXES
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_leads_business_id ON public.leads(business_id);
CREATE INDEX IF NOT EXISTS idx_leads_status ON public.leads(status);
CREATE INDEX IF NOT EXISTS idx_leads_created_at ON public.leads(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_leads_phone ON public.leads(phone);

CREATE INDEX IF NOT EXISTS idx_appointments_business_id ON public.appointments(business_id);
CREATE INDEX IF NOT EXISTS idx_appointments_scheduled_at ON public.appointments(scheduled_at);
CREATE INDEX IF NOT EXISTS idx_appointments_status ON public.appointments(status);

CREATE INDEX IF NOT EXISTS idx_sms_conversations_lead_id ON public.sms_conversations(lead_id);
CREATE INDEX IF NOT EXISTS idx_call_transcripts_lead_id ON public.call_transcripts(lead_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);

-- =====================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.businesses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sms_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.call_transcripts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Businesses policies
CREATE POLICY "Users can view own businesses" ON public.businesses
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create businesses" ON public.businesses
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own businesses" ON public.businesses
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own businesses" ON public.businesses
  FOR DELETE USING (auth.uid() = user_id);

-- Leads policies (through business ownership)
CREATE POLICY "Users can view leads of own businesses" ON public.leads
  FOR SELECT USING (
    business_id IN (SELECT id FROM public.businesses WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can create leads for own businesses" ON public.leads
  FOR INSERT WITH CHECK (
    business_id IN (SELECT id FROM public.businesses WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can update leads of own businesses" ON public.leads
  FOR UPDATE USING (
    business_id IN (SELECT id FROM public.businesses WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can delete leads of own businesses" ON public.leads
  FOR DELETE USING (
    business_id IN (SELECT id FROM public.businesses WHERE user_id = auth.uid())
  );

-- SMS Conversations policies
CREATE POLICY "Users can view conversations of own leads" ON public.sms_conversations
  FOR SELECT USING (
    lead_id IN (
      SELECT l.id FROM public.leads l
      JOIN public.businesses b ON l.business_id = b.id
      WHERE b.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create conversations for own leads" ON public.sms_conversations
  FOR INSERT WITH CHECK (
    lead_id IN (
      SELECT l.id FROM public.leads l
      JOIN public.businesses b ON l.business_id = b.id
      WHERE b.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update conversations of own leads" ON public.sms_conversations
  FOR UPDATE USING (
    lead_id IN (
      SELECT l.id FROM public.leads l
      JOIN public.businesses b ON l.business_id = b.id
      WHERE b.user_id = auth.uid()
    )
  );

-- Call Transcripts policies
CREATE POLICY "Users can view transcripts of own leads" ON public.call_transcripts
  FOR SELECT USING (
    lead_id IN (
      SELECT l.id FROM public.leads l
      JOIN public.businesses b ON l.business_id = b.id
      WHERE b.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create transcripts for own leads" ON public.call_transcripts
  FOR INSERT WITH CHECK (
    lead_id IN (
      SELECT l.id FROM public.leads l
      JOIN public.businesses b ON l.business_id = b.id
      WHERE b.user_id = auth.uid()
    )
  );

-- Appointments policies
CREATE POLICY "Users can view own appointments" ON public.appointments
  FOR SELECT USING (
    business_id IN (SELECT id FROM public.businesses WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can create appointments" ON public.appointments
  FOR INSERT WITH CHECK (
    business_id IN (SELECT id FROM public.businesses WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can update own appointments" ON public.appointments
  FOR UPDATE USING (
    business_id IN (SELECT id FROM public.businesses WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can delete own appointments" ON public.appointments
  FOR DELETE USING (
    business_id IN (SELECT id FROM public.businesses WHERE user_id = auth.uid())
  );

-- Notifications policies
CREATE POLICY "Users can view own notifications" ON public.notifications
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications" ON public.notifications
  FOR UPDATE USING (auth.uid() = user_id);

-- =====================================================
-- SERVICE ROLE POLICIES (for webhooks)
-- =====================================================

-- Allow service role to insert leads (for webhooks)
CREATE POLICY "Service role can insert leads" ON public.leads
  FOR INSERT TO service_role WITH CHECK (true);

CREATE POLICY "Service role can update leads" ON public.leads
  FOR UPDATE TO service_role USING (true);

-- Allow service role to insert transcripts (for Retell webhooks)
CREATE POLICY "Service role can insert transcripts" ON public.call_transcripts
  FOR INSERT TO service_role WITH CHECK (true);

-- Allow service role to insert/update conversations (for SMS webhooks)
CREATE POLICY "Service role can insert conversations" ON public.sms_conversations
  FOR INSERT TO service_role WITH CHECK (true);

CREATE POLICY "Service role can update conversations" ON public.sms_conversations
  FOR UPDATE TO service_role USING (true);

-- Allow service role to insert appointments (for webhooks)
CREATE POLICY "Service role can insert appointments" ON public.appointments
  FOR INSERT TO service_role WITH CHECK (true);

-- Allow service role to insert notifications
CREATE POLICY "Service role can insert notifications" ON public.notifications
  FOR INSERT TO service_role WITH CHECK (true);

-- =====================================================
-- FUNCTIONS
-- =====================================================

-- Function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_businesses_updated_at
  BEFORE UPDATE ON public.businesses
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_leads_updated_at
  BEFORE UPDATE ON public.leads
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_sms_conversations_updated_at
  BEFORE UPDATE ON public.sms_conversations
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_appointments_updated_at
  BEFORE UPDATE ON public.appointments
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =====================================================
-- VIEWS (for dashboard metrics)
-- =====================================================

-- Lead metrics view
CREATE OR REPLACE VIEW public.lead_metrics AS
SELECT
  b.id as business_id,
  b.user_id,
  COUNT(l.id) as total_leads,
  COUNT(CASE WHEN l.status = 'new' THEN 1 END) as new_leads,
  COUNT(CASE WHEN l.status = 'qualified' THEN 1 END) as qualified_leads,
  COUNT(CASE WHEN l.status = 'appointment_scheduled' THEN 1 END) as scheduled_leads,
  COUNT(CASE WHEN l.status = 'converted' THEN 1 END) as converted_leads,
  COUNT(CASE WHEN l.status = 'lost' THEN 1 END) as lost_leads,
  COUNT(CASE WHEN l.source = 'call' THEN 1 END) as call_leads,
  COUNT(CASE WHEN l.source = 'sms' THEN 1 END) as sms_leads,
  COUNT(CASE WHEN l.created_at > NOW() - INTERVAL '7 days' THEN 1 END) as leads_last_7_days,
  COUNT(CASE WHEN l.created_at > NOW() - INTERVAL '30 days' THEN 1 END) as leads_last_30_days
FROM public.businesses b
LEFT JOIN public.leads l ON b.id = l.business_id
GROUP BY b.id, b.user_id;

-- Enable RLS on view
ALTER VIEW public.lead_metrics SET (security_invoker = on);
