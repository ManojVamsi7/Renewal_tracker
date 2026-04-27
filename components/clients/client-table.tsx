'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { Client } from '@/lib/types'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Edit2, Trash2, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react'
import { format } from 'date-fns'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'

import { Checkbox } from '@/components/ui/checkbox'

interface ClientTableProps {
  clients: Client[]
  onDelete: (id: string) => void
  onDeleteMultiple?: (ids: string[]) => void
}

type SortKey = keyof Client | 'studentId'
type SortConfig = { key: SortKey; direction: 'asc' | 'desc' }

export function ClientTable({ clients, onDelete, onDeleteMultiple }: ClientTableProps) {
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [showDeleteMultiple, setShowDeleteMultiple] = useState(false)
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: 'studentId', direction: 'asc' })

  const sortedClients = useMemo(() => {
    const sortableClients = [...clients]
    if (sortConfig.key) {
      sortableClients.sort((a, b) => {
        const aValue = a[sortConfig.key as keyof Client]
        const bValue = b[sortConfig.key as keyof Client]

        if (aValue === undefined || bValue === undefined) return 0

        if (typeof aValue === 'string' && typeof bValue === 'string') {
          return sortConfig.direction === 'asc' 
            ? aValue.localeCompare(bValue, undefined, { numeric: true })
            : bValue.localeCompare(aValue, undefined, { numeric: true })
        }

        if (aValue < bValue) {
          return sortConfig.direction === 'asc' ? -1 : 1
        }
        if (aValue > bValue) {
          return sortConfig.direction === 'asc' ? 1 : -1
        }
        return 0
      })
    }
    return sortableClients
  }, [clients, sortConfig])

  const requestSort = (key: SortKey) => {
    let direction: 'asc' | 'desc' = 'asc'
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc'
    }
    setSortConfig({ key, direction })
  }

  const getSortIcon = (key: SortKey) => {
    if (sortConfig.key !== key) return <ArrowUpDown className="w-3 h-3 ml-1 opacity-50" />
    return sortConfig.direction === 'asc' ? 
      <ArrowUp className="w-3 h-3 ml-1 text-primary" /> : 
      <ArrowDown className="w-3 h-3 ml-1 text-primary" />
  }

  const toggleSelectAll = () => {
    if (selectedIds.size === clients.length && clients.length > 0) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(clients.map(c => c.id)))
    }
  }

  const toggleSelect = (id: string) => {
    const newSet = new Set(selectedIds)
    if (newSet.has(id)) newSet.delete(id)
    else newSet.add(id)
    setSelectedIds(newSet)
  }

  const handleDeleteMultiple = () => {
    if (onDeleteMultiple && selectedIds.size > 0) {
      onDeleteMultiple(Array.from(selectedIds))
      setSelectedIds(new Set())
      setShowDeleteMultiple(false)
    }
  }

  const handleDelete = () => {
    if (deleteId) {
      onDelete(deleteId)
      setDeleteId(null)
    }
  }

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>All Clients</CardTitle>
            <CardDescription>Manage your client list</CardDescription>
          </div>
          {selectedIds.size > 0 && (
            <Button variant="destructive" size="sm" onClick={() => setShowDeleteMultiple(true)} className="gap-2">
              <Trash2 className="w-4 h-4" />
              Delete Selected ({selectedIds.size})
            </Button>
          )}
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="sticky top-0 bg-card z-10 shadow-sm">
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-2 font-medium w-10">
                    <Checkbox 
                      checked={clients.length > 0 && selectedIds.size === clients.length} 
                      onCheckedChange={toggleSelectAll} 
                      aria-label="Select all"
                    />
                  </th>
                  <th className="text-left py-3 px-2 font-medium">
                    <button className="flex items-center hover:text-primary transition-colors" onClick={() => requestSort('studentId')}>
                      Student ID {getSortIcon('studentId')}
                    </button>
                  </th>
                  <th className="text-left py-3 px-2 font-medium">
                    <button className="flex items-center hover:text-primary transition-colors" onClick={() => requestSort('name')}>
                      Name {getSortIcon('name')}
                    </button>
                  </th>
                  <th className="text-left py-3 px-2 font-medium">
                    <button className="flex items-center hover:text-primary transition-colors" onClick={() => requestSort('email')}>
                      Email {getSortIcon('email')}
                    </button>
                  </th>
                  <th className="text-left py-3 px-2 font-medium">
                    <button className="flex items-center hover:text-primary transition-colors" onClick={() => requestSort('department')}>
                      Department {getSortIcon('department')}
                    </button>
                  </th>
                  <th className="text-left py-3 px-2 font-medium">
                    <button className="flex items-center hover:text-primary transition-colors" onClick={() => requestSort('monthlyAmount')}>
                      Monthly {getSortIcon('monthlyAmount')}
                    </button>
                  </th>
                  <th className="text-left py-3 px-2 font-medium">
                    <button className="flex items-center hover:text-primary transition-colors" onClick={() => requestSort('renewalDate')}>
                      Renewal Date {getSortIcon('renewalDate')}
                    </button>
                  </th>
                  <th className="text-left py-3 px-2 font-medium">
                    <button className="flex items-center hover:text-primary transition-colors" onClick={() => requestSort('status')}>
                      Status {getSortIcon('status')}
                    </button>
                  </th>
                  <th className="text-left py-3 px-2 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {sortedClients.map((client) => (
                  <tr key={client.id} className="border-b border-border hover:bg-muted/50">
                    <td className="py-3 px-2">
                      <Checkbox 
                        checked={selectedIds.has(client.id)}
                        onCheckedChange={() => toggleSelect(client.id)}
                        aria-label={`Select ${client.name}`}
                      />
                    </td>
                    <td className="py-3 px-2 font-mono text-xs font-semibold">{client.studentId}</td>
                    <td className="py-3 px-2 font-medium">{client.name}</td>
                    <td className="py-3 px-2 text-muted-foreground text-xs">{client.email}</td>
                    <td className="py-3 px-2">{client.department}</td>
                    <td className="py-3 px-2 font-semibold">
                      ${client.monthlyAmount.toLocaleString()}
                    </td>
                    <td className="py-3 px-2 text-muted-foreground">
                      {format(client.renewalDate, 'MMM d, yyyy')}
                    </td>
                    <td className="py-3 px-2">
                      <Badge variant={client.status === 'active' ? 'default' : 'secondary'}>
                        {client.status}
                      </Badge>
                    </td>
                    <td className="py-3 px-2">
                      <div className="flex gap-2">
                        <Link href={`/clients/${client.id}`}>
                          <Button size="sm" variant="outline" className="gap-2">
                            <Edit2 className="w-4 h-4" />
                            Edit
                          </Button>
                        </Link>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-destructive hover:text-destructive"
                          onClick={() => setDeleteId(client.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <AlertDialog open={deleteId !== null} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Client</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this client? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex gap-4 justify-end">
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={showDeleteMultiple} onOpenChange={setShowDeleteMultiple}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Multiple Clients</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {selectedIds.size} clients? This action cannot be undone and will permanently remove them.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex gap-4 justify-end">
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteMultiple} className="bg-destructive hover:bg-destructive/90">
              Delete All Selected
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
