'use client'

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react'
import { Client } from '@/lib/types'
import {
  fetchClients,
  addClientToFirestore,
  updateClientInFirestore,
  deleteClientFromFirestore,
  bulkImportClientsToFirestore,
} from '@/lib/firestore'
import { toast } from 'sonner'

interface ClientContextType {
  clients: Client[]
  loading: boolean
  addClient: (client: Omit<Client, 'id'>) => Promise<Client>
  updateClient: (id: string, client: Partial<Client>) => Promise<void>
  deleteClient: (id: string) => Promise<void>
  getClient: (id: string) => Client | undefined
  bulkImportClients: (clients: Omit<Client, 'id'>[]) => Promise<void>
  clearAllClients: () => void
  refresh: () => Promise<void>
}

const ClientContext = createContext<ClientContextType | undefined>(undefined)

export function ClientProvider({ children }: { children: React.ReactNode }) {
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)

  const loadClients = useCallback(async () => {
    try {
      setLoading(true)
      const data = await fetchClients()
      setClients(data)
    } catch (error) {
      console.error('Failed to load clients:', error)
      toast.error('Failed to load clients from database')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadClients()
  }, [loadClients])

  const addClient = useCallback(async (clientData: Omit<Client, 'id'>) => {
    const newClient = await addClientToFirestore(clientData)
    setClients((prev) => [...prev, newClient])
    return newClient
  }, [])

  const updateClient = useCallback(async (id: string, updates: Partial<Client>) => {
    await updateClientInFirestore(id, updates)
    setClients((prev) =>
      prev.map((client) => (client.id === id ? { ...client, ...updates } : client))
    )
  }, [])

  const deleteClient = useCallback(async (id: string) => {
    await deleteClientFromFirestore(id)
    setClients((prev) => prev.filter((client) => client.id !== id))
  }, [])

  const getClient = useCallback(
    (id: string) => clients.find((client) => client.id === id),
    [clients]
  )

  const bulkImportClients = useCallback(async (clientsToImport: Omit<Client, 'id'>[]) => {
    const newClients = await bulkImportClientsToFirestore(clientsToImport)
    setClients((prev) => [...prev, ...newClients])
  }, [])

  const clearAllClients = useCallback(() => {
    setClients([])
  }, [])

  return (
    <ClientContext.Provider
      value={{
        clients,
        loading,
        addClient,
        updateClient,
        deleteClient,
        getClient,
        bulkImportClients,
        clearAllClients,
        refresh: loadClients,
      }}
    >
      {children}
    </ClientContext.Provider>
  )
}

export function useClients() {
  const context = useContext(ClientContext)
  if (context === undefined) {
    throw new Error('useClients must be used within a ClientProvider')
  }
  return context
}
