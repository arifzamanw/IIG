import { Sidebar } from '@/components/sidebar'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-neutral-50">
      <Sidebar />

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-y-auto">
        {/* Mobile Header */}
        <header className="h-16 bg-white border-b border-neutral-200 flex items-center justify-between px-6 md:hidden">
          <span className="font-bold text-lg tracking-tight">Invest Georgia</span>
        </header>
        
        <div className="flex-1 p-8">
          {children}
        </div>
      </main>
    </div>
  )
}
