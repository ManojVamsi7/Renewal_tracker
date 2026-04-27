'use client'

import { useState } from 'react'
import { useClients } from '@/components/clients/client-context'
import { usePayments } from '@/components/payments/payment-context'
import { PaymentForm } from '@/components/payments/payment-form'
import { PaymentTable } from '@/components/payments/payment-table'
import { Button } from '@/components/ui/button'
import { Payment } from '@/lib/types'
import { toast } from 'sonner'

export default function PaymentsPage() {
  const { clients } = useClients()
  const { payments, addPayment, deletePayment } = usePayments()
  const [showForm, setShowForm] = useState(false)

  const handleAddPayment = (data: Omit<Payment, 'id'>) => {
    addPayment(data)
    setShowForm(false)
    toast.success('Payment recorded successfully')
  }

  const handleDeletePayment = (id: string) => {
    deletePayment(id)
    toast.success('Payment deleted successfully')
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Payments</h1>
          <p className="text-muted-foreground mt-2">Track and manage all client payments.</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Cancel' : 'Record Payment'}
        </Button>
      </div>

      {showForm && (
        <PaymentForm clients={clients} onSubmit={handleAddPayment} />
      )}

      <PaymentTable payments={payments} clients={clients} onDelete={handleDeletePayment} />
    </div>
  )
}
