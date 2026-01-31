import { Sidebar } from '@/components/layout/Sidebar'
import { Toaster } from '@/components/ui/sonner'

export default function MainLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex h-screen liquid-bg">
      <Sidebar />
      <main className="flex-1 overflow-auto relative z-10">
        <div className="p-8">
          {children}
        </div>
      </main>
      <Toaster />
    </div>
  )
}
