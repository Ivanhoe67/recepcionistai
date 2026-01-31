'use client'

import { ReactNode } from 'react'
import { Shield, AlertTriangle } from 'lucide-react'
import Link from 'next/link'

interface AdminGuardProps {
  isAdmin: boolean
  children: ReactNode
}

export function AdminGuard({ isAdmin, children }: AdminGuardProps) {
  if (isAdmin) {
    return <>{children}</>
  }

  return (
    <div className="flex min-h-[60vh] items-center justify-center p-8">
      <div className="max-w-md space-y-6 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
          <AlertTriangle className="h-8 w-8 text-red-600" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Acceso Restringido</h2>
          <p className="mt-2 text-gray-600">
            Esta seccion es solo para administradores. Si crees que esto es un error, contacta al soporte.
          </p>
        </div>
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 rounded-lg bg-gray-900 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-gray-800"
        >
          <Shield className="h-4 w-4" />
          Volver al Dashboard
        </Link>
      </div>
    </div>
  )
}
