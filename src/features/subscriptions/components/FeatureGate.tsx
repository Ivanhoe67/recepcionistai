'use client'

import { ReactNode } from 'react'
import { Lock, Sparkles } from 'lucide-react'
import Link from 'next/link'

interface FeatureGateProps {
  /** The feature to check access for */
  feature: 'messaging' | 'voice' | 'appointments' | 'analytics'
  /** User's plan features (passed from server) */
  planFeatures: {
    has_messaging: boolean
    has_voice: boolean
    has_appointments: boolean
    has_analytics: boolean
    is_admin: boolean
    plan_name: string
  }
  /** Content to show when user has access */
  children: ReactNode
  /** Custom fallback component (optional) */
  fallback?: ReactNode
  /** Whether to hide completely or show upgrade prompt */
  hideWhenBlocked?: boolean
}

export function FeatureGate({
  feature,
  planFeatures,
  children,
  fallback,
  hideWhenBlocked = false,
}: FeatureGateProps) {
  // Admins always have access
  if (planFeatures.is_admin) {
    return <>{children}</>
  }

  // Check feature access
  const hasAccess = (() => {
    switch (feature) {
      case 'messaging':
        return planFeatures.has_messaging
      case 'voice':
        return planFeatures.has_voice
      case 'appointments':
        return planFeatures.has_appointments
      case 'analytics':
        return planFeatures.has_analytics
      default:
        return false
    }
  })()

  if (hasAccess) {
    return <>{children}</>
  }

  if (hideWhenBlocked) {
    return null
  }

  if (fallback) {
    return <>{fallback}</>
  }

  // Default upgrade prompt
  return <UpgradePrompt feature={feature} currentPlan={planFeatures.plan_name} />
}

interface UpgradePromptProps {
  feature: string
  currentPlan: string
}

function UpgradePrompt({ feature, currentPlan }: UpgradePromptProps) {
  const featureLabels: Record<string, { title: string; description: string; requiredPlan: string }> = {
    messaging: {
      title: 'Agentes de Mensajeria AI',
      description: 'Automatiza tu atencion al cliente por WhatsApp y SMS con inteligencia artificial.',
      requiredPlan: 'Basico o Premium',
    },
    voice: {
      title: 'Agentes de Voz AI',
      description: 'Recibe y realiza llamadas telefonicas con un asistente de voz inteligente.',
      requiredPlan: 'Pro o Premium',
    },
    appointments: {
      title: 'Gestion de Citas',
      description: 'Agenda citas automaticamente y sincroniza con tu calendario.',
      requiredPlan: 'Cualquier plan',
    },
    analytics: {
      title: 'Analiticas Avanzadas',
      description: 'Visualiza metricas detalladas y reportes de rendimiento.',
      requiredPlan: 'Pro o Premium',
    },
  }

  const info = featureLabels[feature] || {
    title: 'Funcion Premium',
    description: 'Esta funcion requiere un plan superior.',
    requiredPlan: 'Pro o Premium',
  }

  return (
    <div className="relative overflow-hidden rounded-xl border border-sky-200/50 bg-gradient-to-br from-white/80 to-sky-50/50 p-8 backdrop-blur-sm">
      {/* Decorative elements */}
      <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-gradient-to-br from-violet-400/20 to-purple-500/20 blur-2xl" />
      <div className="absolute -bottom-8 -left-8 h-32 w-32 rounded-full bg-gradient-to-tr from-sky-400/20 to-cyan-500/20 blur-2xl" />

      <div className="relative space-y-6">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 shadow-lg">
            <Lock className="h-6 w-6 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900">{info.title}</h3>
            <p className="mt-1 text-sm text-gray-600">{info.description}</p>
          </div>
        </div>

        <div className="flex items-center gap-2 rounded-lg bg-amber-50 px-4 py-3 text-sm text-amber-800">
          <Sparkles className="h-4 w-4 flex-shrink-0" />
          <span>
            Tu plan actual: <strong>{currentPlan || 'Sin plan'}</strong>.
            Necesitas: <strong>{info.requiredPlan}</strong>
          </span>
        </div>

        <Link
          href="/settings/subscription"
          className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-violet-600 to-purple-600 px-6 py-3 text-sm font-medium text-white shadow-lg transition-all hover:from-violet-700 hover:to-purple-700 hover:shadow-xl"
        >
          <Sparkles className="h-4 w-4" />
          Mejorar Mi Plan
        </Link>
      </div>
    </div>
  )
}

/**
 * Simple hook-like component for inline feature checks
 */
interface IfFeatureProps {
  feature: 'messaging' | 'voice' | 'appointments' | 'analytics'
  planFeatures: {
    has_messaging: boolean
    has_voice: boolean
    has_appointments: boolean
    has_analytics: boolean
    is_admin: boolean
  }
  children: ReactNode
}

export function IfFeature({ feature, planFeatures, children }: IfFeatureProps) {
  if (planFeatures.is_admin) return <>{children}</>

  const hasAccess = (() => {
    switch (feature) {
      case 'messaging': return planFeatures.has_messaging
      case 'voice': return planFeatures.has_voice
      case 'appointments': return planFeatures.has_appointments
      case 'analytics': return planFeatures.has_analytics
      default: return false
    }
  })()

  return hasAccess ? <>{children}</> : null
}
