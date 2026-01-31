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
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { signOut } from '@/features/auth/services/auth.service'

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Analíticas', href: '/analytics', icon: BarChart3 },
  { name: 'Leads', href: '/leads', icon: Users },
  { name: 'Llamadas', href: '/calls', icon: Phone },
  { name: 'SMS', href: '/sms', icon: MessageSquare },
  { name: 'Citas', href: '/appointments', icon: Calendar },
  { name: 'Configuración', href: '/settings', icon: Settings },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <div className="glass-sidebar flex h-screen w-72 flex-col relative z-20">
      {/* Logo */}
      <div className="flex h-20 items-center gap-3 px-6 border-b border-white/30">
        <div className="glass-metric-icon w-10 h-10">
          <Sparkles className="h-5 w-5 text-sky-500" />
        </div>
        <div>
          <h1 className="text-lg font-bold bg-gradient-to-r from-sky-600 to-sky-800 bg-clip-text text-transparent">
            LeadCapture AI
          </h1>
          <p className="text-xs text-sky-600/70">Asistente Virtual 24/7</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-4 py-6">
        {navigation.map((item, index) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'glass-nav-item opacity-0 animate-fade-in',
                isActive && 'active',
                `stagger-${index + 1}`
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
            <span>Cerrar Sesión</span>
          </button>
        </form>
      </div>
    </div>
  )
}
