'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Payment, Client } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { toast } from 'sonner'

const paymentFormSchema = z.object({
  clientId: z.string().min(1, 'Client is required'),
  amount: z.string().transform(v => parseFloat(v)).refine(v => v > 0, 'Amount must be positive'),
  date: z.string().min(1, 'Payment date is required'),
  paymentMethod: z.enum(['credit_card', 'bank_transfer', 'check', 'cash', 'other']),
  notes: z.string().optional(),
})

type PaymentFormData = z.infer<typeof paymentFormSchema>

interface PaymentFormProps {
  clients: Client[]
  initialData?: Payment
  onSubmit: (data: Omit<Payment, 'id'>) => void
  isLoading?: boolean
}

export function PaymentForm({
  clients,
  initialData,
  onSubmit,
  isLoading = false,
}: PaymentFormProps) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<PaymentFormData>({
    resolver: zodResolver(paymentFormSchema),
    defaultValues: initialData
      ? {
          clientId: initialData.clientId,
          amount: initialData.amount.toString(),
          date: initialData.date.toISOString().split('T')[0],
          paymentMethod: initialData.paymentMethod,
          notes: initialData.notes || '',
        }
      : undefined,
  })

  const paymentMethod = watch('paymentMethod')

  const handleFormSubmit = async (data: PaymentFormData) => {
    try {
      onSubmit({
        clientId: data.clientId,
        amount: data.amount,
        date: new Date(data.date),
        paymentMethod: data.paymentMethod,
        notes: data.notes,
      })
      toast.success('Payment recorded successfully')
    } catch (error) {
      toast.error('Failed to save payment')
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{initialData ? 'Edit Payment' : 'Record New Payment'}</CardTitle>
        <CardDescription>
          {initialData ? 'Update payment information' : 'Log a new payment from a client'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="clientId">Client *</Label>
              <Select
                defaultValue={initialData?.clientId}
                onValueChange={(value) => setValue('clientId', value)}
              >
                <SelectTrigger className="mt-2">
                  <SelectValue placeholder="Select a client" />
                </SelectTrigger>
                <SelectContent>
                  {clients.map((client) => (
                    <SelectItem key={client.id} value={client.id}>
                      {client.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.clientId && (
                <p className="text-red-500 text-sm mt-1">{errors.clientId.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="amount">Amount ($) *</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                placeholder="5000"
                {...register('amount')}
                className="mt-2"
              />
              {errors.amount && (
                <p className="text-red-500 text-sm mt-1">{errors.amount.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="date">Payment Date *</Label>
              <Input
                id="date"
                type="date"
                {...register('date')}
                className="mt-2"
              />
              {errors.date && (
                <p className="text-red-500 text-sm mt-1">{errors.date.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="paymentMethod">Payment Method *</Label>
              <Select
                defaultValue={initialData?.paymentMethod}
                onValueChange={(value) => setValue('paymentMethod', value as any)}
              >
                <SelectTrigger className="mt-2">
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
              {errors.paymentMethod && (
                <p className="text-red-500 text-sm mt-1">{errors.paymentMethod.message}</p>
              )}
            </div>
          </div>

          <div>
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              placeholder="Additional notes about this payment"
              {...register('notes')}
              className="mt-2"
              rows={3}
            />
          </div>

          <div className="flex gap-4">
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Saving...' : initialData ? 'Update Payment' : 'Record Payment'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
