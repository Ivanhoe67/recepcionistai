-- =====================================================
-- Analytics & Classification Schema
-- =====================================================

-- Add classification JSONB field to leads
ALTER TABLE public.leads
ADD COLUMN IF NOT EXISTS classification JSONB DEFAULT NULL;

-- Classification structure:
-- {
--   "intent": "consultation" | "appointment" | "information" | "complaint" | "follow_up",
--   "sentiment": "positive" | "neutral" | "negative",
--   "quality": "high" | "medium" | "low" | "spam",
--   "topics": ["topic1", "topic2"],
--   "summary": "Brief summary of the interaction",
--   "flags": {
--     "urgent": boolean,
--     "needs_follow_up": boolean,
--     "potential_high_value": boolean,
--     "complaint": boolean
--   },
--   "classified_at": timestamp,
--   "classified_by": "ai" | "manual"
-- }

-- Add classification to call_transcripts
ALTER TABLE public.call_transcripts
ADD COLUMN IF NOT EXISTS classification JSONB DEFAULT NULL;

-- Add classification to sms_conversations
ALTER TABLE public.sms_conversations
ADD COLUMN IF NOT EXISTS classification JSONB DEFAULT NULL;

-- Add sentiment analysis field to call_transcripts
ALTER TABLE public.call_transcripts
ADD COLUMN IF NOT EXISTS sentiment_score NUMERIC(3,2) DEFAULT NULL;

-- Add response time tracking to leads
ALTER TABLE public.leads
ADD COLUMN IF NOT EXISTS first_response_seconds INTEGER DEFAULT NULL;

-- =====================================================
-- INDEXES for analytics queries
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_leads_classification ON public.leads USING GIN (classification);
CREATE INDEX IF NOT EXISTS idx_leads_urgency ON public.leads(urgency);
CREATE INDEX IF NOT EXISTS idx_leads_case_type ON public.leads(case_type);

CREATE INDEX IF NOT EXISTS idx_call_transcripts_classification ON public.call_transcripts USING GIN (classification);
CREATE INDEX IF NOT EXISTS idx_sms_conversations_classification ON public.sms_conversations USING GIN (classification);

-- =====================================================
-- ANALYTICS VIEW - Comprehensive metrics
-- =====================================================

CREATE OR REPLACE VIEW public.analytics_summary AS
SELECT
  b.id as business_id,
  b.user_id,

  -- Lead counts
  COUNT(DISTINCT l.id) as total_leads,
  COUNT(DISTINCT CASE WHEN l.created_at > NOW() - INTERVAL '7 days' THEN l.id END) as leads_last_7_days,
  COUNT(DISTINCT CASE WHEN l.created_at > NOW() - INTERVAL '30 days' THEN l.id END) as leads_last_30_days,

  -- Status distribution
  COUNT(DISTINCT CASE WHEN l.status = 'new' THEN l.id END) as new_leads,
  COUNT(DISTINCT CASE WHEN l.status = 'qualified' THEN l.id END) as qualified_leads,
  COUNT(DISTINCT CASE WHEN l.status = 'appointment_scheduled' THEN l.id END) as scheduled_leads,
  COUNT(DISTINCT CASE WHEN l.status = 'converted' THEN l.id END) as converted_leads,
  COUNT(DISTINCT CASE WHEN l.status = 'lost' THEN l.id END) as lost_leads,

  -- Source distribution
  COUNT(DISTINCT CASE WHEN l.source = 'call' THEN l.id END) as call_leads,
  COUNT(DISTINCT CASE WHEN l.source = 'sms' THEN l.id END) as sms_leads,
  COUNT(DISTINCT CASE WHEN l.source = 'whatsapp' THEN l.id END) as whatsapp_leads,

  -- Urgency distribution
  COUNT(DISTINCT CASE WHEN l.urgency = 'urgent' THEN l.id END) as urgent_leads,
  COUNT(DISTINCT CASE WHEN l.urgency = 'high' THEN l.id END) as high_urgency_leads,
  COUNT(DISTINCT CASE WHEN l.urgency = 'medium' THEN l.id END) as medium_urgency_leads,
  COUNT(DISTINCT CASE WHEN l.urgency = 'low' THEN l.id END) as low_urgency_leads,

  -- Call metrics
  COUNT(DISTINCT ct.id) as total_calls,
  AVG(ct.duration_seconds) as avg_call_duration,

  -- Appointment metrics
  COUNT(DISTINCT a.id) as total_appointments,
  COUNT(DISTINCT CASE WHEN a.status = 'scheduled' THEN a.id END) as scheduled_appointments,
  COUNT(DISTINCT CASE WHEN a.status = 'completed' THEN a.id END) as completed_appointments,
  COUNT(DISTINCT CASE WHEN a.status = 'cancelled' THEN a.id END) as cancelled_appointments,
  COUNT(DISTINCT CASE WHEN a.status = 'no_show' THEN a.id END) as no_show_appointments,

  -- Conversion rate
  CASE
    WHEN COUNT(DISTINCT l.id) > 0
    THEN ROUND((COUNT(DISTINCT CASE WHEN l.status = 'converted' THEN l.id END)::NUMERIC / COUNT(DISTINCT l.id)::NUMERIC) * 100, 2)
    ELSE 0
  END as conversion_rate,

  -- Appointment completion rate
  CASE
    WHEN COUNT(DISTINCT a.id) > 0
    THEN ROUND((COUNT(DISTINCT CASE WHEN a.status = 'completed' THEN a.id END)::NUMERIC / COUNT(DISTINCT a.id)::NUMERIC) * 100, 2)
    ELSE 0
  END as appointment_completion_rate

FROM public.businesses b
LEFT JOIN public.leads l ON b.id = l.business_id
LEFT JOIN public.call_transcripts ct ON l.id = ct.lead_id
LEFT JOIN public.appointments a ON l.id = a.lead_id
GROUP BY b.id, b.user_id;

-- Enable RLS on view
ALTER VIEW public.analytics_summary SET (security_invoker = on);

-- =====================================================
-- ANALYTICS FUNCTIONS
-- =====================================================

-- Function to get leads by date range
CREATE OR REPLACE FUNCTION public.get_leads_by_date(
  p_business_id UUID,
  p_start_date TIMESTAMPTZ,
  p_end_date TIMESTAMPTZ
)
RETURNS TABLE (
  date DATE,
  lead_count BIGINT,
  call_count BIGINT,
  sms_count BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    DATE(l.created_at) as date,
    COUNT(*) as lead_count,
    COUNT(CASE WHEN l.source = 'call' THEN 1 END) as call_count,
    COUNT(CASE WHEN l.source = 'sms' THEN 1 END) as sms_count
  FROM public.leads l
  WHERE l.business_id = p_business_id
    AND l.created_at >= p_start_date
    AND l.created_at <= p_end_date
  GROUP BY DATE(l.created_at)
  ORDER BY DATE(l.created_at);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get case type distribution
CREATE OR REPLACE FUNCTION public.get_case_type_stats(
  p_business_id UUID
)
RETURNS TABLE (
  case_type TEXT,
  count BIGINT,
  percentage NUMERIC
) AS $$
DECLARE
  total_count BIGINT;
BEGIN
  SELECT COUNT(*) INTO total_count
  FROM public.leads
  WHERE business_id = p_business_id AND case_type IS NOT NULL;

  RETURN QUERY
  SELECT
    l.case_type,
    COUNT(*) as count,
    CASE WHEN total_count > 0
      THEN ROUND((COUNT(*)::NUMERIC / total_count::NUMERIC) * 100, 2)
      ELSE 0
    END as percentage
  FROM public.leads l
  WHERE l.business_id = p_business_id AND l.case_type IS NOT NULL
  GROUP BY l.case_type
  ORDER BY count DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
