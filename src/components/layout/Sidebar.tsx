'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Users,
  Phone,
  MessageSquare,
  Calendar,
  Settings,
  LogOut,
  Sparkles,
  BarChart3,
  Shield,
  CreditCard,
  Lock,
  Crown,
  X,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { signOut } from '@/features/auth/services/auth.service'
import { UserPlanFeatures } from '@/lib/database.types'

interface SidebarProps {
  planFeatures?: UserPlanFeatures | null
  isOpen?: boolean
  onClose?: () => void
}

export function Sidebar({ planFeatures, isOpen = false, onClose }: SidebarProps) {
  const pathname = usePathname()

  const isAdmin = planFeatures?.is_admin ?? false
  const hasMessaging = planFeatures?.has_messaging ?? false
  const hasVoice = planFeatures?.has_voice ?? false
  const hasAnalytics = planFeatures?.has_analytics ?? false
  const planName = planFeatures?.plan_name ?? 'none'

  // Base navigation items
  const navigation = [
    {
      name: 'Dashboard',
      href: '/dashboard',
      icon: LayoutDashboard,
      available: true,
    },
    {
      name: 'Analiticas',
      href: '/analytics',
      icon: BarChart3,
      available: isAdmin || hasAnalytics,
      requiredFeature: 'analytics',
    },
    {
      name: 'Leads',
      href: '/leads',
      icon: Users,
      available: true,
    },
    {
      name: 'Llamadas',
      href: '/calls',
      icon: Phone,
      available: isAdmin || hasVoice,
      requiredFeature: 'voice',
    },
    {
      name: 'Mensajes',
      href: '/sms',
      icon: MessageSquare,
      available: isAdmin || hasMessaging,
      requiredFeature: 'messaging',
    },
    {
      name: 'Citas',
      href: '/appointments',
      icon: Calendar,
      available: true,
    },
  ]

  // Settings navigation
  const settingsNav = [
    {
      name: 'Configuracion',
      href: '/settings',
      icon: Settings,
      available: true,
    },
    {
      name: 'Suscripcion',
      href: '/settings/subscription',
      icon: CreditCard,
      available: !isAdmin, // Admins don't need subscription page
    },
  ]

  // Admin-only navigation
  const adminNav = [
    {
      name: 'Admin Panel',
      href: '/admin',
      icon: Shield,
      available: isAdmin,
    },
  ]

  // Handle link clicks on mobile - close sidebar after navigation
  const handleLinkClick = () => {
    if (onClose) {
      onClose()
    }
  }

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 md:hidden backdrop-blur-sm"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <div
        className={cn(
          'glass-sidebar flex h-screen w-72 flex-col fixed md:relative z-40 md:z-20',
          'transition-transform duration-300 ease-in-out',
          // Mobile: hidden by default, slide in when open
          isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        )}
      >
        {/* Logo */}
        <div className="flex h-20 items-center gap-3 px-6 border-b border-white/30">
          <div className="w-12 h-12 flex items-center justify-center">
            <img src="/logo.svg" alt="RecepcionistAI" className="w-full h-full" />
          </div>
          <div className="flex-1">
            <h1 className="text-lg font-bold bg-gradient-to-r from-sky-600 to-sky-800 bg-clip-text text-transparent">
              RecepcionistAI
            </h1>
            <p className="text-xs text-sky-600/70">Tu recepcionista 24/7</p>
          </div>
          {/* Close button - mobile only */}
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-white/50 transition-colors md:hidden"
            aria-label="Cerrar menu"
          >
            <X className="h-5 w-5 text-sky-700" />
          </button>
        </div>

      {/* Plan badge */}
      {planFeatures && (
        <div className="mx-4 mt-4 rounded-lg bg-gradient-to-r from-violet-500/10 to-purple-500/10 px-3 py-2">
          <div className="flex items-center gap-2">
            {isAdmin ? (
              <Shield className="h-4 w-4 text-violet-600" />
            ) : (
              <Crown className="h-4 w-4 text-violet-600" />
            )}
            <span className="text-sm font-medium text-violet-700">
              {isAdmin ? 'Administrador' : `Plan ${planName === 'none' ? 'Gratis' : planName.charAt(0).toUpperCase() + planName.slice(1)}`}
            </span>
          </div>
        </div>
      )}

      {/* Main Navigation */}
      <nav className="flex-1 space-y-1 px-4 py-6 overflow-y-auto">
        <p className="px-3 text-xs font-semibold uppercase tracking-wider text-sky-600/60 mb-2">
          Menu Principal
        </p>
        {navigation.map((item, index) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
          const isLocked = !item.available

          return (
            <Link
              key={item.name}
              href={isLocked ? '/settings/subscription' : item.href}
              onClick={handleLinkClick}
              className={cn(
                'glass-nav-item opacity-0 animate-fade-in relative group',
                isActive && 'active',
                isLocked && 'opacity-50',
                `stagger-${index + 1}`
              )}
            >
              <item.icon className="h-5 w-5" />
              <span className="flex-1">{item.name}</span>
              {isLocked && (
                <Lock className="h-4 w-4 text-gray-400" />
              )}
              {isLocked && (
                <div className="absolute left-full ml-2 hidden group-hover:block">
                  <div className="rounded-lg bg-gray-900 px-3 py-2 text-xs text-white shadow-lg whitespace-nowrap">
                    Disponible en plan {item.requiredFeature === 'voice' ? 'Pro' : 'Basico'}
                  </div>
                </div>
              )}
            </Link>
          )
        })}

        {/* Admin section */}
        {isAdmin && (
          <>
            <div className="my-4 border-t border-white/20" />
            <p className="px-3 text-xs font-semibold uppercase tracking-wider text-violet-600/60 mb-2">
              Administracion
            </p>
            {adminNav.filter(i => i.available).map((item, index) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={handleLinkClick}
                  className={cn(
                    'glass-nav-item opacity-0 animate-fade-in',
                    isActive && 'active bg-violet-500/20',
                    `stagger-${navigation.length + index + 1}`
                  )}
                >
                  <item.icon className="h-5 w-5 text-violet-600" />
                  <span>{item.name}</span>
                </Link>
              )
            })}
          </>
        )}

        {/* Settings section */}
        <div className="my-4 border-t border-white/20" />
        <p className="px-3 text-xs font-semibold uppercase tracking-wider text-sky-600/60 mb-2">
          Configuracion
        </p>
        {settingsNav.filter(i => i.available).map((item, index) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
          return (
            <Link
              key={item.name}
              href={item.href}
              onClick={handleLinkClick}
              className={cn(
                'glass-nav-item opacity-0 animate-fade-in',
                isActive && 'active',
                `stagger-${navigation.length + adminNav.length + index + 1}`
              )}
            >
              <item.icon className="h-5 w-5" />
              <span>{item.name}</span>
            </Link>
          )
        })}
      </nav>

      {/* User Section */}
      <div className="border-t border-white/30 p-4">
        <form action={signOut}>
          <button
            type="submit"
            className="glass-nav-item w-full text-sky-600 hover:text-sky-800"
          >
            <LogOut className="h-5 w-5" />
            <span>Cerrar Sesion</span>
          </button>
        </form>
      </div>
      </div>
    </>
  )
}
