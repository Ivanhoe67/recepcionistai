'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import {
  Users,
  Shield,
  User,
  Mail,
  Calendar,
  Building2,
  CreditCard,
  MoreVertical,
  Crown,
  UserCheck,
  Eye,
} from 'lucide-react'
import Link from 'next/link'

interface UserWithSubscription {
  id: string
  email: string
  full_name: string | null
  role: 'admin' | 'user'
  created_at: string
  subscription?: {
    status: string
    plan: {
      name: string
      display_name: string
    }
  } | null
}

interface UsersTableProps {
  users: UserWithSubscription[]
  onUpdateRole?: (userId: string, role: 'admin' | 'user') => void
  onAssignPlan?: (userId: string) => void
}

export function UsersTable({ users, onUpdateRole, onAssignPlan }: UsersTableProps) {
  const t = useTranslations('Admin')
  const [selectedUser, setSelectedUser] = useState<string | null>(null)

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'active': return 'bg-emerald-100 text-emerald-700'
      case 'trial': return 'bg-amber-100 text-amber-700'
      case 'cancelled': return 'bg-red-100 text-red-700'
      case 'expired': return 'bg-gray-100 text-gray-700'
      default: return 'bg-gray-100 text-gray-500'
    }
  }

  const getRoleIcon = (role: string) => {
    return role === 'admin' ? Shield : User
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  return (
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
                {t('users.table.registration')}
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
                {t('users.table.actions')}
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {users.map((user) => {
              const RoleIcon = getRoleIcon(user.role)
              const subscription = user.subscription
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
                      <RoleIcon className="h-3 w-3" />
                      {user.role === 'admin' ? t('users.roles.admin') : t('users.roles.user')}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    {subscription ? (
                      <div className="space-y-1">
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-violet-100 to-purple-100 px-3 py-1 text-xs font-medium text-violet-700">
                          <Crown className="h-3 w-3" />
                          {subscription.plan.display_name}
                        </span>
                        <span className={`ml-2 inline-flex items-center rounded-full px-2 py-0.5 text-xs ${getStatusColor(subscription.status)}`}>
                          {subscription.status}
                        </span>
                      </div>
                    ) : (
                      <span className="text-sm text-gray-400">{t('users.noPlan')}</span>
                    )}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    <span className="flex items-center gap-1.5 text-sm text-gray-500">
                      <Calendar className="h-3.5 w-3.5" />
                      {formatDate(user.created_at)}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-right">
                    <div className="relative inline-block">
                      <button
                        onClick={() => setSelectedUser(isMenuOpen ? null : user.id)}
                        className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
                      >
                        <MoreVertical className="h-4 w-4" />
                      </button>

                      {isMenuOpen && (
                        <>
                          <div
                            className="fixed inset-0 z-10"
                            onClick={() => setSelectedUser(null)}
                          />
                          <div className="absolute right-0 z-20 mt-2 w-48 rounded-lg border border-gray-200 bg-white py-1 shadow-lg">
                            <Link
                              href={`/admin/users/${user.id}`}
                              className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50"
                            >
                              <Eye className="h-4 w-4" />
                              {t('users.actions.viewProfile')}
                            </Link>
                            <button
                              onClick={() => {
                                onUpdateRole?.(user.id, user.role === 'admin' ? 'user' : 'admin')
                                setSelectedUser(null)
                              }}
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
                                onAssignPlan?.(user.id)
                                setSelectedUser(null)
                              }}
                              className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50"
                            >
                              <CreditCard className="h-4 w-4" />
                              {t('users.actions.assignPlan')}
                            </button>
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
  )
}
