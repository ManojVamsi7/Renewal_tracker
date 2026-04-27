'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'
import { Lock, Mail } from 'lucide-react'
import { useAuth } from '@/lib/auth-context'

export default function LoginPage() {
  const router = useRouter()
  const { signIn, user, loading } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  // Redirect if already authenticated
  useEffect(() => {
    if (!loading && user) {
      router.push('/')
    }
  }, [user, loading, router])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      await signIn(email, password)
      toast.success('Login successful!')
      router.push('/')
    } catch {
      toast.error('Invalid email or password')
    } finally {
      setIsLoading(false)
    }
  }

  // Show nothing while checking existing session
  if (loading) return null

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="border-slate-700 bg-slate-900/50 backdrop-blur">
          <CardHeader className="space-y-2 text-center">
            <div className="flex justify-center mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
                <Lock className="w-6 h-6 text-white" />
              </div>
            </div>
            <CardTitle className="text-2xl text-white">Welcome</CardTitle>
            <CardDescription className="text-slate-400">
              Sign in to your account to continue
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium text-slate-200">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="hr@gmail.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 bg-slate-800 border-slate-700 text-white placeholder:text-slate-500"
                    disabled={isLoading}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-medium text-slate-200">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 bg-slate-800 border-slate-700 text-white placeholder:text-slate-500"
                    disabled={isLoading}
                    required
                  />
                </div>
              </div>

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-semibold py-2"
                disabled={isLoading}
              >
                {isLoading ? 'Signing in...' : 'Sign In'}
              </Button>

              <div className="mt-6 p-4 bg-slate-800/50 rounded-lg border border-slate-700">
                <p className="text-xs text-slate-400 mb-2 font-semibold">Demo Credentials:</p>
                <p className="text-xs text-slate-300 mb-1">Email: <span className="font-mono text-blue-400">hr@gmail.com</span></p>
                <p className="text-xs text-slate-300">Password: <span className="font-mono text-blue-400">123456789</span></p>
              </div>
            </form>
          </CardContent>
        </Card>

        <p className="text-center text-slate-400 text-sm mt-6">
          Dashboard Management System
        </p>
      </div>
    </div>
  )
}
