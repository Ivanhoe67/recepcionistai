'use client'

import { useState } from 'react'
import { ExternalLink, Loader2 } from 'lucide-react'

interface ManageSubscriptionButtonProps {
  className?: string
}

export function ManageSubscriptionButton({ className }: ManageSubscriptionButtonProps) {
  const [loading, setLoading] = useState(false)

  const handleClick = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/stripe/portal', { method: 'POST' })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Error')
      if (data.url) window.location.href = data.url
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Error al abrir el portal')
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={loading}
      className={className}
    >
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <ExternalLink className="h-4 w-4" />
      )}
      {loading ? 'Abriendo...' : 'Gestionar suscripción'}
    </button>
  )
}
