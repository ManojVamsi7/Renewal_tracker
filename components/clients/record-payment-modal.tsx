'use client'

import { useState } from 'react'
import { Client, Payment, PaymentStatus, VerificationMethod } from '@/lib/types'
import { usePayments } from '@/components/payments/payment-context'
import { useClients } from '@/components/clients/client-context'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CheckCircle2, Clock, AlertCircle, CreditCard } from 'lucide-react'
import { toast } from 'sonner'
import { format, addMonths } from 'date-fns'

interface RecordPaymentModalProps {
  client: Client
}

type Step = 'details' | 'verification' | 'confirmation'

export function RecordPaymentModal({ client }: RecordPaymentModalProps) {
  const [open, setOpen] = useState(false)
  const [step, setStep] = useState<Step>('details')
  const [loading, setLoading] = useState(false)

  const [amount, setAmount] = useState(client.monthlyAmount.toString())
  const [paymentDate, setPaymentDate] = useState(format(new Date(), 'yyyy-MM-dd'))
  const [paymentMethod, setPaymentMethod] = useState<string>('credit_card')
  const [paymentNotes, setPaymentNotes] = useState('')

  const [verificationMethod, setVerificationMethod] = useState<string>('manual')
  const [verificationNotes, setVerificationNotes] = useState('')
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>('pending')

  const { addPayment } = usePayments()
  const { updateClient } = useClients()

  const handleReset = () => {
    setStep('details')
    setAmount(client.monthlyAmount.toString())
    setPaymentDate(format(new Date(), 'yyyy-MM-dd'))
    setPaymentMethod('credit_card')
    setPaymentNotes('')
    setVerificationMethod('manual')
    setVerificationNotes('')
    setPaymentStatus('pending')
  }

  const handleClose = () => {
    setOpen(false)
    setTimeout(handleReset, 300)
  }

  const handleConfirmPayment = async () => {
    try {
      setLoading(true)

      const newPayment: Omit<Payment, 'id'> = {
        clientId: client.id,
        amount: parseFloat(amount),
        date: new Date(paymentDate),
        paymentMethod: paymentMethod as any,
        notes: paymentNotes,
        verification: {
          status: paymentStatus,
          method: verificationMethod as VerificationMethod,
          verifiedAt: paymentStatus === 'verified' ? new Date() : undefined,
          verifiedBy: 'Admin',
          notes: verificationNotes,
        },
      }

      await addPayment(newPayment)

      // Advance the renewal date by 1 month from the *current* renewal date
      const nextRenewalDate = addMonths(client.renewalDate, 1)
      await updateClient(client.id, { renewalDate: nextRenewalDate })

      toast.success(
        paymentStatus === 'verified'
          ? 'Payment verified and recorded. Renewal date advanced.'
          : 'Payment recorded as pending verification. Renewal date advanced.'
      )

      handleClose()
    } catch (error) {
      toast.error('Failed to record payment')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Button
        onClick={() => setOpen(true)}
        className="gap-2"
        aria-label="Record payment for client"
      >
        <CreditCard className="w-4 h-4" />
        Record Payment
      </Button>

      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="max-w-2xl" aria-labelledby="payment-dialog-title">
          <DialogHeader>
            <DialogTitle id="payment-dialog-title" className="text-2xl">
              Record Payment
            </DialogTitle>
            <DialogDescription className="text-base">
              <div className="flex items-center gap-3 mt-2">
                <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                  <span className="font-semibold text-blue-700 dark:text-blue-300">
                    {client.name.charAt(0)}
                  </span>
                </div>
                <div>
                  <p className="font-semibold text-foreground">{client.name}</p>
                  <p className="text-xs text-muted-foreground">${client.monthlyAmount}/month</p>
                </div>
              </div>
            </DialogDescription>
          </DialogHeader>

          {/* Step Indicator */}
          <div className="flex gap-4 py-6" role="progressbar" aria-valuenow={step === 'details' ? 1 : step === 'verification' ? 2 : 3} aria-valuemin={1} aria-valuemax={3}>
            {(['details', 'verification', 'confirmation'] as const).map((s, idx) => (
              <div key={s} className="flex items-center flex-1">
                <div
                  className={`flex items-center justify-center w-8 h-8 rounded-full font-semibold text-sm transition-all ${
                    s === step
                      ? 'bg-blue-600 text-white'
                      : step === 'confirmation' || 
                        (s === 'verification' && (step === 'confirmation'))
                      ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                      : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
                  }`}
                >
                  {s === 'details' && '1'}
                  {s === 'verification' && '2'}
                  {s === 'confirmation' && '3'}
                </div>
                {idx < 2 && (
                  <div
                    className={`h-0.5 flex-1 mx-2 ${
                      step === 'confirmation' || (step === 'verification' && s === 'details')
                        ? 'bg-green-600'
                        : 'bg-gray-200 dark:bg-gray-700'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>

          {/* Step: Payment Details */}
          {step === 'details' && (
            <div className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="amount" className="font-semibold">
                    Amount <span className="text-red-600">*</span>
                  </Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                      $
                    </span>
                    <Input
                      id="amount"
                      type="number"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder="0.00"
                      className="pl-7"
                      aria-label="Payment amount"
                      step="0.01"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="payment-date" className="font-semibold">
                    Payment Date <span className="text-red-600">*</span>
                  </Label>
                  <Input
                    id="payment-date"
                    type="date"
                    value={paymentDate}
                    onChange={(e) => setPaymentDate(e.target.value)}
                    aria-label="Payment date"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="payment-method" className="font-semibold">
                  Payment Method <span className="text-red-600">*</span>
                </Label>
                <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                  <SelectTrigger id="payment-method" aria-label="Select payment method">
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
                <Label htmlFor="payment-notes" className="font-semibold">
                  Notes
                </Label>
                <Textarea
                  id="payment-notes"
                  value={paymentNotes}
                  onChange={(e) => setPaymentNotes(e.target.value)}
                  placeholder="Optional payment notes..."
                  className="resize-none"
                  rows={3}
                  aria-label="Additional payment notes"
                />
              </div>

              <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <p className="text-sm text-blue-900 dark:text-blue-200">
                  💡 After recording payment details, you&apos;ll verify the payment to confirm it was actually received.
                </p>
              </div>

              <Button
                onClick={() => setStep('verification')}
                className="w-full bg-blue-600 hover:bg-blue-700"
                size="lg"
                aria-label="Continue to verification step"
              >
                Continue to Verification
              </Button>
            </div>
          )}

          {/* Step: Verification */}
          {step === 'verification' && (
            <div className="space-y-5">
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
                <div className="flex gap-3">
                  <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-blue-900 dark:text-blue-200">
                    <p className="font-semibold mb-1">Verify Payment Received</p>
                    <p>Confirm that you have actually received this payment before marking it as verified.</p>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="verification-method" className="font-semibold">
                  How did you verify this payment? <span className="text-red-600">*</span>
                </Label>
                <Select value={verificationMethod} onValueChange={setVerificationMethod}>
                  <SelectTrigger id="verification-method" aria-label="Select verification method">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="manual">Manual Confirmation</SelectItem>
                    <SelectItem value="invoice">Invoice/Receipt Check</SelectItem>
                    <SelectItem value="receipt">Payment Receipt</SelectItem>
                    <SelectItem value="statement">Bank Statement</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="payment-status" className="font-semibold">
                  Payment Status <span className="text-red-600">*</span>
                </Label>
                <div className="grid grid-cols-2 gap-3">
                  {(['pending', 'verified', 'failed', 'refunded'] as const).map((status) => (
                    <button
                      key={status}
                      onClick={() => setPaymentStatus(status)}
                      className={`p-3 rounded-lg border-2 transition-all text-left ${
                        paymentStatus === status
                          ? 'border-blue-600 bg-blue-50 dark:bg-blue-950/30'
                          : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                      }`}
                      aria-pressed={paymentStatus === status}
                      aria-label={`Mark payment as ${status}`}
                    >
                      <div className="flex items-center gap-2">
                        {status === 'verified' && <CheckCircle2 className="w-4 h-4 text-green-600" />}
                        {status === 'pending' && <Clock className="w-4 h-4 text-amber-600" />}
                        {(status === 'failed' || status === 'refunded') && (
                          <AlertCircle className="w-4 h-4 text-red-600" />
                        )}
                        <span className="font-medium capitalize text-sm">{status}</span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1 pl-6">
                        {status === 'verified' && 'Payment confirmed'}
                        {status === 'pending' && 'Awaiting confirmation'}
                        {status === 'failed' && 'Payment failed'}
                        {status === 'refunded' && 'Payment refunded'}
                      </p>
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="verification-notes" className="font-semibold">
                  Verification Notes
                </Label>
                <Textarea
                  id="verification-notes"
                  value={verificationNotes}
                  onChange={(e) => setVerificationNotes(e.target.value)}
                  placeholder="Document how you verified this payment (e.g., checked bank account, received email confirmation)..."
                  className="resize-none"
                  rows={3}
                  aria-label="Verification details"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  onClick={() => setStep('details')}
                  variant="outline"
                  className="flex-1"
                  size="lg"
                  aria-label="Go back to payment details"
                >
                  Back
                </Button>
                <Button
                  onClick={() => setStep('confirmation')}
                  className="flex-1 bg-blue-600 hover:bg-blue-700"
                  size="lg"
                  aria-label="Continue to confirmation"
                >
                  Review & Confirm
                </Button>
              </div>
            </div>
          )}

          {/* Step: Confirmation */}
          {step === 'confirmation' && (
            <div className="space-y-5">
              <div className="bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded-lg p-4">
                <div className="flex gap-2 items-start">
                  <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-green-900 dark:text-green-200">
                    Review the payment details below and confirm to save.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Card className="p-4 bg-gray-50 dark:bg-gray-800 border-0">
                  <p className="text-xs text-muted-foreground font-semibold">Amount</p>
                  <p className="text-2xl font-bold mt-1">${parseFloat(amount).toFixed(2)}</p>
                </Card>

                <Card className="p-4 bg-gray-50 dark:bg-gray-800 border-0">
                  <p className="text-xs text-muted-foreground font-semibold">Payment Date</p>
                  <p className="text-sm font-semibold mt-1">{format(new Date(paymentDate), 'MMM d, yyyy')}</p>
                </Card>

                <Card className="p-4 bg-gray-50 dark:bg-gray-800 border-0">
                  <p className="text-xs text-muted-foreground font-semibold">Payment Method</p>
                  <p className="text-sm font-semibold mt-1 capitalize">{paymentMethod.replace('_', ' ')}</p>
                </Card>

                <Card className="p-4 bg-gray-50 dark:bg-gray-800 border-0">
                  <p className="text-xs text-muted-foreground font-semibold">Verification Status</p>
                  <Badge
                    className="mt-2"
                    variant={
                      paymentStatus === 'verified'
                        ? 'default'
                        : paymentStatus === 'pending'
                        ? 'secondary'
                        : 'destructive'
                    }
                  >
                    {paymentStatus.charAt(0).toUpperCase() + paymentStatus.slice(1)}
                  </Badge>
                </Card>
              </div>

              {paymentNotes && (
                <div>
                  <p className="text-xs text-muted-foreground font-semibold mb-2">Payment Notes</p>
                  <p className="text-sm bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">{paymentNotes}</p>
                </div>
              )}

              {verificationNotes && (
                <div>
                  <p className="text-xs text-muted-foreground font-semibold mb-2">Verification Notes</p>
                  <p className="text-sm bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">{verificationNotes}</p>
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <Button
                  onClick={() => setStep('verification')}
                  variant="outline"
                  className="flex-1"
                  size="lg"
                  aria-label="Go back to verification"
                >
                  Back
                </Button>
                <Button
                  onClick={handleConfirmPayment}
                  disabled={loading}
                  className="flex-1 bg-green-600 hover:bg-green-700"
                  size="lg"
                  aria-label="Confirm and save payment"
                >
                  {loading ? 'Saving...' : 'Confirm & Save Payment'}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
