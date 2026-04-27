'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { getClientRenewalDaysUntil, getRenewalStatus, getClientsNeedingRenewal } from '@/lib/calculations'
import { format } from 'date-fns'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { AlertCircle } from 'lucide-react'
import { useClients } from '@/components/clients/client-context'
import { usePayments } from '@/components/payments/payment-context'

export default function OverdueRenewalsPage() {
  const { clients: mockClients } = useClients()
  const { payments } = usePayments()
  
  const clientsNeedingRenewal = getClientsNeedingRenewal(mockClients, payments)
  const overdueRenewals = clientsNeedingRenewal
    .filter(c => getRenewalStatus(c.renewalDate) === 'overdue')
    .sort((a, b) => getClientRenewalDaysUntil(a) - getClientRenewalDaysUntil(b))

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Overdue Renewals</h1>
        <p className="text-muted-foreground mt-2">
          Renewals that require immediate attention
        </p>
      </div>

      <Card className="border-destructive/30 bg-destructive/5">
        <CardHeader>
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-destructive" />
            <CardTitle>Critical Actions Required</CardTitle>
          </div>
          <CardDescription>
            {overdueRenewals.length} overdue renewals need immediate attention
          </CardDescription>
        </CardHeader>
        <CardContent>
          {overdueRenewals.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No overdue renewals - great job!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {overdueRenewals.map((client) => {
                const daysOverdue = Math.abs(getClientRenewalDaysUntil(client))
                return (
                  <div
                    key={client.id}
                    className="flex items-center justify-between p-4 border-2 border-destructive/30 rounded-lg bg-card hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">{client.name}</h3>
                        <Badge variant="destructive">OVERDUE</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        Due: {format(client.renewalDate, 'MMMM d, yyyy')}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Monthly: ${client.monthlyAmount.toLocaleString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-lg font-bold text-destructive">{daysOverdue}</p>
                        <p className="text-xs text-destructive">days overdue</p>
                      </div>
                      <Link href={`/clients/${client.id}`}>
                        <Button size="sm" variant="default">Contact</Button>
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
