'use client'

import { ThemeProvider } from 'next-themes'
import { Toaster } from 'sonner'
import { AuthProvider } from '@/lib/auth-context'

export function RootLayoutClient({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
      <AuthProvider>
        {children}
      </AuthProvider>
      <Toaster />
    </ThemeProvider>
  )
}
