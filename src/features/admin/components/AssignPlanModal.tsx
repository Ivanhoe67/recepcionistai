'use client'

import { useState, useTransition } from 'react'
import { X, CreditCard, Check, Loader2 } from 'lucide-react'
import { assignPlanToUser } from '../services/admin.service'

interface Plan {
  id: string
  name: string
  display_name: string
  price_monthly: number | null
  has_messaging: boolean | null
  has_voice: boolean | null
  has_analytics: boolean | null
}

interface AssignPlanModalProps {
  isOpen: boolean
  onClose: () => void
  userId: string
  userName: string
  plans: Plan[]
  currentPlanId?: string
}

export function AssignPlanModal({
  isOpen,
  onClose,
  userId,
  userName,
  plans,
  currentPlanId,
}: AssignPlanModalProps) {
  const [selectedPlan, setSelectedPlan] = useState<string>(currentPlanId || '')
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly')
  const [trialDays, setTrialDays] = useState<number>(0)
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  if (!isOpen) return null

  const handleSubmit = () => {
    if (!selectedPlan) {
      setError('Selecciona un plan')
      return
    }

    setError(null)
    startTransition(async () => {
      try {
        await assignPlanToUser(userId, selectedPlan, {
          billingCycle,
          trialDays,
          replaceExisting: true,
        })
        onClose()
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error al asignar plan')
      }
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative z-10 w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-violet-100">
              <CreditCard className="h-5 w-5 text-violet-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Asignar Plan</h2>
              <p className="text-sm text-gray-500">{userName}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Plans */}
        <div className="mb-6 space-y-3">
          <label className="text-sm font-medium text-gray-700">Seleccionar Plan</label>
          <div className="grid gap-3">
            {plans.map((plan) => (
              <button
                key={plan.id}
                type="button"
                onClick={() => setSelectedPlan(plan.id)}
                className={`relative flex items-center justify-between rounded-xl border-2 p-4 text-left transition-all ${
                  selectedPlan === plan.id
                    ? 'border-violet-500 bg-violet-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div>
                  <p className="font-medium text-gray-900">{plan.display_name}</p>
                  <p className="text-sm text-gray-500">
                    {plan.price_monthly
                      ? `$${plan.price_monthly}/mes`
                      : 'Precio personalizado'}
                  </p>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {plan.has_messaging && (
                      <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs text-emerald-700">
                        Mensajeria
                      </span>
                    )}
                    {plan.has_voice && (
                      <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs text-blue-700">
                        Voz
                      </span>
                    )}
                    {plan.has_analytics && (
                      <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs text-amber-700">
                        Analytics
                      </span>
                    )}
                  </div>
                </div>
                {selectedPlan === plan.id && (
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-violet-500">
                    <Check className="h-4 w-4 text-white" />
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Billing cycle */}
        <div className="mb-6">
          <label className="text-sm font-medium text-gray-700">Ciclo de Facturacion</label>
          <div className="mt-2 flex gap-3">
            <button
              type="button"
              onClick={() => setBillingCycle('monthly')}
              className={`flex-1 rounded-lg border-2 px-4 py-2 text-sm font-medium transition-all ${
                billingCycle === 'monthly'
                  ? 'border-violet-500 bg-violet-50 text-violet-700'
                  : 'border-gray-200 text-gray-600 hover:border-gray-300'
              }`}
            >
              Mensual
            </button>
            <button
              type="button"
              onClick={() => setBillingCycle('yearly')}
              className={`flex-1 rounded-lg border-2 px-4 py-2 text-sm font-medium transition-all ${
                billingCycle === 'yearly'
                  ? 'border-violet-500 bg-violet-50 text-violet-700'
                  : 'border-gray-200 text-gray-600 hover:border-gray-300'
              }`}
            >
              Anual (2 meses gratis)
            </button>
          </div>
        </div>

        {/* Trial days */}
        <div className="mb-6">
          <label className="text-sm font-medium text-gray-700">Dias de Prueba</label>
          <div className="mt-2 flex gap-3">
            {[0, 7, 14, 30].map((days) => (
              <button
                key={days}
                type="button"
                onClick={() => setTrialDays(days)}
                className={`flex-1 rounded-lg border-2 px-3 py-2 text-sm font-medium transition-all ${
                  trialDays === days
                    ? 'border-violet-500 bg-violet-50 text-violet-700'
                    : 'border-gray-200 text-gray-600 hover:border-gray-300'
                }`}
              >
                {days === 0 ? 'Sin trial' : `${days} dias`}
              </button>
            ))}
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-600">
            {error}
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isPending || !selectedPlan}
            className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-violet-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-violet-700 disabled:opacity-50"
          >
            {isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Asignando...
              </>
            ) : (
              'Asignar Plan'
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
