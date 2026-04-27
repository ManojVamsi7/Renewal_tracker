'use client'

import { useState } from 'react'
import { useClients } from '@/components/clients/client-context'
import { usePayments } from '@/components/payments/payment-context'
import { ClientTable } from '@/components/clients/client-table'
import { ClientForm } from '@/components/clients/client-form'
import { CSVImportModal } from '@/components/clients/csv-import-modal'
import { ClientSearch } from '@/components/clients/client-search'
import { Button } from '@/components/ui/button'
import { Client } from '@/lib/types'
import { toast } from 'sonner'
import { Upload, Trash2 } from 'lucide-react'

export default function ClientsPage() {
  const { clients, addClient, deleteClient, clearAllClients } = useClients()
  const { addPayment } = usePayments()
  const [showForm, setShowForm] = useState(false)
  const [showImport, setShowImport] = useState(false)
  const [filteredClients, setFilteredClients] = useState(clients)

  const handleAddClient = async (data: Omit<Client, 'id'>) => {
    const newClient = await addClient(data)
    
    // Automatically record the first payment for the start date
    await addPayment({
      clientId: newClient.id,
      amount: data.monthlyAmount,
      date: data.startDate,
      paymentMethod: 'other',
      notes: 'Initial signup payment',
      verification: {
        status: 'verified',
        method: 'manual',
        verifiedAt: new Date(),
        verifiedBy: 'System',
      }
    })
    
    setShowForm(false)
  }

  const handleDeleteClient = (id: string) => {
    deleteClient(id)
    toast.success('Client deleted successfully')
  }

  const handleDeleteMultiple = async (ids: string[]) => {
    try {
      await Promise.all(ids.map(id => deleteClient(id)))
      toast.success(`Successfully deleted ${ids.length} clients`)
    } catch (error) {
      toast.error('Failed to delete some clients')
    }
  }

  const handleClearAll = () => {
    if (window.confirm('Are you sure you want to delete all clients? This action cannot be undone.')) {
      clearAllClients()
      toast.success('All clients removed')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Clients</h1>
          <p className="text-muted-foreground mt-2">Manage all your clients and their subscription details. Total: {clients.length}</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setShowImport(true)} variant="outline">
            <Upload className="w-4 h-4 mr-2" />
            Import CSV
          </Button>
          <Button onClick={() => setShowForm(!showForm)}>
            {showForm ? 'Cancel' : 'Add Client'}
          </Button>
          {clients.length > 0 && (
            <Button onClick={handleClearAll} variant="destructive" size="sm">
              <Trash2 className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>

      <CSVImportModal open={showImport} onOpenChange={setShowImport} />

      {showForm && (
        <ClientForm onSubmit={handleAddClient} />
      )}

      {clients.length > 0 && (
        <ClientSearch clients={clients} onFilter={setFilteredClients} />
      )}

      <ClientTable 
        clients={filteredClients} 
        onDelete={handleDeleteClient} 
        onDeleteMultiple={handleDeleteMultiple}
      />
    </div>
  )
}
