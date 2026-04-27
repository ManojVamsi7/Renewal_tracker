'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { getRenewalStatus, getClientRenewalDaysUntil, getClientsNeedingRenewal } from '@/lib/calculations'
import { format } from 'date-fns'
import { AlertCircle, CheckCircle, Calendar, DollarSign } from 'lucide-react'
import { useClients } from '@/components/clients/client-context'
import { usePayments } from '@/components/payments/payment-context'

export default function NotificationsPage() {
  const { clients: mockClients } = useClients()
  const { payments } = usePayments()
  
  // Filter out clients who have paid
  const clientsNeedingRenewal = getClientsNeedingRenewal(mockClients, payments)
  
  // Generate notifications based on renewal status
  const notifications = []

  clientsNeedingRenewal.forEach((client) => {
    const status = getRenewalStatus(client.renewalDate)
    const daysUntil = getClientRenewalDaysUntil(client)

    if (status === 'overdue') {
      notifications.push({
        id: `${client.id}-overdue`,
        type: 'overdue',
        title: 'Overdue Renewal',
        description: `${client.name} renewal is ${Math.abs(daysUntil)} days overdue`,
        client: client.name,
        date: client.renewalDate,
        priority: 'critical',
        icon: AlertCircle,
      })
    } else if (status === 'due-today') {
      notifications.push({
        id: `${client.id}-today`,
        type: 'dueToday',
        title: 'Renewal Due Today',
        description: `${client.name} renewal is due today`,
        client: client.name,
        date: client.renewalDate,
        priority: 'high',
        icon: AlertCircle,
      })
    } else if (status === 'due-soon') {
      notifications.push({
        id: `${client.id}-soon`,
        type: 'dueSoon',
        title: 'Renewal Due Soon',
        description: `${client.name} renewal is due in ${daysUntil} days`,
        client: client.name,
        date: client.renewalDate,
        priority: 'medium',
        icon: Calendar,
      })
    }
  })

  const criticalCount = notifications.filter(n => n.priority === 'critical').length
  const highCount = notifications.filter(n => n.priority === 'high').length

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical':
        return 'border-destructive/50 bg-destructive/5'
      case 'high':
        return 'border-yellow-500/50 bg-yellow-500/5'
      case 'medium':
        return 'border-blue-500/50 bg-blue-500/5'
      default:
        return 'border-border'
    }
  }

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'critical':
        return <Badge variant="destructive">Critical</Badge>
      case 'high':
        return <Badge variant="secondary">High</Badge>
      case 'medium':
        return <Badge variant="outline">Medium</Badge>
      default:
        return <Badge variant="outline">Low</Badge>
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Notifications</h1>
        <p className="text-muted-foreground mt-2">
          Renewal and payment alerts
        </p>
      </div>

      {/* Priority Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-destructive flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              Critical
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{criticalCount}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-yellow-600 flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              High Priority
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{highCount}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Total Notifications
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{notifications.length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Notifications List */}
      <Card>
        <CardHeader>
          <CardTitle>All Notifications</CardTitle>
          <CardDescription>
            {notifications.length === 0
              ? 'No notifications'
              : `${notifications.length} active notifications`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {notifications.length === 0 ? (
            <div className="text-center py-8">
              <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-3" />
              <p className="text-muted-foreground">All renewals are on track!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {notifications.sort((a, b) => {
                const priorityOrder = { critical: 0, high: 1, medium: 2 }
                return priorityOrder[a.priority as keyof typeof priorityOrder] -
                  priorityOrder[b.priority as keyof typeof priorityOrder]
              }).map((notification) => {
                const Icon = notification.icon
                return (
                  <div
                    key={notification.id}
                    className={`flex items-start gap-4 p-4 border-2 rounded-lg ${getPriorityColor(
                      notification.priority
                    )}`}
                  >
                    <Icon className={`w-5 h-5 mt-1 flex-shrink-0 ${
                      notification.priority === 'critical'
                        ? 'text-destructive'
                        : notification.priority === 'high'
                          ? 'text-yellow-600'
                          : 'text-blue-500'
                    }`} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-semibold">{notification.title}</h3>
                        {getPriorityBadge(notification.priority)}
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        {notification.description}
                      </p>
                      <p className="text-xs text-muted-foreground mt-2">
                        {format(notification.date, 'MMMM d, yyyy')}
                      </p>
                    </div>
                    <Button size="sm" variant="outline" className="flex-shrink-0">
                      View
                    </Button>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
