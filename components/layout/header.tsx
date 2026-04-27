'use client'

import { Moon, Sun, Menu, Bell, LogOut } from 'lucide-react'
import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { format } from 'date-fns'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { AppSidebar } from './app-sidebar'
import { useClients } from '@/components/clients/client-context'
import { usePayments } from '@/components/payments/payment-context'
import { getClientsNeedingRenewal } from '@/lib/calculations'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import Link from 'next/link'
import { useAuth } from '@/lib/auth-context'

export function Header() {
  const { theme, setTheme } = useTheme()
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const { clients } = useClients()
  const { payments } = usePayments()
  
  const pendingRenewals = getClientsNeedingRenewal(clients, payments).length

  const { signOut } = useAuth()

  const handleLogout = async () => {
    try {
      await signOut()
      toast.success('Logged out successfully')
      router.push('/login')
    } catch (error) {
      toast.error('Logout failed')
    }
  }

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  return (
    <>
      <header className="border-b border-border bg-card px-4 lg:px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4 flex-1">
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="lg:hidden p-2 hover:bg-muted rounded-lg transition-colors"
            aria-label="Open menu"
          >
            <Menu className="w-5 h-5" />
          </button>
          <p className="text-sm text-muted-foreground hidden sm:block">
            {format(new Date(), 'EEEE, MMMM d, yyyy')}
          </p>
        </div>

        <div className="flex items-center gap-2 lg:gap-4">
          <Link href="/notifications" className="relative p-2 hover:bg-muted rounded-lg transition-colors" aria-label="View notifications">
            <Bell className="w-5 h-5" />
            {pendingRenewals > 0 && (
              <span className="absolute top-1 right-1 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-600 rounded-full">
                {pendingRenewals}
              </span>
            )}
          </Link>
          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="p-2 hover:bg-muted rounded-lg transition-colors"
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? (
              <Sun className="w-5 h-5" />
            ) : (
              <Moon className="w-5 h-5" />
            )}
          </button>
          <div className="hidden sm:flex pl-2 lg:pl-4 border-l border-border items-center gap-4">
            <span className="text-sm font-medium">Admin</span>
            <Button
              onClick={handleLogout}
              variant="ghost"
              size="sm"
              className="gap-2 text-muted-foreground hover:text-foreground"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden md:inline">Logout</span>
            </Button>
          </div>
        </div>
      </header>

      <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
        <SheetContent side="left" className="w-64 p-0">
          <SheetHeader className="border-b border-sidebar-border p-4">
            <SheetTitle>PaymentTracker</SheetTitle>
          </SheetHeader>
          <div className="overflow-y-auto">
            <AppSidebarContent />
          </div>
        </SheetContent>
      </Sheet>
    </>
  )
}

function AppSidebarContent() {
  const pathname = ''
  
  const navItems = [
    { href: '/', label: 'Dashboard', icon: '📊' },
    { href: '/clients', label: 'Clients', icon: '👥' },
    { href: '/renewals', label: 'Renewals', icon: '📅' },
    { href: '/payments', label: 'Payments', icon: '💳' },
    { href: '/reports', label: 'Reports', icon: '📈' },
    { href: '/notifications', label: 'Notifications', icon: '🔔' },
  ]

  return (
    <nav className="p-4 space-y-2">
      {navItems.map((item) => (
        <a
          key={item.href}
          href={item.href}
          className="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-sidebar-accent transition-colors"
        >
          <span>{item.icon}</span>
          <span className="font-medium">{item.label}</span>
        </a>
      ))}
    </nav>
  )
}
