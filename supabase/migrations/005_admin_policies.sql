-- =====================================================
-- Admin Full Access Policies
-- =====================================================
-- Permite a los ADMINISTRADORES gestionar todas las cuentas
-- =====================================================

-- Helper function to check if user is admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 1. PROFILES - Admin puede ver y editar todos
-- =====================================================

-- Drop existing policies to recreate with admin access
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "profiles_select_own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_update_own" ON public.profiles;

-- New policies with admin access
CREATE POLICY "profiles_select" ON public.profiles
  FOR SELECT USING (
    id = auth.uid() OR public.is_admin()
  );

CREATE POLICY "profiles_update" ON public.profiles
  FOR UPDATE USING (
    id = auth.uid() OR public.is_admin()
  );

CREATE POLICY "profiles_insert" ON public.profiles
  FOR INSERT WITH CHECK (
    id = auth.uid()
  );

-- =====================================================
-- 2. SUBSCRIPTIONS - Admin puede gestionar todas
-- =====================================================

DROP POLICY IF EXISTS "Users can view own subscription" ON public.subscriptions;
DROP POLICY IF EXISTS "subscriptions_select_own" ON public.subscriptions;

CREATE POLICY "subscriptions_select" ON public.subscriptions
  FOR SELECT USING (
    user_id = auth.uid() OR public.is_admin()
  );

CREATE POLICY "subscriptions_insert" ON public.subscriptions
  FOR INSERT WITH CHECK (
    user_id = auth.uid() OR public.is_admin()
  );

CREATE POLICY "subscriptions_update" ON public.subscriptions
  FOR UPDATE USING (
    user_id = auth.uid() OR public.is_admin()
  );

CREATE POLICY "subscriptions_delete" ON public.subscriptions
  FOR DELETE USING (
    public.is_admin()
  );

-- =====================================================
-- 3. BUSINESSES - Admin puede ver y editar todos
-- =====================================================

DROP POLICY IF EXISTS "Users can view own businesses" ON public.businesses;
DROP POLICY IF EXISTS "Users can insert own businesses" ON public.businesses;
DROP POLICY IF EXISTS "Users can update own businesses" ON public.businesses;
DROP POLICY IF EXISTS "businesses_select_own" ON public.businesses;
DROP POLICY IF EXISTS "businesses_insert_own" ON public.businesses;
DROP POLICY IF EXISTS "businesses_update_own" ON public.businesses;

CREATE POLICY "businesses_select" ON public.businesses
  FOR SELECT USING (
    user_id = auth.uid() OR public.is_admin()
  );

CREATE POLICY "businesses_insert" ON public.businesses
  FOR INSERT WITH CHECK (
    user_id = auth.uid() OR public.is_admin()
  );

CREATE POLICY "businesses_update" ON public.businesses
  FOR UPDATE USING (
    user_id = auth.uid() OR public.is_admin()
  );

CREATE POLICY "businesses_delete" ON public.businesses
  FOR DELETE USING (
    public.is_admin()
  );

-- =====================================================
-- 4. LEADS - Admin puede ver todos
-- =====================================================

DROP POLICY IF EXISTS "Users can view own leads" ON public.leads;
DROP POLICY IF EXISTS "leads_select_own" ON public.leads;

CREATE POLICY "leads_select" ON public.leads
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.businesses b
      WHERE b.id = leads.business_id
      AND (b.user_id = auth.uid() OR public.is_admin())
    )
  );

CREATE POLICY "leads_insert" ON public.leads
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.businesses b
      WHERE b.id = business_id
      AND (b.user_id = auth.uid() OR public.is_admin())
    )
  );

CREATE POLICY "leads_update" ON public.leads
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.businesses b
      WHERE b.id = leads.business_id
      AND (b.user_id = auth.uid() OR public.is_admin())
    )
  );

-- =====================================================
-- 5. APPOINTMENTS - Admin puede ver todos
-- =====================================================

DROP POLICY IF EXISTS "Users can view own appointments" ON public.appointments;
DROP POLICY IF EXISTS "appointments_select_own" ON public.appointments;

CREATE POLICY "appointments_select" ON public.appointments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.businesses b
      WHERE b.id = appointments.business_id
      AND (b.user_id = auth.uid() OR public.is_admin())
    )
  );

CREATE POLICY "appointments_insert" ON public.appointments
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.businesses b
      WHERE b.id = business_id
      AND (b.user_id = auth.uid() OR public.is_admin())
    )
  );

CREATE POLICY "appointments_update" ON public.appointments
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.businesses b
      WHERE b.id = appointments.business_id
      AND (b.user_id = auth.uid() OR public.is_admin())
    )
  );

-- =====================================================
-- 6. SUBSCRIPTION_USAGE - Admin puede ver todo
-- =====================================================

DROP POLICY IF EXISTS "subscription_usage_select_own" ON public.subscription_usage;

CREATE POLICY "subscription_usage_select" ON public.subscription_usage
  FOR SELECT USING (
    user_id = auth.uid() OR public.is_admin()
  );

CREATE POLICY "subscription_usage_update" ON public.subscription_usage
  FOR UPDATE USING (
    user_id = auth.uid() OR public.is_admin()
  );

-- =====================================================
-- 7. SUBSCRIPTION_PLANS - Todos pueden ver, solo admin modifica
-- =====================================================

DROP POLICY IF EXISTS "subscription_plans_public_read" ON public.subscription_plans;

CREATE POLICY "subscription_plans_select" ON public.subscription_plans
  FOR SELECT USING (true);

CREATE POLICY "subscription_plans_admin_insert" ON public.subscription_plans
  FOR INSERT WITH CHECK (public.is_admin());

CREATE POLICY "subscription_plans_admin_update" ON public.subscription_plans
  FOR UPDATE USING (public.is_admin());

CREATE POLICY "subscription_plans_admin_delete" ON public.subscription_plans
  FOR DELETE USING (public.is_admin());

-- =====================================================
-- 8. Vista para admin: todos los usuarios con sus planes
-- =====================================================

CREATE OR REPLACE VIEW public.admin_users_view AS
SELECT
  p.id as user_id,
  p.full_name,
  p.avatar_url,
  p.role,
  p.created_at as user_created_at,
  u.email,
  u.last_sign_in_at,
  sp.name as plan_name,
  sp.display_name as plan_display_name,
  s.status as subscription_status,
  s.current_period_end,
  su.messages_used,
  su.voice_minutes_used,
  su.leads_captured,
  (SELECT COUNT(*) FROM public.businesses b WHERE b.user_id = p.id) as business_count
FROM public.profiles p
LEFT JOIN auth.users u ON p.id = u.id
LEFT JOIN public.subscriptions s ON p.id = s.user_id AND s.status = 'active'
LEFT JOIN public.subscription_plans sp ON s.plan_id = sp.id
LEFT JOIN public.subscription_usage su ON p.id = su.user_id
  AND su.period_start <= NOW()
  AND su.period_end >= NOW();

-- Grant access to authenticated users (RLS will filter)
GRANT SELECT ON public.admin_users_view TO authenticated;

SELECT 'Admin policies created successfully!' as status;
