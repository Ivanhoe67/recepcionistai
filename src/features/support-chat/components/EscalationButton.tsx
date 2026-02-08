'use client'

import { useState } from 'react'
import { UserIcon, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

interface EscalationButtonProps {
  conversationId: string
  onSuccess?: () => void
}

export function EscalationButton({
  conversationId,
  onSuccess,
}: EscalationButtonProps) {
  const [isCreating, setIsCreating] = useState(false)

  const handleEscalate = async () => {
    setIsCreating(true)

    try {
      const response = await fetch('/api/support-chat/escalate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ conversationId }),
      })

      if (!response.ok) {
        throw new Error('Failed to create ticket')
      }

      const { ticket } = await response.json()

      toast.success('Ticket creado exitosamente', {
        description: `Tu ticket #${ticket.id.slice(0, 8)} ha sido creado. Un agente te contactará pronto.`,
      })

      onSuccess?.()
    } catch (error) {
      console.error('Error creating ticket:', error)
      toast.error('Error al crear ticket', {
        description: 'No pudimos crear tu ticket. Por favor intenta de nuevo.',
      })
    } finally {
      setIsCreating(false)
    }
  }

  return (
    <button
      onClick={handleEscalate}
      disabled={isCreating}
      className="glass-button-secondary w-full flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {isCreating ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>Creando ticket...</span>
        </>
      ) : (
        <>
          <UserIcon className="h-4 w-4" />
          <span>Hablar con Humano</span>
        </>
      )}
    </button>
  )
}
