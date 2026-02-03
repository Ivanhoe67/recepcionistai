-- =====================================================
-- Pricing: limits and overage (launch with ~5 clients)
-- =====================================================
-- See docs/pricing.md for full table and rationale.
-- =====================================================

-- 1. Add overage columns to subscription_plans (cents for exact math)
ALTER TABLE public.subscription_plans
ADD COLUMN IF NOT EXISTS overage_per_message_cents INTEGER,
ADD COLUMN IF NOT EXISTS overage_per_minute_cents INTEGER;

COMMENT ON COLUMN public.subscription_plans.overage_per_message_cents IS 'Overage charge per message in USD cents (e.g. 4 = $0.04). NULL = no messaging or no overage.';
COMMENT ON COLUMN public.subscription_plans.overage_per_minute_cents IS 'Overage charge per voice minute in USD cents (e.g. 25 = $0.25). NULL = no voice or no overage.';

-- 2. Set launch limits and overage (Basic, Pro, Premium)
UPDATE public.subscription_plans SET
  max_messages_monthly = 800,
  max_voice_minutes_monthly = 0,
  overage_per_message_cents = 4,
  overage_per_minute_cents = NULL,
  updated_at = NOW()
WHERE name = 'basic';

UPDATE public.subscription_plans SET
  max_messages_monthly = 0,
  max_voice_minutes_monthly = 250,
  overage_per_message_cents = NULL,
  overage_per_minute_cents = 25,
  updated_at = NOW()
WHERE name = 'pro';

UPDATE public.subscription_plans SET
  max_messages_monthly = 800,
  max_voice_minutes_monthly = 350,
  overage_per_message_cents = 4,
  overage_per_minute_cents = 25,
  updated_at = NOW()
WHERE name = 'premium';

-- Enterprise: leave limits/overage as NULL (custom pricing)
-- No UPDATE for 'enterprise'.

SELECT 'Pricing limits and overage columns applied (launch).' AS status;
