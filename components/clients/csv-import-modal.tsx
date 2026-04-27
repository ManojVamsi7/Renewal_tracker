'use client'

import { useState, useRef } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { useClients } from './client-context'
import { Client } from '@/lib/types'
import { toast } from 'sonner'
import { Upload, AlertCircle, CheckCircle, ArrowRight } from 'lucide-react'
import { addMonths, setDate } from 'date-fns'

interface CSVImportModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

interface ParsedClient {
  studentid: string
  name: string
  email: string
  department: string
  'date joined': string
}

export function CSVImportModal({ open, onOpenChange }: CSVImportModalProps) {
  const { bulkImportClients } = useClients()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [step, setStep] = useState(1) // 1: upload, 2: preview, 3: confirm
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<string[]>([])
  const [parsedData, setParsedData] = useState<ParsedClient[]>([])
  const [processedClients, setProcessedClients] = useState<Omit<Client, 'id'>[]>([])

  const validateAndParseCSV = (text: string) => {
    const lines = text.trim().split('\n')
    const headers = lines[0].toLowerCase().split(',').map(h => h.trim())
    
    const requiredFields = ['studentid', 'name', 'email', 'department', 'date joined']
    const missingFields = requiredFields.filter(field => !headers.includes(field))
    
    if (missingFields.length > 0) {
      setErrors([`Missing required fields: ${missingFields.join(', ')}`])
      return null
    }

    const headerIndexMap = requiredFields.reduce((acc, field) => {
      acc[field] = headers.indexOf(field)
      return acc
    }, {} as Record<string, number>)

    const parsed: ParsedClient[] = []
    const validationErrors: string[] = []

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim()
      if (!line) continue

      const values = line.split(',').map(v => v.trim())
      
      // Skip rows that are completely empty (e.g., just commas from Excel)
      if (values.every(v => v === '')) continue

      const row: ParsedClient = {
        studentid: values[headerIndexMap.studentid] || '',
        name: values[headerIndexMap.name] || '',
        email: values[headerIndexMap.email] || '',
        department: values[headerIndexMap.department] || '',
        'date joined': values[headerIndexMap['date joined']] || '',
      }

      if (!row.studentid) validationErrors.push(`Row ${i + 1}: Missing studentId`)
      if (!row.name) validationErrors.push(`Row ${i + 1}: Missing name`)
      if (!row.email) validationErrors.push(`Row ${i + 1}: Missing email`)
      if (!row.department) validationErrors.push(`Row ${i + 1}: Missing department`)
      if (!row['date joined']) validationErrors.push(`Row ${i + 1}: Missing date joined`)

      if (validationErrors.length === 0) {
        parsed.push(row)
      }
    }

    if (validationErrors.length > 0) {
      setErrors(validationErrors.slice(0, 10))
      return null
    }

    return parsed
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      const text = event.target?.result as string
      const parsed = validateAndParseCSV(text)
      
      if (parsed) {
        setParsedData(parsed)
        processClients(parsed)
        setStep(2)
        setErrors([])
      }
    }
    reader.readAsText(file)
  }

  const processClients = (data: ParsedClient[]) => {
    const clients: Omit<Client, 'id'>[] = data.map(row => {
      let startDate: Date
      
      // Handle DD-MM-YYYY format common in Indian/European Excel exports
      const dateParts = row['date joined'].split('-')
      if (dateParts.length === 3 && dateParts[0].length <= 2) {
        // DD-MM-YYYY
        startDate = new Date(parseInt(dateParts[2]), parseInt(dateParts[1]) - 1, parseInt(dateParts[0]))
      } else {
        startDate = new Date(row['date joined'])
      }
      
      // Fallback if date is still invalid
      if (isNaN(startDate.getTime())) {
        startDate = new Date()
      }
      
      const dayOfMonth = startDate.getDate()
      const nextMonth = addMonths(startDate, 1)
      const renewalDate = setDate(nextMonth, dayOfMonth)

      return {
        studentId: row.studentid,
        name: row.name,
        email: row.email,
        phone: '', // Not in CSV, will be empty
        department: row.department,
        monthlyAmount: 0, // Not in CSV, can be added later
        startDate,
        renewalDate,
        status: 'active' as const,
        notes: `Imported from CSV on ${new Date().toLocaleDateString()}`,
      }
    })
    setProcessedClients(clients)
  }

  const handleConfirmImport = async () => {
    setLoading(true)
    try {
      bulkImportClients(processedClients)
      toast.success(`Successfully imported ${processedClients.length} clients`)
      onOpenChange(false)
      setStep(1)
      setParsedData([])
      setProcessedClients([])
      if (fileInputRef.current) fileInputRef.current.value = ''
    } catch (error) {
      toast.error('Failed to import clients')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const handleReset = () => {
    setStep(1)
    setParsedData([])
    setProcessedClients([])
    setErrors([])
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-96 overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Import Clients from CSV</DialogTitle>
          <DialogDescription>
            Upload a CSV file with student details. Required columns: studentid, name, email, department, date joined
          </DialogDescription>
        </DialogHeader>

        {/* Step 1: Upload */}
        {step === 1 && (
          <div className="space-y-4">
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
              <Upload className="w-8 h-8 mx-auto text-gray-400 mb-2" />
              <p className="text-sm font-medium mb-2">Click to upload or drag and drop</p>
              <p className="text-xs text-gray-500 mb-4">CSV file only</p>
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                onChange={handleFileUpload}
                className="hidden"
                aria-label="Upload CSV file"
              />
              <Button
                onClick={() => fileInputRef.current?.click()}
                variant="outline"
              >
                Choose File
              </Button>
            </div>

            <div className="bg-blue-50 dark:bg-blue-950/20 p-4 rounded-lg">
              <h4 className="font-semibold text-sm mb-2">CSV Format Example:</h4>
              <code className="text-xs block overflow-x-auto">
                studentid,name,email,department,date joined{'\n'}
                STU001,John Doe,john@example.com,Engineering,2024-01-15{'\n'}
                STU002,Jane Smith,jane@example.com,Marketing,2024-01-20
              </code>
            </div>
          </div>
        )}

        {/* Step 2: Preview */}
        {step === 2 && (
          <div className="space-y-4">
            <Alert>
              <CheckCircle className="w-4 h-4 text-green-600" />
              <AlertDescription>
                Found {processedClients.length} clients ready to import
              </AlertDescription>
            </Alert>

            <div className="border rounded-lg overflow-hidden">
              <div className="max-h-64 overflow-y-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-100 dark:bg-gray-800 sticky top-0">
                    <tr>
                      <th className="px-3 py-2 text-left font-medium">StudentId</th>
                      <th className="px-3 py-2 text-left font-medium">Name</th>
                      <th className="px-3 py-2 text-left font-medium">Email</th>
                      <th className="px-3 py-2 text-left font-medium">Department</th>
                    </tr>
                  </thead>
                  <tbody>
                    {processedClients.slice(0, 10).map((client, idx) => (
                      <tr key={idx} className="border-t hover:bg-gray-50 dark:hover:bg-gray-800/50">
                        <td className="px-3 py-2 font-mono text-xs">{client.studentId}</td>
                        <td className="px-3 py-2">{client.name}</td>
                        <td className="px-3 py-2 text-xs">{client.email}</td>
                        <td className="px-3 py-2">{client.department}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {processedClients.length > 10 && (
                <div className="bg-gray-50 dark:bg-gray-800 px-3 py-2 text-center text-sm text-gray-600 dark:text-gray-400">
                  +{processedClients.length - 10} more clients
                </div>
              )}
            </div>

            <div className="flex gap-2">
              <Button variant="outline" onClick={handleReset}>
                Back
              </Button>
              <Button onClick={() => setStep(3)} className="flex-1">
                Continue <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: Confirm */}
        {step === 3 && (
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Import Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Total clients to import:</span>
                  <Badge>{processedClients.length}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Start date field:</span>
                  <Badge variant="outline">Date Joined</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Renewal date:</span>
                  <Badge variant="outline">+1 Month from Start</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Status:</span>
                  <Badge variant="outline">Active</Badge>
                </div>
              </CardContent>
            </Card>

            <Alert>
              <AlertCircle className="w-4 h-4" />
              <AlertDescription>
                This action will import all clients. You can edit details after import.
              </AlertDescription>
            </Alert>

            <div className="flex gap-2">
              <Button variant="outline" onClick={handleReset}>
                Cancel
              </Button>
              <Button onClick={handleConfirmImport} disabled={loading} className="flex-1">
                {loading ? 'Importing...' : 'Confirm Import'}
              </Button>
            </div>
          </div>
        )}

        {/* Errors */}
        {errors.length > 0 && (
          <Alert className="border-red-200 dark:border-red-800">
            <AlertCircle className="w-4 h-4 text-red-600" />
            <AlertDescription className="text-red-600 dark:text-red-400">
              <div className="font-medium mb-2">Validation Errors:</div>
              <ul className="text-sm space-y-1 max-h-40 overflow-y-auto">
                {errors.map((error, idx) => (
                  <li key={idx}>- {error}</li>
                ))}
              </ul>
            </AlertDescription>
          </Alert>
        )}
      </DialogContent>
    </Dialog>
  )
}
