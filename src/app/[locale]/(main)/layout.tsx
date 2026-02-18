import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getUserPlanFeatures } from '@/features/subscriptions/services/subscription.service'
import { LayoutWrapper } from '@/components/layout/LayoutWrapper'
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
    <>
      <LayoutWrapper planFeatures={planFeatures}>
        {children}
      </LayoutWrapper>
      <Toaster />
    </>
  )
}
