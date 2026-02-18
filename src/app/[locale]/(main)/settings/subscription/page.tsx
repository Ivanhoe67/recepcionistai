'use client'

import { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { createClient } from '@/lib/supabase/client'
import { getSubscriptionPlans, getCurrentSubscription, getUserPlanFeatures } from '@/features/subscriptions/services/subscription.service'
import { PricingCards } from '@/features/subscriptions/components/PricingCards'
import { CreditCard, Zap, BarChart3, Shield, ExternalLink, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { SubscriptionPlan } from '@/lib/database.types'

export default function SubscriptionPage() {
  const [loading, setLoading] = useState(true)
  const [plans, setPlans] = useState<any[]>([])
  const [subscription, setSubscription] = useState<any>(null)
  const [features, setFeatures] = useState<any>(null)
  const [isPortalLoading, setIsPortalLoading] = useState(false)

  useEffect(() => {
    async function loadData() {
      try {
        const [plansData, subData, featuresData] = await Promise.all([
          getSubscriptionPlans(),
          getCurrentSubscription(),
          getUserPlanFeatures(),
        ])
        setPlans(plansData)
        setSubscription(subData)
        setFeatures(featuresData)
      } catch (error) {
        console.error('Error loading subscription data:', error)
        toast.error(t('errors.load'))
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  const handleSelectPlan = async (plan: SubscriptionPlan) => {
    try {
      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          planId: plan.id,
          billingCycle: 'monthly' // Default for now
        }),
      })

      const data = await response.json()
      if (data.url) {
        window.location.href = data.url
      } else {
        toast.error(data.error || t('errors.checkout'))
      }
    } catch (error) {
      console.error('Checkout error:', error)
      toast.error(t('errors.checkoutConnection'))
    }
  }

  const handleOpenPortal = async () => {
    setIsPortalLoading(true)
    try {
      const response = await fetch('/api/stripe/billing-portal', {
        method: 'POST',
      })
      const data = await response.json()
      if (data.url) {
        window.location.href = data.url
      } else {
        toast.error(data.error || t('errors.portal'))
      }
    } catch (error) {
      console.error('Portal error:', error)
      toast.error(t('errors.portalConnection'))
    } finally {
      setIsPortalLoading(false)
    }
  }

  const t = useTranslations('Subscriptions')

  if (loading) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t('title')}</h1>
          <p className="mt-1 text-gray-600">
            {t('subtitle')}
          </p>
        </div>
        {subscription?.stripe_customer_id && (
          <button
            onClick={handleOpenPortal}
            disabled={isPortalLoading}
            className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-50"
          >
            {isPortalLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <ExternalLink className="h-4 w-4" />
            )}
            {t('manageBilling')}
          </button>
        )}
      </div>

      {/* Current subscription info */}
      {subscription && (
        <div className="rounded-2xl border border-gray-200 bg-gradient-to-r from-violet-50 to-purple-50 p-6">
          <div className="flex items-start justify-between">
            <div className="space-y-4 w-full">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 shadow-lg">
                  <CreditCard className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">
                    {t('currentPlan', { plan: subscription.plan.display_name })}
                  </h2>
                  <p className="text-sm text-gray-600">
                    {subscription.billing_cycle === 'monthly' ? t('monthlyBilling') : t('annualBilling')}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-4">
                <div className="rounded-lg bg-white/80 px-4 py-2">
                  <p className="text-xs text-gray-500">{t('status')}</p>
                  <p className="font-medium text-emerald-600 capitalize">{subscription.status}</p>
                </div>
                <div className="rounded-lg bg-white/80 px-4 py-2">
                  <p className="text-xs text-gray-500">{t('nextBilling')}</p>
                  <p className="font-medium text-gray-900">
                    {subscription.current_period_end
                      ? new Date(subscription.current_period_end).toLocaleDateString(undefined, {
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
      {subscription && features && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {features.has_messaging && (
            <div className="rounded-xl border border-gray-200 bg-white p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100">
                  <Zap className="h-5 w-5 text-emerald-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">{t('usage.messages')}</p>
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
                  <p className="text-sm text-gray-500">{t('usage.voiceMinutes')}</p>
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
      {features?.is_admin && (
        <div className="flex items-center gap-3 rounded-xl border border-violet-200 bg-violet-50 p-4">
          <Shield className="h-5 w-5 text-violet-600" />
          <div>
            <p className="font-medium text-violet-900">{t('adminBadge.title')}</p>
            <p className="text-sm text-violet-700">
              {t('adminBadge.description')}
            </p>
          </div>
        </div>
      )}

      {/* Pricing cards */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-900">
          {subscription ? t('plans.change') : t('plans.select')}
        </h2>
        <PricingCards
          plans={plans}
          currentPlanName={subscription?.plan.name}
          onSelectPlan={handleSelectPlan}
        />
      </div>
    </div>
  )
}

