export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen liquid-bg flex items-center justify-center p-4">
      <div className="relative z-10 w-full max-w-md">
        {children}
      </div>
    </div>
  )
}
