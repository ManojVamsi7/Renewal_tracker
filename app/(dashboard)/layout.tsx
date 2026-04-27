'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { AppLayout } from '@/components/layout/app-layout'
import { ClientProvider } from '@/components/clients/client-context'
import { PaymentProvider } from '@/components/payments/payment-context'
import { useAuth } from '@/lib/auth-context'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login')
    }
  }, [user, loading, router])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary" />
      </div>
    )
  }

  if (!user) return null

  return (
    <ClientProvider>
      <PaymentProvider>
        <AppLayout>{children}</AppLayout>
      </PaymentProvider>
    </ClientProvider>
  )
}
