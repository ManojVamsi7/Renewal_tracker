'use client'

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react'
import { Payment } from '@/lib/types'
import {
  fetchPayments,
  addPaymentToFirestore,
  updatePaymentInFirestore,
  deletePaymentFromFirestore,
} from '@/lib/firestore'
import { toast } from 'sonner'

interface PaymentContextType {
  payments: Payment[]
  loading: boolean
  addPayment: (payment: Omit<Payment, 'id'>) => Promise<void>
  updatePayment: (id: string, payment: Partial<Payment>) => Promise<void>
  deletePayment: (id: string) => Promise<void>
  getClientPayments: (clientId: string) => Payment[]
  refresh: () => Promise<void>
}

const PaymentContext = createContext<PaymentContextType | undefined>(undefined)

export function PaymentProvider({ children }: { children: React.ReactNode }) {
  const [payments, setPayments] = useState<Payment[]>([])
  const [loading, setLoading] = useState(true)

  const loadPayments = useCallback(async () => {
    try {
      setLoading(true)
      const data = await fetchPayments()
      setPayments(data)
    } catch (error) {
      console.error('Failed to load payments:', error)
      toast.error('Failed to load payments from database')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadPayments()
  }, [loadPayments])

  const addPayment = useCallback(async (paymentData: Omit<Payment, 'id'>) => {
    const newPayment = await addPaymentToFirestore(paymentData)
    setPayments((prev) => [newPayment, ...prev])
  }, [])

  const updatePayment = useCallback(async (id: string, updates: Partial<Payment>) => {
    await updatePaymentInFirestore(id, updates)
    setPayments((prev) =>
      prev.map((payment) => (payment.id === id ? { ...payment, ...updates } : payment))
    )
  }, [])

  const deletePayment = useCallback(async (id: string) => {
    await deletePaymentFromFirestore(id)
    setPayments((prev) => prev.filter((payment) => payment.id !== id))
  }, [])

  const getClientPayments = useCallback(
    (clientId: string) => payments.filter((p) => p.clientId === clientId),
    [payments]
  )

  return (
    <PaymentContext.Provider
      value={{
        payments,
        loading,
        addPayment,
        updatePayment,
        deletePayment,
        getClientPayments,
        refresh: loadPayments,
      }}
    >
      {children}
    </PaymentContext.Provider>
  )
}

export function usePayments() {
  const context = useContext(PaymentContext)
  if (context === undefined) {
    throw new Error('usePayments must be used within a PaymentProvider')
  }
  return context
}
