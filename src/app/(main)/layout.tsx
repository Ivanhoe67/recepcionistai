import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getUserPlanFeatures } from '@/features/subscriptions/services/subscription.service'
import { Sidebar } from '@/components/layout/Sidebar'
import { Toaster } from '@/components/ui/sonner'

export default async function MainLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Check authentication
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Get user's plan features for sidebar
  const planFeatures = await getUserPlanFeatures()

  return (
    <div className="flex h-screen liquid-bg">
      <Sidebar planFeatures={planFeatures} />
      <main className="flex-1 overflow-auto relative z-10">
        <div className="p-8">
          {children}
        </div>
      </main>
      <Toaster />
    </div>
  )
}
