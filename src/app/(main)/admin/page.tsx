import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { isAdmin, getAllUsersWithSubscriptions, getSubscriptionPlans } from '@/features/subscriptions/services/subscription.service'
import { AdminGuard } from '@/features/admin/components/AdminGuard'
import { UsersTable } from '@/features/admin/components/UsersTable'
import { Shield, Users, CreditCard, TrendingUp, Building2 } from 'lucide-react'

export default async function AdminPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const adminStatus = await isAdmin()

  if (!adminStatus) {
    return <AdminGuard isAdmin={false}>{null}</AdminGuard>
  }

  const [users, plans] = await Promise.all([
    getAllUsersWithSubscriptions(),
    getSubscriptionPlans(),
  ])

  // Calculate stats
  const totalUsers = users?.length || 0
  const adminCount = users?.filter(u => u.role === 'admin').length || 0
  const activeSubscriptions = users?.filter(u =>
    u.subscription && ['active', 'trial'].includes(u.subscription.status)
  ).length || 0

  // Revenue calculation (simplified)
  const monthlyRevenue = users?.reduce((acc, user) => {
    if (user.subscription?.status === 'active') {
      const plan = plans.find(p => p.id === user.subscription?.plan_id)
      return acc + (plan?.price_monthly || 0)
    }
    return acc
  }, 0) || 0

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 shadow-lg">
          <Shield className="h-6 w-6 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Panel de Administracion</h1>
          <p className="text-gray-600">Gestiona usuarios, suscripciones y configuraciones</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Usuarios"
          value={totalUsers}
          icon={Users}
          gradient="from-sky-400 to-sky-600"
        />
        <StatCard
          title="Administradores"
          value={adminCount}
          icon={Shield}
          gradient="from-violet-400 to-purple-600"
        />
        <StatCard
          title="Suscripciones Activas"
          value={activeSubscriptions}
          icon={CreditCard}
          gradient="from-emerald-400 to-green-600"
        />
        <StatCard
          title="Ingresos Mensuales"
          value={`$${monthlyRevenue.toLocaleString()}`}
          icon={TrendingUp}
          gradient="from-amber-400 to-orange-500"
        />
      </div>

      {/* Plans overview */}
      <div className="rounded-xl border border-gray-200 bg-white p-6">
        <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-gray-900">
          <CreditCard className="h-5 w-5 text-violet-600" />
          Planes Disponibles
        </h2>
        <div className="grid gap-4 md:grid-cols-3">
          {plans.filter(p => p.name !== 'enterprise').map((plan) => (
            <div
              key={plan.id}
              className="rounded-lg border border-gray-100 bg-gray-50 p-4"
            >
              <h3 className="font-medium text-gray-900">{plan.display_name}</h3>
              <p className="mt-1 text-2xl font-bold text-gray-900">
                ${plan.price_monthly}
                <span className="text-sm font-normal text-gray-500">/mes</span>
              </p>
              <p className="mt-2 text-sm text-gray-500">{plan.description}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {plan.has_messaging && (
                  <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs text-emerald-700">
                    Mensajeria
                  </span>
                )}
                {plan.has_voice && (
                  <span className="rounded-full bg-violet-100 px-2 py-0.5 text-xs text-violet-700">
                    Voz
                  </span>
                )}
                {plan.has_analytics && (
                  <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs text-amber-700">
                    Analytics
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Users table */}
      <UsersTable
        users={users?.map(u => ({
          id: u.id,
          email: u.email,
          full_name: u.full_name,
          role: u.role as 'admin' | 'user',
          created_at: u.created_at,
          subscription: u.subscription?.[0] ? {
            status: u.subscription[0].status,
            plan: u.subscription[0].plan as { name: string; display_name: string },
          } : null,
        })) || []}
      />
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
