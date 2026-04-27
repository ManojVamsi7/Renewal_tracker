'use client'

import { useState } from 'react'
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
  ChevronLeft,
  ChevronRight
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
  const [isCollapsed, setIsCollapsed] = useState(false)

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
    <aside className={cn(
      "hidden lg:flex relative border-r border-border bg-sidebar text-sidebar-foreground flex-col h-screen transition-all duration-300",
      isCollapsed ? "w-20" : "w-64"
    )}>
      <button 
        onClick={() => setIsCollapsed(!isCollapsed)} 
        className="absolute -right-3 top-6 p-1 rounded-full bg-sidebar border border-border shadow-sm z-10 hover:bg-sidebar-accent text-sidebar-foreground"
        title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
      >
        {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
      </button>

      <div className={cn("border-b border-sidebar-border flex items-center h-20", isCollapsed ? "justify-center p-4" : "p-4 lg:p-6")}>
        {!isCollapsed && <h1 className="text-xl lg:text-2xl font-bold text-sidebar-primary truncate">PaymentTracker</h1>}
        {isCollapsed && <h1 className="text-xl font-bold text-sidebar-primary">PT</h1>}
      </div>

      <nav className="flex-1 overflow-y-auto p-4 space-y-2 overflow-x-hidden">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive =
            pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href))

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 py-2 rounded-lg transition-colors',
                isActive
                  ? 'bg-sidebar-primary text-sidebar-primary-foreground'
                  : 'hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
                isCollapsed ? 'justify-center px-2' : 'px-4'
              )}
              title={isCollapsed ? item.label : undefined}
            >
              <Icon className="w-5 h-5 shrink-0" />
              {!isCollapsed && <span className="font-medium truncate">{item.label}</span>}
            </Link>
          )
        })}
      </nav>

      <div className="p-4 border-t border-sidebar-border">
        <button
          onClick={handleLogout}
          className={cn(
            "w-full flex items-center gap-3 py-2 rounded-lg hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors",
            isCollapsed ? "justify-center px-2" : "text-left px-4"
          )}
          title={isCollapsed ? "Logout" : undefined}
        >
          <LogOut className="w-5 h-5 shrink-0" />
          {!isCollapsed && <span className="font-medium truncate">Logout</span>}
        </button>
      </div>
    </aside>
  )
}
