'use client'

import { useState, useTransition } from 'react'
import { useTranslations } from 'next-intl'
import {
  Shield,
  Users,
  CreditCard,
  TrendingUp,
  Calendar,
  Phone,
  Mail,
  MoreVertical,
  User,
  Crown,
  Loader2,
  Building2,
  Eye,
} from 'lucide-react'
import Link from 'next/link'
import { updateUserRole } from '../services/admin.service'
import { AssignPlanModal } from './AssignPlanModal'

interface UserData {
  id: string
  email: string
  full_name: string | null
  avatar_url: string | null
  role: string
  created_at: string
  last_sign_in: string | null
  subscription: {
    id: string
    status: string
    plan: {
      id: string
      name: string
      display_name: string
      price_monthly: number | null
    } | null
  } | null
  business_count: number
}

interface Plan {
  id: string
  name: string
  display_name: string
  description: string | null
  price_monthly: number | null
  has_messaging: boolean | null
  has_voice: boolean | null
  has_analytics: boolean | null
}

interface Stats {
  total_users: number
  admin_count: number
  active_subscriptions: number
  mrr: number
  leads_this_month: number
  appointments_this_month: number
}

interface AdminDashboardProps {
  users: UserData[]
  plans: Plan[]
  stats: Stats
}

export function AdminDashboard({ users, plans, stats }: AdminDashboardProps) {
  const t = useTranslations('Admin')
  const [selectedUser, setSelectedUser] = useState<string | null>(null)
  const [assignPlanUser, setAssignPlanUser] = useState<UserData | null>(null)
  const [isPending, startTransition] = useTransition()

  const handleRoleChange = (userId: string, newRole: 'admin' | 'user') => {
    startTransition(async () => {
      await updateUserRole(userId, newRole)
      setSelectedUser(null)
    })
  }

  const formatDate = (date: string | null) => {
    if (!date) return 'Never'
    return new Date(date).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
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
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 shadow-lg">
          <Shield className="h-6 w-6 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t('title')}</h1>
          <p className="text-gray-600">{t('subtitle')}</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title={t('stats.totalUsers')}
          value={stats.total_users}
          icon={Users}
          gradient="from-sky-400 to-sky-600"
        />
        <StatCard
          title={t('stats.activeSubscriptions')}
          value={stats.active_subscriptions}
          icon={CreditCard}
          gradient="from-emerald-400 to-green-600"
        />
        <StatCard
          title={t('stats.mrr')}
          value={`$${stats.mrr.toLocaleString()}`}
          icon={TrendingUp}
          gradient="from-amber-400 to-orange-500"
        />
        <StatCard
          title={t('stats.leadsMonth')}
          value={stats.leads_this_month}
          icon={Phone}
          gradient="from-violet-400 to-purple-600"
        />
      </div>

      {/* Plans overview */}
      <div className="rounded-xl border border-gray-200 bg-white p-6">
        <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-gray-900">
          <CreditCard className="h-5 w-5 text-violet-600" />
          {t('plans.title')}
        </h2>
        <div className="grid gap-4 md:grid-cols-4">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className="rounded-lg border border-gray-100 bg-gray-50 p-4"
            >
              <h3 className="font-medium text-gray-900">{plan.display_name}</h3>
              <p className="mt-1 text-2xl font-bold text-gray-900">
                {plan.price_monthly ? (
                  <>
                    ${plan.price_monthly}
                    <span className="text-sm font-normal text-gray-500">{t('plans.perMonth')}</span>
                  </>
                ) : (
                  <span className="text-base">{t('plans.custom')}</span>
                )}
              </p>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {plan.has_messaging && (
                  <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs text-emerald-700">
                    {t('plans.features.messaging')}
                  </span>
                )}
                {plan.has_voice && (
                  <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs text-blue-700">
                    {t('plans.features.voice')}
                  </span>
                )}
                {plan.has_analytics && (
                  <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs text-amber-700">
                    {t('plans.features.analytics')}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Users table */}
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="border-b border-gray-200 bg-gray-50 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-violet-100">
              <Users className="h-5 w-5 text-violet-600" />
            </div>
            <div>
              <h2 className="font-semibold text-gray-900">{t('users.title')}</h2>
              <p className="text-sm text-gray-500">{t('users.registeredCount', { count: users.length })}</p>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/50">
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  {t('users.table.user')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  {t('users.table.role')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  {t('users.table.plan')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  {t('users.table.businessCount')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  {t('users.table.lastSignIn')}
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
                  {t('users.table.actions')}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {users.map((user) => {
                const isMenuOpen = selectedUser === user.id

                return (
                  <tr key={user.id} className="transition-colors hover:bg-gray-50">
                    <td className="whitespace-nowrap px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-violet-400 to-purple-500 font-semibold text-white">
                          {user.full_name?.[0] || user.email[0].toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">
                            {user.full_name || t('users.noName')}
                          </p>
                          <p className="flex items-center gap-1 text-sm text-gray-500">
                            <Mail className="h-3 w-3" />
                            {user.email}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ${user.role === 'admin'
                        ? 'bg-violet-100 text-violet-700'
                        : 'bg-gray-100 text-gray-700'
                        }`}>
                        {user.role === 'admin' ? (
                          <Shield className="h-3 w-3" />
                        ) : (
                          <User className="h-3 w-3" />
                        )}
                        {user.role === 'admin' ? t('users.roles.admin') : t('users.roles.user')}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      {user.subscription?.plan ? (
                        <div className="space-y-1">
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-violet-100 to-purple-100 px-3 py-1 text-xs font-medium text-violet-700">
                            <Crown className="h-3 w-3" />
                            {user.subscription.plan.display_name}
                          </span>
                          <span className={`ml-2 inline-flex items-center rounded-full px-2 py-0.5 text-xs ${getStatusColor(user.subscription.status)}`}>
                            {user.subscription.status}
                          </span>
                        </div>
                      ) : (
                        <span className="text-sm text-gray-400">{t('users.noPlan')}</span>
                      )}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      <span className="flex items-center gap-1.5 text-sm text-gray-600">
                        <Building2 className="h-3.5 w-3.5" />
                        {user.business_count}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      <span className="flex items-center gap-1.5 text-sm text-gray-500">
                        <Calendar className="h-3.5 w-3.5" />
                        {formatDate(user.last_sign_in)}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-right">
                      <div className="relative inline-block">
                        <button
                          onClick={() => setSelectedUser(isMenuOpen ? null : user.id)}
                          disabled={isPending}
                          className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 disabled:opacity-50"
                        >
                          {isPending && selectedUser === user.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <MoreVertical className="h-4 w-4" />
                          )}
                        </button>

                        {isMenuOpen && (
                          <>
                            <div
                              className="fixed inset-0 z-10"
                              onClick={() => setSelectedUser(null)}
                            />
                            <div className="absolute right-0 z-20 mt-2 w-48 rounded-lg border border-gray-200 bg-white py-1 shadow-lg">
                              <button
                                onClick={() => handleRoleChange(user.id, user.role === 'admin' ? 'user' : 'admin')}
                                className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50"
                              >
                                {user.role === 'admin' ? (
                                  <>
                                    <User className="h-4 w-4" />
                                    {t('users.actions.toUser')}
                                  </>
                                ) : (
                                  <>
                                    <Shield className="h-4 w-4" />
                                    {t('users.actions.toAdmin')}
                                  </>
                                )}
                              </button>
                              <button
                                onClick={() => {
                                  setAssignPlanUser(user)
                                  setSelectedUser(null)
                                }}
                                className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50"
                              >
                                <CreditCard className="h-4 w-4" />
                                {t('users.actions.assignPlan')}
                              </button>
                              <Link
                                href={`/admin/users/${user.id}`}
                                className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50"
                              >
                                <Eye className="h-4 w-4" />
                                {t('users.actions.viewDetails')}
                              </Link>
                            </div>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Assign Plan Modal */}
      {assignPlanUser && (
        <AssignPlanModal
          isOpen={true}
          onClose={() => setAssignPlanUser(null)}
          userId={assignPlanUser.id}
          userName={assignPlanUser.full_name || assignPlanUser.email}
          plans={plans}
          currentPlanId={assignPlanUser.subscription?.plan?.id}
        />
      )}
    </div>
  )
}

interface StatCardProps {
  title: string
  value: string | number
  icon: React.ComponentType<{ className?: string }>
  gradient: string
}

function StatCard({ title, value, icon: Icon, gradient }: StatCardProps) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <p className="mt-1 text-2xl font-bold text-gray-900">{value}</p>
        </div>
        <div className={`flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${gradient} shadow-lg`}>
          <Icon className="h-6 w-6 text-white" />
        </div>
      </div>
    </div>
  )
}
