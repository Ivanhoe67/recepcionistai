-- =====================================================
-- Roles & Subscription System
-- =====================================================
-- Based on market research 2025-2026:
-- - AI Virtual Receptionists: $99-$299/month mid-range
-- - Voice AI (Retell): $0.13-0.31/min → ~$140/1000 min
-- - WhatsApp Chatbots: $45-$119/month
-- =====================================================

-- 1. Add role to profiles
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'user' CHECK (role IN ('admin', 'user'));

-- 2. Create subscription_plans table
CREATE TABLE IF NOT EXISTS public.subscription_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    display_name TEXT NOT NULL,
    description TEXT,
    price_monthly DECIMAL(10,2) NOT NULL,
    price_yearly DECIMAL(10,2),
    currency TEXT DEFAULT 'USD',

    -- Feature flags
    has_messaging BOOLEAN DEFAULT false,        -- WhatsApp/SMS AI
    has_voice BOOLEAN DEFAULT false,            -- Retell voice calls
    has_appointments BOOLEAN DEFAULT true,      -- Calendar integration
    has_analytics BOOLEAN DEFAULT false,        -- Advanced analytics
    has_api_access BOOLEAN DEFAULT false,       -- API access
    has_white_label BOOLEAN DEFAULT false,      -- White label branding
    has_priority_support BOOLEAN DEFAULT false, -- Priority support

    -- Usage limits (NULL = unlimited)
    max_messages_monthly INTEGER,               -- WhatsApp/SMS messages
    max_voice_minutes_monthly INTEGER,          -- Voice call minutes
    max_leads_monthly INTEGER,                  -- New leads per month
    max_businesses INTEGER DEFAULT 1,           -- Number of businesses

    -- Metadata
    is_active BOOLEAN DEFAULT true,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Create subscriptions table
CREATE TABLE IF NOT EXISTS public.subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    plan_id UUID NOT NULL REFERENCES public.subscription_plans(id),

    -- Subscription status
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'cancelled', 'expired', 'trial', 'past_due')),

    -- Billing cycle
    billing_cycle TEXT DEFAULT 'monthly' CHECK (billing_cycle IN ('monthly', 'yearly')),
    current_period_start TIMESTAMPTZ DEFAULT NOW(),
    current_period_end TIMESTAMPTZ,

    -- Trial info
    trial_ends_at TIMESTAMPTZ,

    -- Payment info (for Stripe integration later)
    stripe_customer_id TEXT,
    stripe_subscription_id TEXT,

    -- Metadata
    cancelled_at TIMESTAMPTZ,
    cancel_reason TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    -- One active subscription per user
    UNIQUE(user_id)
);

-- 4. Create subscription_usage table for tracking
CREATE TABLE IF NOT EXISTS public.subscription_usage (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    subscription_id UUID NOT NULL REFERENCES public.subscriptions(id) ON DELETE CASCADE,

    -- Period tracking
    period_start TIMESTAMPTZ NOT NULL,
    period_end TIMESTAMPTZ NOT NULL,

    -- Usage counters
    messages_used INTEGER DEFAULT 0,
    voice_minutes_used INTEGER DEFAULT 0,
    leads_created INTEGER DEFAULT 0,

    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    -- One usage record per subscription per period
    UNIQUE(subscription_id, period_start)
);

-- 5. Insert default plans based on market research
INSERT INTO public.subscription_plans (
    name, display_name, description, price_monthly, price_yearly,
    has_messaging, has_voice, has_appointments, has_analytics, has_priority_support,
    max_messages_monthly, max_voice_minutes_monthly, max_leads_monthly, max_businesses,
    sort_order
) VALUES
(
    'basic',
    'Basico',
    'Agentes de mensajeria AI para WhatsApp y SMS. Ideal para negocios que quieren automatizar su atencion al cliente por chat.',
    49.00,
    470.00,  -- ~20% discount yearly
    true,    -- has_messaging
    false,   -- has_voice
    true,    -- has_appointments
    false,   -- has_analytics
    false,   -- has_priority_support
    500,     -- max_messages_monthly
    0,       -- max_voice_minutes_monthly
    100,     -- max_leads_monthly
    1,       -- max_businesses
    1        -- sort_order
),
(
    'pro',
    'Pro',
    'Agentes de voz AI que hacen y reciben llamadas. Perfecto para negocios que necesitan atencion telefonica automatizada.',
    149.00,
    1430.00, -- ~20% discount yearly
    false,   -- has_messaging
    true,    -- has_voice
    true,    -- has_appointments
    true,    -- has_analytics
    false,   -- has_priority_support
    0,       -- max_messages_monthly
    200,     -- max_voice_minutes_monthly
    200,     -- max_leads_monthly
    1,       -- max_businesses
    2        -- sort_order
),
(
    'premium',
    'Premium',
    'La experiencia completa: agentes de mensajeria + voz. Automatiza todos tus canales de comunicacion con IA.',
    249.00,
    2390.00, -- ~20% discount yearly
    true,    -- has_messaging
    true,    -- has_voice
    true,    -- has_appointments
    true,    -- has_analytics
    true,    -- has_priority_support
    500,     -- max_messages_monthly
    300,     -- max_voice_minutes_monthly
    NULL,    -- unlimited leads
    3,       -- max_businesses
    3        -- sort_order
),
(
    'enterprise',
    'Enterprise',
    'Solucion personalizada para grandes empresas. Contactanos para una cotizacion a medida.',
    NULL,    -- Custom pricing
    NULL,
    true,    -- has_messaging
    true,    -- has_voice
    true,    -- has_appointments
    true,    -- has_analytics
    true,    -- has_priority_support
    NULL,    -- unlimited
    NULL,    -- unlimited
    NULL,    -- unlimited
    NULL,    -- unlimited
    4        -- sort_order
)
ON CONFLICT (name) DO UPDATE SET
    display_name = EXCLUDED.display_name,
    description = EXCLUDED.description,
    price_monthly = EXCLUDED.price_monthly,
    price_yearly = EXCLUDED.price_yearly,
    has_messaging = EXCLUDED.has_messaging,
    has_voice = EXCLUDED.has_voice,
    has_appointments = EXCLUDED.has_appointments,
    has_analytics = EXCLUDED.has_analytics,
    has_priority_support = EXCLUDED.has_priority_support,
    max_messages_monthly = EXCLUDED.max_messages_monthly,
    max_voice_minutes_monthly = EXCLUDED.max_voice_minutes_monthly,
    max_leads_monthly = EXCLUDED.max_leads_monthly,
    max_businesses = EXCLUDED.max_businesses,
    updated_at = NOW();

-- 6. Enable RLS on new tables
ALTER TABLE public.subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscription_usage ENABLE ROW LEVEL SECURITY;

-- 7. RLS Policies for subscription_plans (public read)
CREATE POLICY "Anyone can view active plans" ON public.subscription_plans
    FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage plans" ON public.subscription_plans
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'admin'
        )
    );

-- 8. RLS Policies for subscriptions
CREATE POLICY "Users can view own subscription" ON public.subscriptions
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Admins can view all subscriptions" ON public.subscriptions
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'admin'
        )
    );

CREATE POLICY "Admins can manage subscriptions" ON public.subscriptions
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'admin'
        )
    );

-- 9. RLS Policies for subscription_usage
CREATE POLICY "Users can view own usage" ON public.subscription_usage
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.subscriptions
            WHERE subscriptions.id = subscription_usage.subscription_id
            AND subscriptions.user_id = auth.uid()
        )
    );

CREATE POLICY "Admins can view all usage" ON public.subscription_usage
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'admin'
        )
    );

-- 10. Update RLS for businesses to respect max_businesses limit
DROP POLICY IF EXISTS "Users can create own businesses" ON public.businesses;

CREATE POLICY "Users can create businesses within plan limit" ON public.businesses
    FOR INSERT WITH CHECK (
        user_id = auth.uid()
        AND (
            -- Admin can create unlimited
            EXISTS (
                SELECT 1 FROM public.profiles
                WHERE profiles.id = auth.uid()
                AND profiles.role = 'admin'
            )
            OR
            -- Users within their plan limit
            (
                SELECT COUNT(*) FROM public.businesses b
                WHERE b.user_id = auth.uid()
            ) < COALESCE(
                (
                    SELECT COALESCE(sp.max_businesses, 999)
                    FROM public.subscriptions s
                    JOIN public.subscription_plans sp ON s.plan_id = sp.id
                    WHERE s.user_id = auth.uid()
                    AND s.status = 'active'
                ),
                1 -- Default to 1 if no subscription
            )
        )
    );

-- 11. Create function to get user's current plan features
CREATE OR REPLACE FUNCTION public.get_user_plan_features(p_user_id UUID)
RETURNS TABLE (
    plan_name TEXT,
    has_messaging BOOLEAN,
    has_voice BOOLEAN,
    has_appointments BOOLEAN,
    has_analytics BOOLEAN,
    has_priority_support BOOLEAN,
    max_messages_monthly INTEGER,
    max_voice_minutes_monthly INTEGER,
    messages_used INTEGER,
    voice_minutes_used INTEGER,
    subscription_status TEXT,
    is_admin BOOLEAN
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        COALESCE(sp.name, 'none') as plan_name,
        COALESCE(sp.has_messaging, false) as has_messaging,
        COALESCE(sp.has_voice, false) as has_voice,
        COALESCE(sp.has_appointments, false) as has_appointments,
        COALESCE(sp.has_analytics, false) as has_analytics,
        COALESCE(sp.has_priority_support, false) as has_priority_support,
        sp.max_messages_monthly,
        sp.max_voice_minutes_monthly,
        COALESCE(su.messages_used, 0) as messages_used,
        COALESCE(su.voice_minutes_used, 0) as voice_minutes_used,
        COALESCE(s.status, 'none') as subscription_status,
        COALESCE(p.role = 'admin', false) as is_admin
    FROM public.profiles p
    LEFT JOIN public.subscriptions s ON s.user_id = p.id AND s.status IN ('active', 'trial')
    LEFT JOIN public.subscription_plans sp ON sp.id = s.plan_id
    LEFT JOIN public.subscription_usage su ON su.subscription_id = s.id
        AND NOW() BETWEEN su.period_start AND su.period_end
    WHERE p.id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 12. Create function to check if user can use a feature
CREATE OR REPLACE FUNCTION public.can_use_feature(p_user_id UUID, p_feature TEXT)
RETURNS BOOLEAN AS $$
DECLARE
    v_is_admin BOOLEAN;
    v_has_feature BOOLEAN;
BEGIN
    -- Check if admin (admins can do everything)
    SELECT role = 'admin' INTO v_is_admin
    FROM public.profiles
    WHERE id = p_user_id;

    IF v_is_admin THEN
        RETURN true;
    END IF;

    -- Check subscription feature
    SELECT
        CASE p_feature
            WHEN 'messaging' THEN sp.has_messaging
            WHEN 'voice' THEN sp.has_voice
            WHEN 'appointments' THEN sp.has_appointments
            WHEN 'analytics' THEN sp.has_analytics
            WHEN 'priority_support' THEN sp.has_priority_support
            ELSE false
        END INTO v_has_feature
    FROM public.subscriptions s
    JOIN public.subscription_plans sp ON sp.id = s.plan_id
    WHERE s.user_id = p_user_id
    AND s.status IN ('active', 'trial');

    RETURN COALESCE(v_has_feature, false);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 13. Create function to increment usage
CREATE OR REPLACE FUNCTION public.increment_usage(
    p_user_id UUID,
    p_usage_type TEXT,  -- 'messages' or 'voice_minutes'
    p_amount INTEGER DEFAULT 1
)
RETURNS BOOLEAN AS $$
DECLARE
    v_subscription_id UUID;
    v_period_start TIMESTAMPTZ;
    v_period_end TIMESTAMPTZ;
BEGIN
    -- Get active subscription
    SELECT id, current_period_start, current_period_end
    INTO v_subscription_id, v_period_start, v_period_end
    FROM public.subscriptions
    WHERE user_id = p_user_id
    AND status IN ('active', 'trial');

    IF v_subscription_id IS NULL THEN
        RETURN false;
    END IF;

    -- Upsert usage record
    INSERT INTO public.subscription_usage (
        subscription_id, period_start, period_end,
        messages_used, voice_minutes_used
    )
    VALUES (
        v_subscription_id, v_period_start, v_period_end,
        CASE WHEN p_usage_type = 'messages' THEN p_amount ELSE 0 END,
        CASE WHEN p_usage_type = 'voice_minutes' THEN p_amount ELSE 0 END
    )
    ON CONFLICT (subscription_id, period_start) DO UPDATE SET
        messages_used = subscription_usage.messages_used +
            CASE WHEN p_usage_type = 'messages' THEN p_amount ELSE 0 END,
        voice_minutes_used = subscription_usage.voice_minutes_used +
            CASE WHEN p_usage_type = 'voice_minutes' THEN p_amount ELSE 0 END,
        updated_at = NOW();

    RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 14. Create admin view for all users with subscriptions
CREATE OR REPLACE VIEW public.admin_users_overview AS
SELECT
    p.id as user_id,
    p.email,
    p.full_name,
    p.role,
    p.created_at as user_created_at,
    sp.name as plan_name,
    sp.display_name as plan_display_name,
    s.status as subscription_status,
    s.current_period_end,
    su.messages_used,
    su.voice_minutes_used,
    (SELECT COUNT(*) FROM public.businesses b WHERE b.user_id = p.id) as business_count,
    (SELECT COUNT(*) FROM public.leads l
     JOIN public.businesses b ON l.business_id = b.id
     WHERE b.user_id = p.id) as total_leads
FROM public.profiles p
LEFT JOIN public.subscriptions s ON s.user_id = p.id
LEFT JOIN public.subscription_plans sp ON sp.id = s.plan_id
LEFT JOIN public.subscription_usage su ON su.subscription_id = s.id
    AND NOW() BETWEEN su.period_start AND su.period_end
ORDER BY p.created_at DESC;

-- 15. Indexes for performance
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON public.subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON public.subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_subscription_usage_subscription_id ON public.subscription_usage(subscription_id);
CREATE INDEX IF NOT EXISTS idx_subscription_usage_period ON public.subscription_usage(period_start, period_end);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);

-- 16. Update timestamps trigger for new tables
CREATE TRIGGER update_subscription_plans_updated_at
    BEFORE UPDATE ON public.subscription_plans
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_subscriptions_updated_at
    BEFORE UPDATE ON public.subscriptions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_subscription_usage_updated_at
    BEFORE UPDATE ON public.subscription_usage
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
