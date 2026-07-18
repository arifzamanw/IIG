'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { Building2, Home, Users, LogOut, LayoutDashboard, Star } from 'lucide-react'
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

  const navItems = [
    { name: 'Dashboard', href: '/dashboard', icon: Home },
    { name: 'Developers', href: '/cms/developers', icon: Users },
    { name: 'Projects', href: '/cms/projects', icon: LayoutDashboard },
    { name: 'Amenities', href: '/cms/amenities', icon: Star },
  ]

  return (
    <aside className="w-64 bg-white border-r border-neutral-200 hidden md:flex flex-col">
      <div className="h-16 flex items-center px-6 border-b border-neutral-200">
        <Building2 className="w-6 h-6 text-red-600 mr-2" />
        <span className="font-bold text-lg tracking-tight">Invest Georgia</span>
      </div>
      
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname.startsWith(item.href)
          return (
            <Link 
              key={item.name} 
              href={item.href} 
              className={`flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                isActive 
                  ? 'bg-red-50 text-red-600' 
                  : 'text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900'
              }`}
            >
              <Icon className={`w-5 h-5 mr-3 ${isActive ? 'text-red-600' : 'text-neutral-400'}`} />
              {item.name}
            </Link>
          )
        })}
      </nav>
      
      <div className="p-4 border-t border-neutral-200">
        <button 
          onClick={() => logoutMutation.mutate()}
          className="flex items-center w-full px-3 py-2 text-sm font-medium rounded-md text-neutral-600 hover:bg-red-50 hover:text-red-600 transition-colors"
        >
          <LogOut className="w-5 h-5 mr-3 text-neutral-400 group-hover:text-red-600" />
          Sign out
        </button>
      </div>
    </aside>
  )
}
