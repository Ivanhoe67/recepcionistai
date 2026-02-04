-- =====================================================
-- Stripe: link plans to Stripe Price IDs
-- =====================================================
-- After creating Products/Prices in Stripe Dashboard,
-- run: UPDATE subscription_plans SET stripe_price_id_monthly = 'price_xxx' WHERE name = 'basic'; etc.
-- =====================================================

ALTER TABLE public.subscription_plans
ADD COLUMN IF NOT EXISTS stripe_price_id_monthly TEXT,
ADD COLUMN IF NOT EXISTS stripe_price_id_yearly TEXT;

COMMENT ON COLUMN public.subscription_plans.stripe_price_id_monthly IS 'Stripe Price ID for monthly billing (e.g. price_xxx).';
COMMENT ON COLUMN public.subscription_plans.stripe_price_id_yearly IS 'Stripe Price ID for yearly billing (optional).';

SELECT 'Stripe price ID columns added.' AS status;
