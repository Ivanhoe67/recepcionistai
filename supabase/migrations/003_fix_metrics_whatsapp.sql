-- =====================================================
-- Fix Metrics & Analytics to include WhatsApp
-- =====================================================
-- Run this in Supabase SQL Editor
-- =====================================================

-- 1. Update lead_metrics view to include WhatsApp
-- Must DROP first because column order changed
DROP VIEW IF EXISTS public.lead_metrics;

CREATE VIEW public.lead_metrics AS
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
  COUNT(CASE WHEN l.source = 'whatsapp' THEN 1 END) as whatsapp_leads,
  COUNT(CASE WHEN l.created_at > NOW() - INTERVAL '7 days' THEN 1 END) as leads_last_7_days,
  COUNT(CASE WHEN l.created_at > NOW() - INTERVAL '30 days' THEN 1 END) as leads_last_30_days
FROM public.businesses b
LEFT JOIN public.leads l ON b.id = l.business_id
GROUP BY b.id, b.user_id;

-- 2. Update get_leads_by_date function to include WhatsApp
CREATE OR REPLACE FUNCTION public.get_leads_by_date(
  p_business_id UUID,
  p_start_date TIMESTAMPTZ,
  p_end_date TIMESTAMPTZ
)
RETURNS TABLE (
  date DATE,
  lead_count BIGINT,
  call_count BIGINT,
  sms_count BIGINT,
  whatsapp_count BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    DATE(l.created_at) as date,
    COUNT(*) as lead_count,
    COUNT(CASE WHEN l.source = 'call' THEN 1 END) as call_count,
    COUNT(CASE WHEN l.source = 'sms' THEN 1 END) as sms_count,
    COUNT(CASE WHEN l.source = 'whatsapp' THEN 1 END) as whatsapp_count
  FROM public.leads l
  WHERE l.business_id = p_business_id
    AND l.created_at >= p_start_date
    AND l.created_at <= p_end_date
  GROUP BY DATE(l.created_at)
  ORDER BY DATE(l.created_at);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

SELECT 'WhatsApp metrics fix completed!' as status;
