'use client'

import { useState } from 'react'
import { Payment, Client } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Edit2, Trash2 } from 'lucide-react'
import { format } from 'date-fns'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'

interface PaymentTableProps {
  payments: Payment[]
  clients: Client[]
  onDelete: (id: string) => void
}

export function PaymentTable({ payments, clients, onDelete }: PaymentTableProps) {
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const clientMap = new Map(clients.map(c => [c.id, c]))

  const handleDelete = () => {
    if (deleteId) {
      onDelete(deleteId)
      setDeleteId(null)
    }
  }

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

  const sortedPayments = payments.slice().sort((a, b) => b.date.getTime() - a.date.getTime())

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Payment History</CardTitle>
          <CardDescription>All recorded payments</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-2 font-medium">Client</th>
                  <th className="text-left py-3 px-2 font-medium">Amount</th>
                  <th className="text-left py-3 px-2 font-medium">Date</th>
                  <th className="text-left py-3 px-2 font-medium">Method</th>
                  <th className="text-left py-3 px-2 font-medium">Notes</th>
                  <th className="text-left py-3 px-2 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {sortedPayments.map((payment) => {
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
                      <td className="py-3 px-2 text-muted-foreground text-xs max-w-xs truncate">
                        {payment.notes || '-'}
                      </td>
                      <td className="py-3 px-2">
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            className="gap-2"
                            disabled
                          >
                            <Edit2 className="w-4 h-4" />
                            Edit
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-destructive hover:text-destructive"
                            onClick={() => setDeleteId(payment.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <AlertDialog open={deleteId !== null} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Payment</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this payment record? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex gap-4 justify-end">
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
