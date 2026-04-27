import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Client, Payment } from '@/lib/types'
import { format } from 'date-fns'

interface RecentPaymentsTableProps {
  payments: Payment[]
  clients: Client[]
}

export function RecentPaymentsTable({ payments, clients }: RecentPaymentsTableProps) {
  const clientMap = new Map(clients.map(c => [c.id, c]))
  const recentPayments = payments.slice().sort((a, b) => b.date.getTime() - a.date.getTime()).slice(0, 5)

  const getPaymentMethodLabel = (method: string) => {
    const map: Record<string, string> = {
      credit_card: 'Credit Card',
      bank_transfer: 'Bank Transfer',
      check: 'Check',
      cash: 'Cash',
      other: 'Other',
    }
    return map[method] || method
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Payments</CardTitle>
        <CardDescription>Latest 5 payments received</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {recentPayments.length === 0 ? (
            <p className="text-sm text-muted-foreground">No payments recorded</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-2 px-2 font-medium">Client</th>
                    <th className="text-left py-2 px-2 font-medium">Amount</th>
                    <th className="text-left py-2 px-2 font-medium">Date</th>
                    <th className="text-left py-2 px-2 font-medium">Method</th>
                  </tr>
                </thead>
                <tbody>
                  {recentPayments.map((payment) => {
                    const client = clientMap.get(payment.clientId)
                    return (
                      <tr key={payment.id} className="border-b border-border hover:bg-muted/50">
                        <td className="py-3 px-2 font-medium">{client?.name || 'Unknown'}</td>
                        <td className="py-3 px-2 font-semibold">
                          ${payment.amount.toLocaleString()}
                        </td>
                        <td className="py-3 px-2 text-muted-foreground">
                          {format(payment.date, 'MMM d, yyyy')}
                        </td>
                        <td className="py-3 px-2 text-muted-foreground">
                          {getPaymentMethodLabel(payment.paymentMethod)}
                        </td>
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
