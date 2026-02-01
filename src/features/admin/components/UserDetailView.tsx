'use client'

import { useState } from 'react'
import {
  User,
  Mail,
  Calendar,
  Shield,
  CreditCard,
  Building2,
  Phone,
  Clock,
  ChevronLeft,
  Crown,
  ExternalLink,
  MessageSquare,
} from 'lucide-react'
import Link from 'next/link'

interface UserDetailViewProps {
  userId: string
  user: {
    profile: any
    email: string | undefined
    last_sign_in: string | undefined
    subscription: any
    businesses: any[]
    leads_count: number
  }
}

export function UserDetailView({ userId, user }: UserDetailViewProps) {
  const { profile, email, last_sign_in, subscription, businesses, leads_count } = user

  const formatDate = (date: string | null | undefined) => {
    if (!date) return 'Nunca'
    return new Date(date).toLocaleDateString('es-MX', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'active': return 'bg-emerald-100 text-emerald-700'
      case 'trial': return 'bg-amber-100 text-amber-700'
      case 'cancelled': return 'bg-red-100 text-red-700'
      default: return 'bg-gray-100 text-gray-500'
    }
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Breadcrumbs / Back */}
      <Link
        href="/admin"
        className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 transition-colors hover:text-violet-600"
      >
        <ChevronLeft className="h-4 w-4" />
        Volver al Panel
      </Link>

      {/* Header Profile Card */}
      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition-all hover:shadow-md">
        <div className="h-32 bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600" />
        <div className="relative px-8 pb-8">
          <div className="flex flex-col items-start gap-6 sm:flex-row sm:items-end">
            <div className="-mt-12 flex h-32 w-32 items-center justify-center rounded-3xl border-4 border-white bg-gradient-to-br from-violet-400 to-purple-500 text-4xl font-bold text-white shadow-xl">
              {profile?.full_name?.[0] || email?.[0].toUpperCase()}
            </div>
            <div className="flex-1 space-y-1">
              <div className="flex items-center gap-3">
                <h1 className="text-3xl font-bold text-gray-900">
                  {profile?.full_name || 'Usuario sin nombre'}
                </h1>
                <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${
                  profile?.role === 'admin'
                    ? 'bg-violet-100 text-violet-700'
                    : 'bg-gray-100 text-gray-700'
                }`}>
                  {profile?.role === 'admin' ? <Shield className="h-3.5 w-3.5" /> : <User className="h-3.5 w-3.5" />}
                  {profile?.role === 'admin' ? 'Administrador' : 'Usuario'}
                </span>
              </div>
              <div className="flex flex-wrap gap-4 text-gray-500">
                <div className="flex items-center gap-1.5 text-sm">
                  <Mail className="h-4 w-4" />
                  {email}
                </div>
                <div className="flex items-center gap-1.5 text-sm">
                  <Clock className="h-4 w-4" />
                  Registrado el {formatDate(profile?.created_at)}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column: Subscription & Usage */}
        <div className="space-y-6 lg:col-span-2">
          {/* Subscription Card */}
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="flex items-center gap-2 text-lg font-bold text-gray-900">
                <CreditCard className="h-5 w-5 text-violet-600" />
                Suscripción y Plan
              </h2>
              {subscription && (
                <span className={`rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider ${getStatusColor(subscription.status)}`}>
                  {subscription.status}
                </span>
              )}
            </div>

            {subscription ? (
              <div className="grid gap-6 rounded-xl bg-gray-50 p-6 md:grid-cols-2">
                <div className="space-y-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">Plan Actual</p>
                    <div className="mt-1 flex items-center gap-2">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-100">
                        <Crown className="h-4 w-4 text-violet-600" />
                      </div>
                      <p className="text-lg font-bold text-gray-900">{subscription.plan?.display_name || 'Plan Personalizado'}</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">Ciclo de Facturación</p>
                    <p className="mt-1 font-medium text-gray-700 capitalize">{subscription.billing_cycle === 'monthly' ? 'Mensual' : 'Anual'}</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">Próximo Pago / Fin de Periodo</p>
                    <div className="mt-1 flex items-center gap-1.5 text-gray-700">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      <p className="font-medium">{formatDate(subscription.current_period_end)}</p>
                    </div>
                  </div>
                  {subscription.trial_ends_at && (
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">Trial Finaliza</p>
                      <p className="mt-1 font-medium text-amber-600">{formatDate(subscription.trial_ends_at)}</p>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-gray-300 py-10 text-center">
                <div className="mb-3 rounded-full bg-gray-100 p-3">
                  <CreditCard className="h-6 w-6 text-gray-400" />
                </div>
                <p className="font-medium text-gray-900">Sin suscripción activa</p>
                <p className="text-sm text-gray-500">Este usuario no tiene un plan asignado actualmente.</p>
              </div>
            )}

            {/* Usage Stats Mini Grid */}
            <div className="mt-6 grid gap-4 sm:grid-cols-3">
              <div className="rounded-xl border border-gray-100 bg-white p-4 text-center">
                <p className="text-sm font-medium text-gray-500">Leads Totales</p>
                <p className="mt-1 text-2xl font-bold text-gray-900">{leads_count}</p>
              </div>
              <div className="rounded-xl border border-gray-100 bg-white p-4 text-center">
                <p className="text-sm font-medium text-gray-500">Voz (minutos)</p>
                <p className="mt-1 text-2xl font-bold text-gray-900">{subscription?.usage?.voice_minutes_used || 0}</p>
              </div>
              <div className="rounded-xl border border-gray-100 bg-white p-4 text-center">
                <p className="text-sm font-medium text-gray-500">Mensajes</p>
                <p className="mt-1 text-2xl font-bold text-gray-900">{subscription?.usage?.messages_used || 0}</p>
              </div>
            </div>
          </div>

          {/* Businesses Table */}
          <div className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-100">
              <h2 className="flex items-center gap-2 text-lg font-bold text-gray-900">
                <Building2 className="h-5 w-5 text-violet-600" />
                Negocios / Empresas
              </h2>
            </div>
            
            <div className="overflow-x-auto">
              {businesses.length > 0 ? (
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Nombre</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Teléfono Retell</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">WhatsApp</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Zona Horaria</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 bg-white">
                    {businesses.map((biz) => (
                      <tr key={biz.id} className="transition-colors hover:bg-gray-50/50">
                        <td className="whitespace-nowrap px-6 py-4">
                          <p className="font-bold text-gray-900">{biz.name}</p>
                          <p className="text-xs text-gray-400">ID: {biz.id.slice(0, 8)}...</p>
                        </td>
                        <td className="whitespace-nowrap px-6 py-4">
                          <div className="flex items-center gap-1.5 text-sm text-gray-700">
                            <Phone className="h-3.5 w-3.5 text-gray-400" />
                            {biz.phone_number || 'No configurado'}
                          </div>
                        </td>
                        <td className="whitespace-nowrap px-6 py-4">
                          <div className="flex items-center gap-1.5 text-sm text-gray-700">
                            <MessageSquare className="h-3.5 w-3.5 text-gray-400" />
                            {biz.whatsapp_phone || 'No configurado'}
                          </div>
                        </td>
                        <td className="whitespace-nowrap px-6 py-4">
                          <div className="flex items-center gap-1.5 text-sm text-gray-700 font-mono">
                            {biz.timezone}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="p-12 text-center">
                  <Building2 className="mx-auto h-12 w-12 text-gray-200" />
                  <p className="mt-4 text-gray-500 font-medium">No se encontraron negocios para este usuario.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Sidebar info */}
        <div className="space-y-6">
          {/* Quick Stats Card */}
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <h3 className="mb-4 text-sm font-bold uppercase tracking-wider text-gray-400">Actividad Reciente</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">Último Acceso</span>
                <span className="text-sm font-semibold text-gray-900">{formatDate(last_sign_in).split(',')[0]}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">Total Leads</span>
                <span className="text-sm font-semibold text-gray-900">{leads_count}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">Empresas</span>
                <span className="text-sm font-semibold text-gray-900">{businesses.length}</span>
              </div>
            </div>
            
            <hr className="my-6 border-gray-100" />
            
            <div className="space-y-3">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Acciones Rápidas</p>
              <button className="flex w-full items-center justify-center gap-2 rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-bold text-white shadow-lg transition-all hover:bg-violet-700 hover:shadow-violet-200 active:scale-95">
                Enviar Notificación
              </button>
              <button className="flex w-full items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-bold text-gray-700 transition-all hover:bg-gray-50">
                Editar Perfil
              </button>
            </div>
          </div>

          {/* Integration Status */}
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <h3 className="mb-4 text-sm font-bold uppercase tracking-wider text-gray-400">Sistemas Internos</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-2 rounded-lg bg-emerald-50 text-emerald-700 text-xs font-bold">
                AUTH SYSTEM - SYNCED
                <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-blue-50 text-blue-700 text-xs font-bold">
                RETELL API - READY
                <div className="h-1.5 w-1.5 rounded-full bg-blue-500" />
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-gray-50 text-gray-500 text-xs font-bold">
                STRIPE ID: {subscription?.stripe_customer_id ? 'CONNECTED' : 'NOT CONNECTED'}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
