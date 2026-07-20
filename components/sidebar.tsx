'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { Building2, Home, Users, LogOut, LayoutDashboard, Star, ShieldCheck, UserCircle, FileText, Settings, PanelLeft, FileCode } from 'lucide-react'
import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'

export function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()

  const logoutMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch('/api/auth/logout', { method: 'POST' })
      if (!res.ok) throw new Error('Logout failed')
    },
    onSuccess: () => {
      router.push('/login')
    },
    onError: () => {
      toast.error('Failed to logout')
    }
  })

  const mainNav = [
    { name: 'Dashboard', href: '/dashboard', icon: Home },
    { name: 'Customers', href: '/cms/customers', icon: UserCircle },
    { name: 'Proposals', href: '/proposals', icon: FileText },
  ]

  const cmsNav = [
    { name: 'Developers', href: '/cms/developers', icon: Users },
    { name: 'Projects', href: '/cms/projects', icon: LayoutDashboard },
    { name: 'Templates', href: '/cms/templates', icon: FileCode },
    { name: 'Amenities', href: '/cms/amenities', icon: Star },
  ]

  const settingsNav = [
    { name: 'Users', href: '/cms/users', icon: ShieldCheck },
    { name: 'Settings', href: '/settings', icon: Settings },
  ]

  return (
    <aside className="w-64 h-full bg-white rounded-3xl shadow-sm hidden md:flex flex-col overflow-hidden relative">
      <div className="h-24 flex items-center px-8">
        <div className="flex items-center gap-2 text-blue-600">
          <Building2 className="w-7 h-7" fill="currentColor" />
          <span className="font-extrabold text-xl tracking-tight text-neutral-900">IIG<span className="text-blue-600">.</span></span>
        </div>
        <button className="ml-auto text-neutral-400 hover:text-neutral-900">
          <PanelLeft className="w-5 h-5" />
        </button>
      </div>
      
      <div className="flex-1 overflow-y-auto px-4 py-2 space-y-8 custom-scrollbar">
        {/* Main Section */}
        <div>
          <p className="px-4 text-[11px] font-bold uppercase tracking-wider text-neutral-400 mb-3">Main</p>
          <nav className="space-y-1">
            {mainNav.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
              return (
                <Link 
                  key={item.name} 
                  href={item.href} 
                  className={`flex items-center px-4 py-3 text-sm font-semibold rounded-xl transition-all ${
                    isActive 
                      ? 'bg-blue-100 text-blue-600' 
                      : 'text-neutral-500 hover:bg-neutral-50 hover:text-neutral-900'
                  }`}
                >
                  <Icon className={`w-5 h-5 mr-3 ${isActive ? 'text-blue-600' : 'text-neutral-400'}`} />
                  {item.name}
                </Link>
              )
            })}
          </nav>
        </div>

        {/* CMS Section */}
        <div>
          <p className="px-4 text-[11px] font-bold uppercase tracking-wider text-neutral-400 mb-3">Catalog</p>
          <nav className="space-y-1">
            {cmsNav.map((item) => {
              const Icon = item.icon
              const isActive = pathname.startsWith(item.href)
              return (
                <Link 
                  key={item.name} 
                  href={item.href} 
                  className={`flex items-center px-4 py-3 text-sm font-semibold rounded-xl transition-all ${
                    isActive 
                      ? 'bg-blue-100 text-blue-600' 
                      : 'text-neutral-500 hover:bg-neutral-50 hover:text-neutral-900'
                  }`}
                >
                  <Icon className={`w-5 h-5 mr-3 ${isActive ? 'text-blue-600' : 'text-neutral-400'}`} />
                  {item.name}
                </Link>
              )
            })}
          </nav>
        </div>

        {/* Settings Section */}
        <div>
          <p className="px-4 text-[11px] font-bold uppercase tracking-wider text-neutral-400 mb-3">Setting</p>
          <nav className="space-y-1">
            {settingsNav.map((item) => {
              const Icon = item.icon
              const isActive = pathname.startsWith(item.href)
              return (
                <Link 
                  key={item.name} 
                  href={item.href} 
                  className={`flex items-center px-4 py-3 text-sm font-semibold rounded-xl transition-all ${
                    isActive 
                      ? 'bg-blue-100 text-blue-600' 
                      : 'text-neutral-500 hover:bg-neutral-50 hover:text-neutral-900'
                  }`}
                >
                  <Icon className={`w-5 h-5 mr-3 ${isActive ? 'text-blue-600' : 'text-neutral-400'}`} />
                  {item.name}
                </Link>
              )
            })}
          </nav>
        </div>
      </div>
      
      <div className="p-4 mb-2">
        <button 
          onClick={() => logoutMutation.mutate()}
          className="flex items-center w-full px-4 py-3 text-sm font-bold rounded-xl text-red-600 hover:bg-red-50 transition-colors"
        >
          <LogOut className="w-5 h-5 mr-3 text-red-600" />
          Sign-Out
        </button>
      </div>
    </aside>
  )
}
