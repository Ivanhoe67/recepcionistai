'use client'

import { Menu, X } from 'lucide-react'
import { useTranslations } from 'next-intl'

interface MobileHeaderProps {
  isOpen: boolean
  onToggle: () => void
}

export function MobileHeader({ isOpen, onToggle }: MobileHeaderProps) {
  const t = useTranslations('Sidebar')
  return (
    <div className="fixed top-0 left-0 right-0 z-40 md:hidden">
      <div className="glass-card border-b border-white/20 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 flex items-center justify-center">
            <img src="/logo.svg" alt="RecepcionistAI" className="w-full h-full" />
          </div>
          <h1 className="text-base font-bold bg-gradient-to-r from-sky-600 to-sky-800 bg-clip-text text-transparent">
            RecepcionistAI
          </h1>
        </div>
        <button
          onClick={onToggle}
          className="p-2 rounded-lg bg-white/50 hover:bg-white/80 transition-colors"
          aria-label={isOpen ? t('closeMenu') : t('openMenu')}
        >
          {isOpen ? (
            <X className="h-6 w-6 text-sky-700" />
          ) : (
            <Menu className="h-6 w-6 text-sky-700" />
          )}
        </button>
      </div>
    </div>
  )
}
