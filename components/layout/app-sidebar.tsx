'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  LayoutDashboard,
  Users,
  Calendar,
  CreditCard,
  BarChart3,
  Bell,
  LogOut,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuth } from '@/lib/auth-context'
import { toast } from 'sonner'

const navItems = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/clients', label: 'Clients', icon: Users },
  { href: '/renewals', label: 'Renewals', icon: Calendar },
  { href: '/payments', label: 'Payments', icon: CreditCard },
  { href: '/reports', label: 'Reports', icon: BarChart3 },
  { href: '/notifications', label: 'Notifications', icon: Bell },
]

export function AppSidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const { signOut } = useAuth()

  const handleLogout = async () => {
    try {
      await signOut()
      toast.success('Logged out successfully')
      router.push('/login')
    } catch {
      toast.error('Failed to log out')
    }
  }

  return (
    <aside className="hidden lg:flex lg:w-64 border-r border-border bg-sidebar text-sidebar-foreground flex-col h-screen">
      <div className="p-4 lg:p-6 border-b border-sidebar-border">
        <h1 className="text-xl lg:text-2xl font-bold text-sidebar-primary">PaymentTracker</h1>
      </div>

      <nav className="flex-1 overflow-y-auto p-4 space-y-2">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive =
            pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href))

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-4 py-2 rounded-lg transition-colors',
                isActive
                  ? 'bg-sidebar-primary text-sidebar-primary-foreground'
                  : 'hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
              )}
            >
              <Icon className="w-5 h-5" />
              <span className="font-medium">{item.label}</span>
            </Link>
          )
        })}
      </nav>

      <div className="p-4 border-t border-sidebar-border">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors text-left"
        >
          <LogOut className="w-5 h-5" />
          <span className="font-medium">Logout</span>
        </button>
      </div>
    </aside>
  )
}
