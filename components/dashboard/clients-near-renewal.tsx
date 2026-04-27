'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Client } from '@/lib/types'
import { getClientRenewalDaysUntil, getClientsIn5DayWarning } from '@/lib/calculations'
import { format } from 'date-fns'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { AlertCircle, Calendar, Clock, Zap } from 'lucide-react'

interface ClientsNearRenewalProps {
  clients: Client[]
}

export function ClientsNearRenewal({ clients }: ClientsNearRenewalProps) {
  // Prioritize clients in 5-day warning window, then show upcoming
  const in5DayWarning = getClientsIn5DayWarning(clients)
  const upcomingRenewal = clients
    .filter(c => {
      const daysUntil = getClientRenewalDaysUntil(c)
      return daysUntil > 5 && daysUntil <= 30
    })
    .sort((a, b) => getClientRenewalDaysUntil(a) - getClientRenewalDaysUntil(b))

  const nearRenewal = [...in5DayWarning, ...upcomingRenewal]

  if (nearRenewal.length === 0) {
    return null
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {in5DayWarning.length > 0 ? (
              <Zap className="w-5 h-5 text-red-600 animate-pulse" />
            ) : (
              <Clock className="w-5 h-5 text-blue-600" />
            )}
            <CardTitle>Clients Near Renewal Date</CardTitle>
          </div>
          <Link href="/renewals">
            <Button variant="ghost" size="sm">View all →</Button>
          </Link>
        </div>
        <CardDescription>
          {in5DayWarning.length > 0 && (
            <span className="text-red-600 font-semibold">
              ⚠️ {in5DayWarning.length} client{in5DayWarning.length !== 1 ? 's' : ''} renewing within 5 days
            </span>
          )}
          {in5DayWarning.length === 0 && (
            <span>{nearRenewal.length} client{nearRenewal.length !== 1 ? 's' : ''} renewing within 30 days</span>
          )}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {nearRenewal.slice(0, 5).map((client) => {
            const daysUntil = getClientRenewalDaysUntil(client)
            const isOverdue = daysUntil < 0
            const isIn5DayWarning = daysUntil >= 0 && daysUntil <= 5
            const isUrgent = daysUntil <= 3

            return (
              <div
                key={client.id}
                className={`flex items-center justify-between p-3 rounded-lg border transition-colors ${
                  isOverdue
                    ? 'border-red-300 bg-red-50 dark:bg-red-950/30 dark:border-red-800'
                    : isIn5DayWarning
                    ? 'border-red-200 bg-red-50 dark:bg-red-950/20 dark:border-red-900 ring-1 ring-red-300'
                    : isUrgent
                    ? 'border-orange-200 bg-orange-50 dark:bg-orange-950/20 dark:border-orange-900'
                    : 'border-border hover:bg-muted/50'
                }`}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold truncate">{client.name}</p>
                    {isOverdue && (
                      <Badge variant="destructive" className="text-xs">OVERDUE</Badge>
                    )}
                    {isIn5DayWarning && !isOverdue && (
                      <Badge className="text-xs bg-red-600 text-white dark:bg-red-700">⚠️ 5-DAY WARNING</Badge>
                    )}
                    {isUrgent && !isOverdue && !isIn5DayWarning && (
                      <Badge variant="secondary" className="text-xs bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-100">DUE SOON</Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    {isOverdue
                      ? `Was due: ${format(client.renewalDate, 'MMM d, yyyy')}`
                      : `Renews: ${format(client.renewalDate, 'MMM d, yyyy')}`}
                  </p>
                </div>
                <div className="flex items-center gap-3 ml-4">
                  <div className="text-right">
                    <p className={`text-lg font-bold ${
                      isOverdue ? 'text-red-600' : isIn5DayWarning ? 'text-red-600' : isUrgent ? 'text-orange-600' : 'text-blue-600'
                    }`}>
                      {Math.abs(daysUntil)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {isOverdue ? 'days overdue' : 'days left'}
                    </p>
                  </div>
                  <Link href={`/clients/${client.id}`}>
                    <Button size="sm" variant="ghost">→</Button>
                  </Link>
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
