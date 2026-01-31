import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getSubscriptionPlans, getCurrentSubscription, getUserPlanFeatures } from '@/features/subscriptions/services/subscription.service'
import { PricingCards } from '@/features/subscriptions/components/PricingCards'
import { CreditCard, Zap, BarChart3, Shield } from 'lucide-react'

export default async function SubscriptionPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const [plans, subscription, features] = await Promise.all([
    getSubscriptionPlans(),
    getCurrentSubscription(),
    getUserPlanFeatures(),
  ])

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Suscripcion</h1>
        <p className="mt-1 text-gray-600">
          Administra tu plan y facturacion
        </p>
      </div>

      {/* Current subscription info */}
      {subscription && (
        <div className="rounded-2xl border border-gray-200 bg-gradient-to-r from-violet-50 to-purple-50 p-6">
          <div className="flex items-start justify-between">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 shadow-lg">
                  <CreditCard className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">
                    Plan {subscription.plan.display_name}
                  </h2>
                  <p className="text-sm text-gray-600">
                    {subscription.billing_cycle === 'monthly' ? 'Facturacion mensual' : 'Facturacion anual'}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-4">
                <div className="rounded-lg bg-white/80 px-4 py-2">
                  <p className="text-xs text-gray-500">Estado</p>
                  <p className="font-medium text-emerald-600 capitalize">{subscription.status}</p>
                </div>
                <div className="rounded-lg bg-white/80 px-4 py-2">
                  <p className="text-xs text-gray-500">Proximo cobro</p>
                  <p className="font-medium text-gray-900">
                    {subscription.current_period_end
                      ? new Date(subscription.current_period_end).toLocaleDateString('es-MX', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })
                      : 'N/A'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Usage stats */}
      {subscription && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {features.has_messaging && (
            <div className="rounded-xl border border-gray-200 bg-white p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100">
                  <Zap className="h-5 w-5 text-emerald-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Mensajes</p>
                  <p className="font-semibold text-gray-900">
                    {features.messages_used}
                    {features.max_messages_monthly && (
                      <span className="text-gray-400"> / {features.max_messages_monthly}</span>
                    )}
                  </p>
                </div>
              </div>
              {features.max_messages_monthly && (
                <div className="mt-3 h-2 overflow-hidden rounded-full bg-gray-100">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-emerald-500"
                    style={{ width: `${Math.min((features.messages_used / features.max_messages_monthly) * 100, 100)}%` }}
                  />
                </div>
              )}
            </div>
          )}

          {features.has_voice && (
            <div className="rounded-xl border border-gray-200 bg-white p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-violet-100">
                  <BarChart3 className="h-5 w-5 text-violet-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Minutos de voz</p>
                  <p className="font-semibold text-gray-900">
                    {features.voice_minutes_used}
                    {features.max_voice_minutes_monthly && (
                      <span className="text-gray-400"> / {features.max_voice_minutes_monthly}</span>
                    )}
                  </p>
                </div>
              </div>
              {features.max_voice_minutes_monthly && (
                <div className="mt-3 h-2 overflow-hidden rounded-full bg-gray-100">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-violet-400 to-violet-500"
                    style={{ width: `${Math.min((features.voice_minutes_used / features.max_voice_minutes_monthly) * 100, 100)}%` }}
                  />
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Admin badge */}
      {features.is_admin && (
        <div className="flex items-center gap-3 rounded-xl border border-violet-200 bg-violet-50 p-4">
          <Shield className="h-5 w-5 text-violet-600" />
          <div>
            <p className="font-medium text-violet-900">Eres Administrador</p>
            <p className="text-sm text-violet-700">
              Tienes acceso completo a todas las funcionalidades sin limite de uso.
            </p>
          </div>
        </div>
      )}

      {/* Pricing cards */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-900">
          {subscription ? 'Cambiar de Plan' : 'Elige tu Plan'}
        </h2>
        <PricingCards
          plans={plans}
          currentPlanName={subscription?.plan.name}
        />
      </div>
    </div>
  )
}
