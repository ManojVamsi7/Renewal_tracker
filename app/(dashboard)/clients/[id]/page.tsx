'use client'

import { useParams, useRouter } from 'next/navigation'
import { useClients } from '@/components/clients/client-context'
import { usePayments } from '@/components/payments/payment-context'
import { ClientForm } from '@/components/clients/client-form'
import { Client } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'
import { toast } from 'sonner'
import { format, differenceInDays } from 'date-fns'
import { Badge } from '@/components/ui/badge'
import { RecordPaymentModal } from '@/components/clients/record-payment-modal'
import { PaymentHistory } from '@/components/clients/payment-history'
import { getRenewalStatus } from '@/lib/calculations'

export default function ClientDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { clients, updateClient } = useClients()
  const { payments } = usePayments()
  
  const clientId = params.id as string
  const client = clients.find(c => c.id === clientId)

  const handleUpdateClient = async (data: Omit<Client, 'id'>) => {
    if (client) {
      await updateClient(client.id, data)
      router.push('/clients')
    }
  }

  const getRenewalInfo = () => {
    if (!client) return null
    const status = getRenewalStatus(client.renewalDate)
    const daysUntil = differenceInDays(client.renewalDate, new Date())
    
    return { status, daysUntil }
  }

  const renewalInfo = getRenewalInfo()

  if (!client) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Client Not Found</h1>
          <p className="text-muted-foreground mt-2">The client you&apos;re looking for does not exist.</p>
        </div>
        <Link href="/clients">
          <Button>Back to Clients</Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">{client.name}</h1>
          <p className="text-muted-foreground mt-2">Manage client information, payments, and renewals.</p>
        </div>
        <div className="flex gap-2">
          <RecordPaymentModal client={client} />
          <Link href="/clients">
            <Button variant="outline">Back to Clients</Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <ClientForm initialData={client} onSubmit={handleUpdateClient} />
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Client Overview</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Student ID</p>
                <p className="mt-1 font-mono font-semibold">{client.studentId}</p>
              </div>

              <div>
                <p className="text-sm text-muted-foreground">Department</p>
                <p className="mt-1 font-medium">{client.department}</p>
              </div>

              <div>
                <p className="text-sm text-muted-foreground">Status</p>
                <Badge variant={client.status === 'active' ? 'default' : 'secondary'} className="mt-1">
                  {client.status}
                </Badge>
              </div>

              <div>
                <p className="text-sm text-muted-foreground">Email</p>
                <p className="mt-1 font-medium break-all">{client.email}</p>
              </div>

              <div>
                <p className="text-sm text-muted-foreground">Phone</p>
                <p className="mt-1 font-medium">{client.phone}</p>
              </div>

              <div>
                <p className="text-sm text-muted-foreground">Monthly Amount</p>
                <p className="mt-1 font-bold text-lg">${client.monthlyAmount.toLocaleString()}</p>
              </div>

              <div>
                <p className="text-sm text-muted-foreground">Start Date</p>
                <p className="mt-1 font-medium">{format(client.startDate, 'MMM d, yyyy')}</p>
              </div>

              <div>
                <p className="text-sm text-muted-foreground">Renewal Date</p>
                <div className="mt-1 flex items-center justify-between">
                  <p className="font-medium">{format(client.renewalDate, 'MMM d, yyyy')}</p>
                  {renewalInfo && (
                    <Badge 
                      variant={
                        renewalInfo.status === 'overdue' ? 'destructive' :
                        renewalInfo.status === 'due-today' || renewalInfo.status === 'due-soon' ? 'secondary' :
                        'outline'
                      }
                    >
                      {renewalInfo.daysUntil < 0 
                        ? `${Math.abs(renewalInfo.daysUntil)}d overdue`
                        : renewalInfo.daysUntil === 0
                        ? 'Due Today'
                        : `${renewalInfo.daysUntil}d left`
                      }
                    </Badge>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Payment History */}
      <PaymentHistory client={client} payments={payments} />
    </div>
  )
}
