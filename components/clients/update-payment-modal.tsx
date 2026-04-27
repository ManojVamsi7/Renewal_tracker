'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { usePayments } from '@/components/payments/payment-context'
import { useClients } from '@/components/clients/client-context'
import { Client, Payment } from '@/lib/types'
import { toast } from 'sonner'
import { format, addMonths, isSameMonth } from 'date-fns'

interface UpdatePaymentModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  client: Client
  month: Date
  existingPayment?: Payment
}

export function UpdatePaymentModal({
  open,
  onOpenChange,
  client,
  month,
  existingPayment,
}: UpdatePaymentModalProps) {
  const { addPayment, updatePayment } = usePayments()
  const { updateClient } = useClients()
  const [amount, setAmount] = useState(existingPayment?.amount.toString() || client.monthlyAmount.toString())
  const [method, setMethod] = useState(existingPayment?.paymentMethod || 'credit_card')
  const [notes, setNotes] = useState(existingPayment?.notes || '')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const paymentData = {
        clientId: client.id,
        amount: parseFloat(amount),
        date: month,
        paymentMethod: method as any,
        notes,
        verification: {
          status: 'verified' as const,
          method: 'manual' as const,
          verifiedAt: new Date(),
          verifiedBy: 'System',
        }
      }

      if (existingPayment) {
        await updatePayment(existingPayment.id, paymentData)
        toast.success('Payment updated successfully')
      } else {
        await addPayment(paymentData)
        
        // Advance the client's renewal date by 1 month from their current renewal date
        // ONLY if the month being paid is the same as the current renewal date's month.
        // This ensures back-filling old payments doesn't advance future renewal dates incorrectly.
        if (isSameMonth(client.renewalDate, month)) {
          const nextRenewalDate = addMonths(client.renewalDate, 1)
          await updateClient(client.id, { renewalDate: nextRenewalDate })
          toast.success('Payment recorded and renewal date advanced')
        } else {
          toast.success('Payment recorded successfully')
        }
      }

      onOpenChange(false)
    } catch (error) {
      toast.error('Failed to save payment')
    } finally {
      setIsLoading(false)
    }
  }

  const monthLabel = format(month, 'MMMM yyyy')

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {existingPayment ? 'Update' : 'Record'} Payment - {monthLabel}
          </DialogTitle>
          <DialogDescription>
            {client.name} (ID: {client.studentId})
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="amount">Amount *</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              min="0"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="method">Payment Method *</Label>
            <Select value={method} onValueChange={setMethod}>
              <SelectTrigger id="method">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="credit_card">Credit Card</SelectItem>
                <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                <SelectItem value="check">Check</SelectItem>
                <SelectItem value="cash">Cash</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Input
              id="notes"
              placeholder="Optional notes..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Saving...' : 'Save Payment'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
