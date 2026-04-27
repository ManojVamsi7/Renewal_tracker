'use client'

import { useClients } from '@/components/clients/client-context'
import { usePayments } from '@/components/payments/payment-context'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { getClientRenewalDaysUntil, getRenewalStatus, getClientsNeedingRenewal } from '@/lib/calculations'
import { format, addDays } from 'date-fns'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function UpcomingRenewalsPage() {
  const { clients: mockClients } = useClients()
  const { payments } = usePayments()
  const today = new Date()
  const thirtyDaysFromNow = addDays(today, 30)

  const clientsNeedingRenewal = getClientsNeedingRenewal(mockClients, payments)
  const upcomingRenewals = clientsNeedingRenewal
    .filter(c => {
      const daysUntil = getClientRenewalDaysUntil(c)
      return daysUntil > 3 && daysUntil <= 30
    })
    .sort((a, b) => getClientRenewalDaysUntil(a) - getClientRenewalDaysUntil(b))

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Upcoming Renewals</h1>
        <p className="text-muted-foreground mt-2">
          Renewals scheduled for the next 30 days
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Renewal Schedule</CardTitle>
          <CardDescription>
            {upcomingRenewals.length} renewals coming up
          </CardDescription>
        </CardHeader>
        <CardContent>
          {upcomingRenewals.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No upcoming renewals in the next 30 days</p>
            </div>
          ) : (
            <div className="space-y-4">
              {upcomingRenewals.map((client) => {
                const daysUntil = getClientRenewalDaysUntil(client)
                return (
                  <div
                    key={client.id}
                    className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex-1">
                      <h3 className="font-semibold">{client.name}</h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        Renewal: {format(client.renewalDate, 'MMMM d, yyyy')}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Monthly: ${client.monthlyAmount.toLocaleString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-lg font-bold">{daysUntil}</p>
                        <p className="text-xs text-muted-foreground">days left</p>
                      </div>
                      <Link href={`/clients/${client.id}`}>
                        <Button size="sm">View</Button>
                      </Link>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
