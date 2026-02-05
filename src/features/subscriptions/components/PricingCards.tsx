'use client'

import { useState } from 'react'
import { Check, Sparkles, Phone, MessageSquare, Calendar, BarChart3, Zap, Crown } from 'lucide-react'
import { SubscriptionPlan } from '@/lib/database.types'

interface PricingCardsProps {
  plans: SubscriptionPlan[]
  currentPlanName?: string | null
  onSelectPlan?: (plan: SubscriptionPlan) => void
}

export function PricingCards({ plans, currentPlanName, onSelectPlan }: PricingCardsProps) {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly')

  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null)

  const handleSelectPlan = async (plan: SubscriptionPlan) => {
    if (!onSelectPlan) return
    setSelectedPlanId(plan.id)
    try {
      await onSelectPlan(plan)
    } finally {
      setSelectedPlanId(null)
    }
  }

  // Filter out enterprise for now (custom pricing)
  const displayPlans = plans.filter(p => p.name !== 'enterprise')

  const getPlanIcon = (name: string) => {
    switch (name) {
      case 'basic': return MessageSquare
      case 'pro': return Phone
      case 'premium': return Crown
      default: return Sparkles
    }
  }

  const getPlanGradient = (name: string) => {
    switch (name) {
      case 'basic': return 'from-emerald-500 to-teal-600'
      case 'pro': return 'from-violet-500 to-purple-600'
      case 'premium': return 'from-amber-500 to-orange-600'
      default: return 'from-gray-500 to-gray-600'
    }
  }

  const getFeatureList = (plan: SubscriptionPlan) => {
    const features = []

    if (plan.has_messaging) {
      features.push({
        icon: MessageSquare,
        text: plan.max_messages_monthly
          ? `${plan.max_messages_monthly} mensajes/mes`
          : 'Mensajes ilimitados',
      })
    }

    if (plan.has_voice) {
      features.push({
        icon: Phone,
        text: plan.max_voice_minutes_monthly
          ? `${plan.max_voice_minutes_monthly} minutos de voz/mes`
          : 'Minutos ilimitados',
      })
    }

    if (plan.has_appointments) {
      features.push({
        icon: Calendar,
        text: 'Agendamiento automatico',
      })
    }

    if (plan.has_analytics) {
      features.push({
        icon: BarChart3,
        text: 'Analiticas avanzadas',
      })
    }

    if (plan.max_leads_monthly) {
      features.push({
        icon: Zap,
        text: `${plan.max_leads_monthly} leads/mes`,
      })
    } else if (plan.max_leads_monthly === null) {
      features.push({
        icon: Zap,
        text: 'Leads ilimitados',
      })
    }

    if (plan.has_priority_support) {
      features.push({
        icon: Sparkles,
        text: 'Soporte prioritario',
      })
    }

    if (plan.max_businesses && plan.max_businesses > 1) {
      features.push({
        icon: Crown,
        text: `${plan.max_businesses} negocios`,
      })
    }

    return features
  }

  return (
    <div className="space-y-8">
      {/* Billing toggle */}
      <div className="flex items-center justify-center gap-4">
        <span className={`text-sm font-medium ${billingCycle === 'monthly' ? 'text-gray-900' : 'text-gray-500'}`}>
          Mensual
        </span>
        <button
          onClick={() => setBillingCycle(prev => prev === 'monthly' ? 'yearly' : 'monthly')}
          className={`relative h-7 w-14 rounded-full transition-colors ${billingCycle === 'yearly' ? 'bg-violet-600' : 'bg-gray-200'
            }`}
        >
          <span
            className={`absolute left-1 top-1 h-5 w-5 rounded-full bg-white shadow transition-transform ${billingCycle === 'yearly' ? 'translate-x-7' : 'translate-x-0'
              }`}
          />
        </button>
        <span className={`text-sm font-medium ${billingCycle === 'yearly' ? 'text-gray-900' : 'text-gray-500'}`}>
          Anual
          <span className="ml-1.5 rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-700">
            -20%
          </span>
        </span>
      </div>

      {/* Plans grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {displayPlans.map((plan, index) => {
          const Icon = getPlanIcon(plan.name)
          const gradient = getPlanGradient(plan.name)
          const features = getFeatureList(plan)
          const isCurrentPlan = currentPlanName === plan.name
          const isPro = plan.name === 'pro'
          const price = billingCycle === 'monthly'
            ? plan.price_monthly
            : plan.price_yearly ? Math.round(plan.price_yearly / 12) : null

          return (
            <div
              key={plan.id}
              className={`relative overflow-hidden rounded-2xl border-2 bg-white p-6 shadow-lg transition-all hover:shadow-xl ${isPro
                ? 'border-violet-300 ring-2 ring-violet-200'
                : 'border-gray-100'
                } ${isCurrentPlan ? 'ring-2 ring-emerald-400' : ''}`}
            >
              {/* Popular badge */}
              {isPro && (
                <div className="absolute -right-12 top-6 rotate-45 bg-gradient-to-r from-violet-600 to-purple-600 px-12 py-1 text-xs font-semibold text-white shadow-md">
                  Popular
                </div>
              )}

              {/* Current plan badge */}
              {isCurrentPlan && (
                <div className="absolute left-4 top-4 rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
                  Tu plan actual
                </div>
              )}

              {/* Plan header */}
              <div className={`mb-6 ${isCurrentPlan ? 'mt-6' : ''}`}>
                <div className={`mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${gradient} shadow-lg`}>
                  <Icon className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900">{plan.display_name}</h3>
                <p className="mt-1 text-sm text-gray-500">{plan.description}</p>
              </div>

              {/* Price */}
              <div className="mb-6">
                <div className="flex items-baseline">
                  <span className="text-4xl font-bold text-gray-900">
                    ${price}
                  </span>
                  <span className="ml-2 text-gray-500">/mes</span>
                </div>
                {billingCycle === 'yearly' && plan.price_yearly && (
                  <p className="mt-1 text-sm text-gray-500">
                    ${plan.price_yearly} facturado anualmente
                  </p>
                )}
              </div>

              {/* Features */}
              <ul className="mb-8 space-y-3">
                {features.map((feature, i) => (
                  <li key={i} className="flex items-center gap-3">
                    <div className={`flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br ${gradient} bg-opacity-10`}>
                      <Check className="h-3.5 w-3.5 text-gray-700" />
                    </div>
                    <span className="text-sm text-gray-600">{feature.text}</span>
                  </li>
                ))}
              </ul>

              {/* CTA */}
              <button
                onClick={() => handleSelectPlan(plan)}
                disabled={isCurrentPlan || !!selectedPlanId}
                className={`w-full rounded-xl py-3 text-sm font-semibold transition-all ${isCurrentPlan
                    ? 'cursor-not-allowed bg-gray-100 text-gray-400'
                    : isPro
                      ? `bg-gradient-to-r ${gradient} text-white shadow-lg hover:shadow-xl`
                      : 'bg-gray-900 text-white hover:bg-gray-800'
                  } ${selectedPlanId === plan.id ? 'opacity-70 cursor-wait' : ''}`}
              >
                {isCurrentPlan
                  ? 'Plan Actual'
                  : selectedPlanId === plan.id
                    ? 'Procesando...'
                    : 'Seleccionar Plan'}
              </button>
            </div>
          )
        })}
      </div>

      {/* Enterprise callout */}
      <div className="rounded-2xl border border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100 p-8 text-center">
        <h3 className="text-lg font-semibold text-gray-900">
          ¿Necesitas mas?
        </h3>
        <p className="mt-2 text-gray-600">
          Contactanos para una solucion Enterprise personalizada con volumen ilimitado y soporte dedicado.
        </p>
        <button className="mt-4 rounded-lg border border-gray-300 bg-white px-6 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50">
          Contactar Ventas
        </button>
      </div>
    </div>
  )
}
