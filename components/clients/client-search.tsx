'use client'

import { useState, useMemo, useEffect } from 'react'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Search, X } from 'lucide-react'
import { Client } from '@/lib/types'

interface ClientSearchProps {
  clients: Client[]
  onFilter: (filtered: Client[]) => void
}

export function ClientSearch({ clients, onFilter }: ClientSearchProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [searchType, setSearchType] = useState<'all' | 'studentId' | 'name'>('all')

  const filteredClients = useMemo(() => {
    if (!searchTerm.trim()) {
      return clients
    }

    const lowerSearch = searchTerm.toLowerCase()

    return clients.filter(client => {
      if (searchType === 'studentId') {
        return client.studentId.toLowerCase().includes(lowerSearch)
      } else if (searchType === 'name') {
        return client.name.toLowerCase().includes(lowerSearch)
      } else {
        return (
          client.studentId.toLowerCase().includes(lowerSearch) ||
          client.name.toLowerCase().includes(lowerSearch) ||
          client.email.toLowerCase().includes(lowerSearch) ||
          client.department.toLowerCase().includes(lowerSearch)
        )
      }
    })
  }, [searchTerm, searchType, clients])

  useEffect(() => {
    onFilter(filteredClients)
  }, [filteredClients, onFilter])

  const handleClear = () => {
    setSearchTerm('')
  }

  const handleSearchChange = (value: string) => {
    setSearchTerm(value)
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Search by name, student ID, email, or department..."
            value={searchTerm}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pl-9 pr-9"
            aria-label="Search clients"
          />
          {searchTerm && (
            <button
              onClick={handleClear}
              className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              aria-label="Clear search"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => {
              setSearchType('all')
              handleSearchChange(searchTerm)
            }}
            className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              searchType === 'all'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
          >
            All
          </button>
          <button
            onClick={() => {
              setSearchType('studentId')
              handleSearchChange(searchTerm)
            }}
            className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              searchType === 'studentId'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
          >
            ID
          </button>
          <button
            onClick={() => {
              setSearchType('name')
              handleSearchChange(searchTerm)
            }}
            className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              searchType === 'name'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
          >
            Name
          </button>
        </div>
      </div>

      {searchTerm && (
        <Card className="p-3 bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800">
          <p className="text-sm">
            Found <Badge variant="default">{filteredClients.length}</Badge> of{' '}
            <Badge variant="outline">{clients.length}</Badge> clients
            {searchType !== 'all' && (
              <>
                {' '} (searching by <Badge variant="outline">{searchType === 'studentId' ? 'Student ID' : 'Name'}</Badge>)
              </>
            )}
          </p>
        </Card>
      )}
    </div>
  )
}
