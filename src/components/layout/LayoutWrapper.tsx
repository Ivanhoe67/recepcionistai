'use client'

import { useState } from 'react'
import { Sidebar } from './Sidebar'
import { MobileHeader } from './MobileHeader'
import { UserPlanFeatures } from '@/lib/database.types'

interface LayoutWrapperProps {
  children: React.ReactNode
  planFeatures?: UserPlanFeatures | null
}

export function LayoutWrapper({ children, planFeatures }: LayoutWrapperProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen)
  const closeSidebar = () => setSidebarOpen(false)

  return (
    <div className="flex h-screen liquid-bg">
      {/* Mobile Header - only visible on mobile */}
      <MobileHeader isOpen={sidebarOpen} onToggle={toggleSidebar} />

      {/* Sidebar */}
      <Sidebar
        planFeatures={planFeatures}
        isOpen={sidebarOpen}
        onClose={closeSidebar}
      />

      {/* Main Content */}
      <main className="flex-1 overflow-auto relative z-10 pt-16 md:pt-0">
        <div className="p-4 md:p-8">
          {children}
        </div>
      </main>
    </div>
  )
}
