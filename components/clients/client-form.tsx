'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Client } from '@/lib/types'
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
import { calculateNextRenewalDate } from '@/lib/calculations'
import { addMonths, setDate } from 'date-fns'

const clientFormSchema = z.object({
  studentId: z.string().min(1, 'Student ID is required'),
  name: z.string().min(1, 'Client name is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(1, 'Phone is required'),
  department: z.string().min(1, 'Department is required'),
  monthlyAmount: z.string().transform(v => parseFloat(v)).refine(v => v > 0, 'Monthly amount must be positive'),
  startDate: z.string().min(1, 'Start date is required'),
  renewalDate: z.string().min(1, 'Renewal date is required'),
  status: z.enum(['active', 'inactive']),
  notes: z.string().optional(),
})

type ClientFormData = z.infer<typeof clientFormSchema>

interface ClientFormProps {
  initialData?: Client
  onSubmit: (data: Omit<Client, 'id'>) => void | Promise<void>
  isLoading?: boolean
}

export function ClientForm({ initialData, onSubmit, isLoading = false }: ClientFormProps) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ClientFormData>({
    resolver: zodResolver(clientFormSchema),
    defaultValues: initialData
      ? {
          studentId: initialData.studentId,
          name: initialData.name,
          email: initialData.email,
          phone: initialData.phone,
          department: initialData.department,
          monthlyAmount: initialData.monthlyAmount.toString(),
          startDate: initialData.startDate.toISOString().split('T')[0],
          renewalDate: initialData.renewalDate.toISOString().split('T')[0],
          status: initialData.status,
          notes: initialData.notes || '',
        }
      : undefined,
  })

  const status = watch('status')
  const startDate = watch('startDate')

  // Auto-calculate renewal date when start date changes (for new clients only)
  useEffect(() => {
    if (startDate && !initialData) {
      const date = new Date(startDate)
      const dayOfMonth = date.getDate()
      const nextMonth = addMonths(date, 1)
      const renewalDate = setDate(nextMonth, dayOfMonth)
      setValue('renewalDate', renewalDate.toISOString().split('T')[0])
    }
  }, [startDate, initialData, setValue])

  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleFormSubmit = async (data: ClientFormData) => {
    try {
      setIsSubmitting(true)
      await onSubmit({
        studentId: data.studentId,
        name: data.name,
        email: data.email,
        phone: data.phone,
        department: data.department,
        monthlyAmount: data.monthlyAmount,
        startDate: new Date(data.startDate),
        renewalDate: new Date(data.renewalDate),
        status: data.status,
        notes: data.notes,
      })
      toast.success(initialData ? 'Client updated successfully' : 'Client added successfully')
    } catch (error) {
      toast.error('Failed to save client')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{initialData ? 'Edit Client' : 'Add New Client'}</CardTitle>
        <CardDescription>
          {initialData ? 'Update client information' : 'Enter details for the new client'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="studentId">Student ID *</Label>
              <Input
                id="studentId"
                placeholder="e.g., STU001"
                {...register('studentId')}
                className="mt-2"
                aria-describedby={errors.studentId ? 'studentId-error' : undefined}
              />
              {errors.studentId && (
                <div id="studentId-error" className="mt-2 p-2 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded text-red-700 dark:text-red-300 text-sm" role="alert" aria-live="polite">
                  {errors.studentId.message}
                </div>
              )}
            </div>

            <div>
              <Label htmlFor="name">Client Name *</Label>
              <Input
                id="name"
                placeholder="Full name"
                {...register('name')}
                className="mt-2"
              />
              {errors.name && (
                <div className="mt-2 p-2 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded text-red-700 dark:text-red-300 text-sm" role="alert" aria-live="polite">
                  {errors.name.message}
                </div>
              )}
            </div>

            <div>
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                placeholder="email@example.com"
                {...register('email')}
                className="mt-2"
                aria-describedby={errors.email ? 'email-error' : undefined}
              />
              {errors.email && (
                <div id="email-error" className="mt-2 p-2 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded text-red-700 dark:text-red-300 text-sm" role="alert" aria-live="polite">
                  {errors.email.message}
                </div>
              )}
            </div>

            <div>
              <Label htmlFor="phone">Phone *</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="+1 (555) 123-4567"
                {...register('phone')}
                className="mt-2"
                aria-describedby={errors.phone ? 'phone-error' : undefined}
              />
              {errors.phone && (
                <div id="phone-error" className="mt-2 p-2 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded text-red-700 dark:text-red-300 text-sm" role="alert" aria-live="polite">
                  {errors.phone.message}
                </div>
              )}
            </div>

            <div>
              <Label htmlFor="department">Department *</Label>
              <Input
                id="department"
                placeholder="e.g., Engineering, Marketing"
                {...register('department')}
                className="mt-2"
                aria-describedby={errors.department ? 'department-error' : undefined}
              />
              {errors.department && (
                <div id="department-error" className="mt-2 p-2 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded text-red-700 dark:text-red-300 text-sm" role="alert" aria-live="polite">
                  {errors.department.message}
                </div>
              )}
            </div>

            <div>
              <Label htmlFor="monthlyAmount">Monthly Amount ($) *</Label>
              <Input
                id="monthlyAmount"
                type="number"
                step="0.01"
                placeholder="5000"
                {...register('monthlyAmount')}
                className="mt-2"
              />
              {errors.monthlyAmount && (
                <p className="text-red-500 text-sm mt-1">{errors.monthlyAmount.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="status">Status *</Label>
              <Select value={status} onValueChange={(value) => setValue('status', value as 'active' | 'inactive')}>
                <SelectTrigger className="mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="startDate">Start Date *</Label>
              <Input
                id="startDate"
                type="date"
                {...register('startDate')}
                className="mt-2"
              />
              {errors.startDate && (
                <p className="text-red-500 text-sm mt-1">{errors.startDate.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="renewalDate">Renewal Date *</Label>
              <Input
                id="renewalDate"
                type="date"
                {...register('renewalDate')}
                className="mt-2"
              />
              {errors.renewalDate && (
                <p className="text-red-500 text-sm mt-1">{errors.renewalDate.message}</p>
              )}
            </div>
          </div>

          <div>
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              placeholder="Additional notes about the client"
              {...register('notes')}
              className="mt-2"
              rows={4}
            />
          </div>

          <div className="flex gap-4">
            <Button type="submit" disabled={isLoading || isSubmitting}>
              {(isLoading || isSubmitting) ? 'Saving...' : initialData ? 'Update Client' : 'Add Client'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
