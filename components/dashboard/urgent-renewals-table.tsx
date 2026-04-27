import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Client } from '@/lib/types'
import { getClientRenewalDaysUntil, getRenewalStatus } from '@/lib/calculations'
import { format } from 'date-fns'

interface UrgentRenewalsTableProps {
  clients: Client[]
}

export function UrgentRenewalsTable({ clients }: UrgentRenewalsTableProps) {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'overdue':
        return <Badge variant="destructive">Overdue</Badge>
      case 'due-today':
        return <Badge variant="default">Due Today</Badge>
      case 'due-soon':
        return <Badge variant="secondary">Due Soon</Badge>
      default:
        return <Badge variant="outline">Upcoming</Badge>
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Urgent Renewals</CardTitle>
        <CardDescription>
          Renewals due today, overdue, or coming up in the next 3 days
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {clients.length === 0 ? (
            <p className="text-sm text-muted-foreground">No urgent renewals</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-2 px-2 font-medium">Client</th>
                    <th className="text-left py-2 px-2 font-medium">Renewal Date</th>
                    <th className="text-left py-2 px-2 font-medium">Days</th>
                    <th className="text-left py-2 px-2 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {clients.map((client) => {
                    const daysUntil = getClientRenewalDaysUntil(client)
                    const status = getRenewalStatus(client.renewalDate)
                    return (
                      <tr key={client.id} className="border-b border-border hover:bg-muted/50">
                        <td className="py-3 px-2 font-medium">{client.name}</td>
                        <td className="py-3 px-2 text-muted-foreground">
                          {format(client.renewalDate, 'MMM d, yyyy')}
                        </td>
                        <td className="py-3 px-2">
                          <span className={daysUntil < 0 ? 'text-destructive font-medium' : ''}>
                            {daysUntil < 0 ? `${Math.abs(daysUntil)} days ago` : `${daysUntil} days`}
                          </span>
                        </td>
                        <td className="py-3 px-2">{getStatusBadge(status)}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
