'use client'

import { Calendar, MessageSquare } from 'lucide-react'
import { useTranslations } from 'next-intl'

const WHATSAPP_NUMBER = "15179302149"

export function HeroCTAButtons() {
  const t = useTranslations('Landing')
  const demoMsg = t('hero.whatsappDemo')
  const whatsappMsg = t('hero.whatsappMsg')

  return (
    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
      <a
        href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(demoMsg)}`}
        target="_blank"
        rel="noopener noreferrer"
        className="glass-button text-lg px-8 py-4 flex items-center gap-2 w-full sm:w-auto justify-center"
      >
        <Calendar className="w-5 h-5" />
        {t('hero.ctaDemo')}
      </a>
      <a
        href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(whatsappMsg)}`}
        target="_blank"
        rel="noopener noreferrer"
        className="glass-button-secondary text-lg px-8 py-4 flex items-center gap-2 w-full sm:w-auto justify-center"
      >
        <MessageSquare className="w-5 h-5" />
        {t('hero.whatsapp')}
      </a>
    </div>
  )
}

export function FinalCTAButtons() {
  const t = useTranslations('Landing')
  const demoMsg = t('hero.whatsappDemo')
  const whatsappMsg = t('hero.whatsappMsg')

  return (
    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
      <a
        href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(demoMsg)}`}
        target="_blank"
        rel="noopener noreferrer"
        className="glass-button text-lg px-8 py-4 flex items-center gap-2 w-full sm:w-auto justify-center"
      >
        <Calendar className="w-5 h-5" />
        {t('hero.ctaDemo')}
      </a>
      <a
        href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(whatsappMsg)}`}
        target="_blank"
        rel="noopener noreferrer"
        className="glass-button-secondary text-lg px-8 py-4 flex items-center gap-2 w-full sm:w-auto justify-center"
      >
        <MessageSquare className="w-5 h-5" />
        {t('finalCta.whatsapp')}
      </a>
    </div>
  )
}
