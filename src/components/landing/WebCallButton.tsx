'use client'

import { useState, useEffect } from 'react'
import { Phone, PhoneOff, Loader2 } from 'lucide-react'
import { RetellWebClient } from 'retell-client-js-sdk'

interface WebCallButtonProps {
  className?: string
  showText?: boolean
}

export function WebCallButton({ className = '', showText = true }: WebCallButtonProps) {
  const [isCallActive, setIsCallActive] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [retellClient, setRetellClient] = useState<RetellWebClient | null>(null)

  useEffect(() => {
    // Initialize Retell client
    const client = new RetellWebClient()

    client.on('call_started', () => {
      console.log('Call started')
      setIsCallActive(true)
      setIsLoading(false)
    })

    client.on('call_ended', () => {
      console.log('Call ended')
      setIsCallActive(false)
      setIsLoading(false)
    })

    client.on('error', (error) => {
      console.error('Retell error:', error)
      setIsCallActive(false)
      setIsLoading(false)
    })

    setRetellClient(client)

    return () => {
      client.stopCall()
    }
  }, [])

  const startCall = async () => {
    if (!retellClient || isLoading) return

    setIsLoading(true)

    try {
      // Get access token from our API
      const response = await fetch('/api/retell/web-call', {
        method: 'POST',
      })

      if (!response.ok) {
        throw new Error('Failed to create web call')
      }

      const { access_token } = await response.json()

      // Start the call with the access token
      await retellClient.startCall({
        accessToken: access_token,
      })
    } catch (error) {
      console.error('Failed to start call:', error)
      setIsLoading(false)
      // Fallback to regular phone call
      window.location.href = 'tel:+15177217972'
    }
  }

  const endCall = () => {
    if (retellClient) {
      retellClient.stopCall()
    }
  }

  if (isCallActive) {
    return (
      <button
        onClick={endCall}
        className={`flex items-center gap-3 bg-red-500 hover:bg-red-600 text-white px-5 py-4 rounded-full shadow-lg hover:shadow-xl transition-all hover:scale-105 ${className}`}
      >
        <PhoneOff className="w-6 h-6 animate-pulse" />
        {showText && <span className="hidden sm:block font-semibold">Terminar Llamada</span>}
      </button>
    )
  }

  return (
    <button
      onClick={startCall}
      disabled={isLoading}
      className={`flex items-center gap-3 bg-gradient-to-r from-sky-500 to-sky-600 hover:from-sky-600 hover:to-sky-700 text-white px-5 py-4 rounded-full shadow-lg hover:shadow-xl transition-all hover:scale-105 disabled:opacity-70 disabled:cursor-not-allowed ${className}`}
    >
      {isLoading ? (
        <Loader2 className="w-6 h-6 animate-spin" />
      ) : (
        <Phone className="w-6 h-6" />
      )}
      {showText && (
        <span className="hidden sm:block font-semibold">
          {isLoading ? 'Conectando...' : 'Llama al AI'}
        </span>
      )}
    </button>
  )
}
