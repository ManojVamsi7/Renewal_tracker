'use client'

import { useState } from 'react'
import { Client, Payment } from '@/lib/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { format, startOfMonth, endOfMonth, eachMonthOfInterval, isSameMonth } from 'date-fns'
import { CheckCircle, AlertCircle, Clock, XCircle } from 'lucide-react'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { UpdatePaymentModal } from './update-payment-modal'

interface PaymentHistoryProps {
  client: Client
  payments: Payment[]
}

export function PaymentHistory({ client, payments }: PaymentHistoryProps) {
  const [selectedMonth, setSelectedMonth] = useState<Date | null>(null)
  const [showUpdateModal, setShowUpdateModal] = useState(false)
  const clientPayments = payments.filter(p => p.clientId === client.id)
  
  // Generate rolling 12-month window starting from start date
  const startDate = client.startDate
  const today = new Date()
  
  // Start from the beginning of the billing cycle month
  const cycleStartMonth = startOfMonth(startDate)
  
  // Calculate how many months have passed since start date
  const monthsElapsed = Math.floor(
    (today.getFullYear() - cycleStartMonth.getFullYear()) * 12 +
    (today.getMonth() - cycleStartMonth.getMonth())
  )
  
  // Show exactly 12 months. If monthsElapsed < 12, start from cycleStartMonth.
  // If monthsElapsed >= 12, do a rolling 12 month window ending exactly 11 months after the new start.
  const displayStartMonth = new Date(cycleStartMonth)
  displayStartMonth.setMonth(displayStartMonth.getMonth() + Math.max(0, monthsElapsed - 11))
  
  const displayEndMonth = new Date(displayStartMonth)
  displayEndMonth.setMonth(displayEndMonth.getMonth() + 11)

  const months = eachMonthOfInterval({
    start: displayStartMonth,
    end: displayEndMonth,
  })

  const getPaymentStatus = (monthDate: Date) => {
    return clientPayments.find(p => isSameMonth(p.date, monthDate))
  }

  // Only count months that have already started (up to the current month) for missed/paid rates
  const todayMonthStart = startOfMonth(today)
  const pastOrCurrentMonths = months.filter(m => m <= todayMonthStart)

  const paidMonths = pastOrCurrentMonths.filter(m => getPaymentStatus(m))
  const missedMonths = pastOrCurrentMonths.filter(m => !getPaymentStatus(m))

  const paymentRate = pastOrCurrentMonths.length > 0 
    ? (paidMonths.length / pastOrCurrentMonths.length * 100).toFixed(0) 
    : 0

  const totalCollected = clientPayments.reduce((sum, p) => sum + p.amount, 0)

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl md:text-3xl font-bold text-green-600">{paidMonths.length}</div>
              <p className="text-sm text-muted-foreground mt-1">Months Paid</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl md:text-3xl font-bold text-red-600">{missedMonths.length}</div>
              <p className="text-sm text-muted-foreground mt-1">Months Missed</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl md:text-3xl font-bold">{paymentRate}%</div>
              <p className="text-sm text-muted-foreground mt-1">Payment Rate</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl md:text-3xl font-bold text-blue-600">${totalCollected.toLocaleString()}</div>
              <p className="text-sm text-muted-foreground mt-1">Total Collected</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Timeline */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Payment Timeline - {format(new Date(), 'yyyy')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
            {months.slice(0, 12).map((month) => {
              const payment = getPaymentStatus(month)
              const monthLabel = format(month, 'MMM yy')
              const verificationStatus = payment?.verification?.status

              return (
                <TooltipProvider key={monthLabel}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button 
                        type="button"
                        onClick={() => {
                          setSelectedMonth(month)
                          setShowUpdateModal(true)
                        }}
                        className="flex flex-col items-center cursor-pointer hover:opacity-80 transition-opacity"
                        aria-label={`Update payment for ${monthLabel}`}
                      >
                        <div
                          className={`rounded-lg p-3 border-2 transition-all flex items-center justify-center ${
                            !payment
                              ? 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700'
                              : verificationStatus === 'verified'
                              ? 'bg-white dark:bg-gray-900 border-green-300 dark:border-green-600'
                              : verificationStatus === 'pending'
                              ? 'bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800'
                              : verificationStatus === 'failed'
                              ? 'bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800'
                              : 'bg-orange-50 dark:bg-orange-950/30 border-orange-200 dark:border-orange-800'
                          }`}
                        >
                          {!payment ? (
                            <Clock className="w-8 h-8 text-gray-400 dark:text-gray-500" aria-label="No payment recorded" />
                          ) : verificationStatus === 'verified' ? (
                            <CheckCircle className="w-8 h-8 text-green-500 dark:text-green-400" aria-label="Payment verified" />
                          ) : verificationStatus === 'pending' ? (
                            <Clock className="w-8 h-8 text-amber-500 dark:text-amber-400" aria-label="Pending verification" />
                          ) : verificationStatus === 'failed' ? (
                            <XCircle className="w-8 h-8 text-red-600 dark:text-red-400" aria-label="Payment failed" />
                          ) : (
                            <Clock className="w-8 h-8 text-amber-500 dark:text-amber-400" aria-label="Payment pending" />
                          )}
                        </div>
                        <p className="text-xs text-center font-medium">{monthLabel}</p>
                        {payment && (
                          <p className="text-xs font-semibold mt-1 text-green-600 dark:text-green-400">${payment.amount}</p>
                        )}
                      </button>
                    </TooltipTrigger>
                    <TooltipContent side="top" className="text-xs">
                      {!payment ? (
                        <p>No payment recorded</p>
                      ) : (
                        <div className="space-y-1">
                          <p><span className="font-semibold">Amount:</span> ${payment.amount}</p>
                          <p><span className="font-semibold">Method:</span> {payment.paymentMethod.replace('_', ' ')}</p>
                          <p><span className="font-semibold">Status:</span> {verificationStatus || 'Recorded'}</p>
                          {payment.verification?.verifiedAt && (
                            <p><span className="font-semibold">Verified:</span> {format(payment.verification.verifiedAt, 'MMM d, yyyy')}</p>
                          )}
                        </div>
                      )}
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )
            })}
          </div>

          {clientPayments.length > 0 && (
            <div className="mt-6 pt-6 border-t">
              <p className="text-sm text-muted-foreground mb-4">
                <span className="font-semibold text-foreground">{client.name}</span> has paid {paidMonths.length} out of {pastOrCurrentMonths.length} months since joining ({paymentRate}% payment rate)
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {selectedMonth && (
        <UpdatePaymentModal
          open={showUpdateModal}
          onOpenChange={setShowUpdateModal}
          client={client}
          month={selectedMonth}
          existingPayment={clientPayments.find(p => isSameMonth(p.date, selectedMonth))}
        />
      )}
    </div>
  )
}
