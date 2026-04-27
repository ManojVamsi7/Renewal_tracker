'use client'

import { useClients } from '@/components/clients/client-context'
import { usePayments } from '@/components/payments/payment-context'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { getClientRenewalDaysUntil, getRenewalStatus, getClientsNeedingRenewal } from '@/lib/calculations'
import { format } from 'date-fns'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { AlertCircle, Calendar } from 'lucide-react'

export default function RenewalsPage() {
  const { clients } = useClients()
  const { payments } = usePayments()
  
  // Filter out clients who have paid
  const clientsNeedingRenewal = getClientsNeedingRenewal(clients, payments)
  
  const overdueRenewals = clientsNeedingRenewal
    .filter(c => getClientRenewalDaysUntil(c) < 0)
    .sort((a, b) => getClientRenewalDaysUntil(a) - getClientRenewalDaysUntil(b))

  const urgentRenewals = clientsNeedingRenewal
    .filter(c => {
      const daysUntil = getClientRenewalDaysUntil(c)
      return daysUntil >= 0 && daysUntil <= 3
    })
    .sort((a, b) => getClientRenewalDaysUntil(a) - getClientRenewalDaysUntil(b))

  const upcomingRenewals = clientsNeedingRenewal
    .filter(c => {
      const daysUntil = getClientRenewalDaysUntil(c)
      return daysUntil > 3 && daysUntil <= 30
    })
    .sort((a, b) => getClientRenewalDaysUntil(a) - getClientRenewalDaysUntil(b))

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Renewals Overview</h1>
        <p className="text-muted-foreground mt-2">
          Manage all client renewals and track renewal status
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Overdue Renewals</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-600">{overdueRenewals.length}</div>
            <p className="text-xs text-muted-foreground mt-1">Need immediate attention</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Due Soon (Next 3 Days)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-orange-600">{urgentRenewals.length}</div>
            <p className="text-xs text-muted-foreground mt-1">Action required soon</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Upcoming (Next 30 Days)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">{upcomingRenewals.length}</div>
            <p className="text-xs text-muted-foreground mt-1">Plan ahead</p>
          </CardContent>
        </Card>
      </div>

      {/* Overdue Renewals */}
      {overdueRenewals.length > 0 && (
        <Card className="border-red-200 bg-red-50 dark:bg-red-950/20 dark:border-red-900">
          <CardHeader>
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-red-600" />
              <CardTitle>Overdue Renewals</CardTitle>
            </div>
            <CardDescription className="text-red-700 dark:text-red-400">
              {overdueRenewals.length} renewal{overdueRenewals.length !== 1 ? 's' : ''} overdue
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {overdueRenewals.map((client) => {
                const daysOverdue = Math.abs(getClientRenewalDaysUntil(client))
                return (
                  <div
                    key={client.id}
                    className="flex items-center justify-between p-3 bg-white dark:bg-slate-900 rounded border border-red-200 dark:border-red-900"
                  >
                    <div className="flex-1">
                      <h3 className="font-semibold text-red-900 dark:text-red-300">{client.name}</h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        Was due: {format(client.renewalDate, 'MMM d, yyyy')} ({daysOverdue} days ago)
                      </p>
                    </div>
                    <Link href={`/clients/${client.id}`}>
                      <Button size="sm" variant="destructive">Contact</Button>
                    </Link>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Urgent Renewals */}
      {urgentRenewals.length > 0 && (
        <Card className="border-orange-200 bg-orange-50 dark:bg-orange-950/20 dark:border-orange-900">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-orange-600" />
              <CardTitle>Due Soon</CardTitle>
            </div>
            <CardDescription className="text-orange-700 dark:text-orange-400">
              {urgentRenewals.length} renewal{urgentRenewals.length !== 1 ? 's' : ''} due within 3 days
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {urgentRenewals.map((client) => {
                const daysUntil = getClientRenewalDaysUntil(client)
                return (
                  <div
                    key={client.id}
                    className="flex items-center justify-between p-3 bg-white dark:bg-slate-900 rounded border border-orange-200 dark:border-orange-900"
                  >
                    <div className="flex-1">
                      <h3 className="font-semibold">{client.name}</h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        Renews: {format(client.renewalDate, 'MMM d, yyyy')} ({daysUntil} days)
                      </p>
                    </div>
                    <Link href={`/clients/${client.id}`}>
                      <Button size="sm" variant="outline">View</Button>
                    </Link>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Upcoming Renewals */}
      {upcomingRenewals.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Upcoming Renewals (Next 30 Days)</CardTitle>
            <CardDescription>
              {upcomingRenewals.length} renewal{upcomingRenewals.length !== 1 ? 's' : ''} scheduled
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {upcomingRenewals.map((client) => {
                const daysUntil = getClientRenewalDaysUntil(client)
                return (
                  <div
                    key={client.id}
                    className="flex items-center justify-between p-3 border border-border rounded hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex-1">
                      <h3 className="font-semibold">{client.name}</h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        Renews: {format(client.renewalDate, 'MMM d, yyyy')}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Monthly: ${client.monthlyAmount.toLocaleString()}
                      </p>
                    </div>
                    <div className="text-right mr-4">
                      <p className="text-sm font-semibold">{daysUntil}</p>
                      <p className="text-xs text-muted-foreground">days left</p>
                    </div>
                    <Link href={`/clients/${client.id}`}>
                      <Button size="sm" variant="ghost">View</Button>
                    </Link>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Empty State */}
      {overdueRenewals.length === 0 && urgentRenewals.length === 0 && upcomingRenewals.length === 0 && (
        <Card>
          <CardContent className="pt-8 pb-8 text-center">
            <Calendar className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No renewals to track at this time</p>
          </CardContent>
        </Card>
      )}

      {/* Quick Links */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Link href="/renewals/upcoming">
          <Button variant="outline" className="w-full">View All Upcoming →</Button>
        </Link>
        <Link href="/renewals/overdue">
          <Button variant="outline" className="w-full">View All Overdue →</Button>
        </Link>
      </div>
    </div>
  )
}
