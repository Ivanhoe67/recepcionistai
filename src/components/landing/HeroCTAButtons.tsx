'use client'

import { useState, useEffect } from 'react'
import { Phone, MessageSquare, PhoneOff, Loader2 } from 'lucide-react'
import { RetellWebClient } from 'retell-client-js-sdk'
import { useTranslations } from 'next-intl'

const WHATSAPP_NUMBER = "15179302149"

export function HeroCTAButtons() {
  const t = useTranslations('Landing')
  const [isCallActive, setIsCallActive] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [retellClient, setRetellClient] = useState<RetellWebClient | null>(null)

  useEffect(() => {
    const client = new RetellWebClient()

    client.on('call_started', () => {
      setIsCallActive(true)
      setIsLoading(false)
    })

    client.on('call_ended', () => {
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
      const response = await fetch('/api/retell/web-call', {
        method: 'POST',
      })

      if (!response.ok) {
        throw new Error('Failed to create web call')
      }

      const { access_token } = await response.json()

      await retellClient.startCall({
        accessToken: access_token,
      })
    } catch (error) {
      console.error('Failed to start call:', error)
      setIsLoading(false)
      window.location.href = 'tel:+15177217972'
    }
  }

  const endCall = () => {
    if (retellClient) {
      retellClient.stopCall()
    }
  }

  const WHATSAPP_MESSAGE = t('hero.whatsappMsg')

  return (
    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
      {isCallActive ? (
        <button
          onClick={endCall}
          className="glass-button text-lg px-8 py-4 flex items-center gap-2 w-full sm:w-auto justify-center bg-red-500 hover:bg-red-600"
        >
          <PhoneOff className="w-5 h-5 animate-pulse" />
          {t('hero.endCall')}
        </button>
      ) : (
        <button
          onClick={startCall}
          disabled={isLoading}
          className="glass-button text-lg px-8 py-4 flex items-center gap-2 w-full sm:w-auto justify-center disabled:opacity-70"
        >
          {isLoading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <Phone className="w-5 h-5" />
          )}
          {isLoading ? t('hero.connecting') : t('hero.callAI')}
        </button>
      )}
      <a
        href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(WHATSAPP_MESSAGE)}`}
        target="_blank"
        rel="noopener noreferrer"
        className="glass-button text-lg px-8 py-4 flex items-center gap-2 w-full sm:w-auto justify-center bg-[#25D366] hover:bg-[#128C7E]"
      >
        <MessageSquare className="w-5 h-5" />
        {t('hero.whatsapp')}
      </a>
    </div>
  )
}

export function FinalCTAButtons() {
  const t = useTranslations('Landing')
  const [isCallActive, setIsCallActive] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [retellClient, setRetellClient] = useState<RetellWebClient | null>(null)

  useEffect(() => {
    const client = new RetellWebClient()

    client.on('call_started', () => {
      setIsCallActive(true)
      setIsLoading(false)
    })

    client.on('call_ended', () => {
      setIsCallActive(false)
      setIsLoading(false)
    })

    client.on('error', () => {
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
      const response = await fetch('/api/retell/web-call', {
        method: 'POST',
      })

      if (!response.ok) throw new Error('Failed')

      const { access_token } = await response.json()
      await retellClient.startCall({ accessToken: access_token })
    } catch {
      setIsLoading(false)
      window.location.href = 'tel:+15177217972'
    }
  }

  const endCall = () => {
    retellClient?.stopCall()
  }

  const WHATSAPP_MESSAGE = t('hero.whatsappMsg')

  return (
    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
      {isCallActive ? (
        <button
          onClick={endCall}
          className="glass-button text-lg px-8 py-4 flex items-center gap-2 bg-red-500 hover:bg-red-600"
        >
          <PhoneOff className="w-5 h-5 animate-pulse" />
          {t('hero.endCall')}
        </button>
      ) : (
        <button
          onClick={startCall}
          disabled={isLoading}
          className="glass-button text-lg px-8 py-4 flex items-center gap-2 disabled:opacity-70"
        >
          {isLoading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <Phone className="w-5 h-5" />
          )}
          {isLoading ? t('hero.connecting') : t('hero.callAI')}
        </button>
      )}
      <a
        href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(WHATSAPP_MESSAGE)}`}
        target="_blank"
        rel="noopener noreferrer"
        className="glass-button text-lg px-8 py-4 flex items-center gap-2 bg-[#25D366] hover:bg-[#128C7E]"
      >
        <MessageSquare className="w-5 h-5" />
        {t('hero.whatsapp')}
      </a>
    </div>
  )
}
