'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { calculateKPIs, getMonthlyCollections, getRenewalStatus } from '@/lib/calculations'
import { format, startOfMonth, endOfMonth, isWithinInterval } from 'date-fns'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { useClients } from '@/components/clients/client-context'
import { usePayments } from '@/components/payments/payment-context'

export default function ReportsPage() {
  const { clients: mockClients } = useClients()
  const { payments: mockPayments } = usePayments()
  const kpis = calculateKPIs(mockClients, mockPayments)
  const monthlyCollections = getMonthlyCollections(mockPayments)
  const today = new Date()
  const thisMonthStart = startOfMonth(today)
  const thisMonthEnd = endOfMonth(today)

  // Get stats
  const activeClients = mockClients.filter(c => c.status === 'active')
  const thisMonthPayments = mockPayments.filter(p =>
    isWithinInterval(p.date, { start: thisMonthStart, end: thisMonthEnd })
  )
  const pendingClients = mockClients.filter(c => getRenewalStatus(c.renewalDate) === 'overdue')

  const chartData = Object.entries(monthlyCollections).map(([month, amount]) => ({
    month,
    amount,
  }))

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Reports</h1>
        <p className="text-muted-foreground mt-2">
          Summary of payments, renewals, and client metrics
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Clients
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{kpis.totalClients}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {activeClients.length} active
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              This Month Revenue
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${kpis.collectedThisMonth.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {thisMonthPayments.length} payments
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Overdue Renewals
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">
              {kpis.overdueRenewals}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Require immediate action
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Due in 3 Days
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {kpis.renewalsDueIn3Days}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Upcoming attention needed
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Monthly Collections Trend</CardTitle>
          <CardDescription>Revenue collected over the last 6 months</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="month" stroke="var(--muted-foreground)" />
              <YAxis stroke="var(--muted-foreground)" />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'var(--card)',
                  border: '1px solid var(--border)',
                }}
                formatter={(value) => `$${Number(value).toLocaleString()}`}
              />
              <Bar dataKey="amount" fill="var(--chart-1)" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Detailed Lists */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Active Clients */}
        <Card>
          <CardHeader>
            <CardTitle>Active Clients</CardTitle>
            <CardDescription>Clients with active subscriptions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {activeClients.map((client) => (
                <div
                  key={client.id}
                  className="flex items-center justify-between p-2 border border-border rounded"
                >
                  <div>
                    <p className="text-sm font-medium">{client.name}</p>
                    <p className="text-xs text-muted-foreground">
                      ${client.monthlyAmount.toLocaleString()}/month
                    </p>
                  </div>
                  <Badge variant="default">Active</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Overdue Renewals */}
        <Card>
          <CardHeader>
            <CardTitle>Overdue Renewals</CardTitle>
            <CardDescription>Renewals that need immediate attention</CardDescription>
          </CardHeader>
          <CardContent>
            {pendingClients.length === 0 ? (
              <p className="text-sm text-muted-foreground">No overdue renewals</p>
            ) : (
              <div className="space-y-2">
                {pendingClients.map((client) => (
                  <div
                    key={client.id}
                    className="flex items-center justify-between p-2 border border-destructive/30 rounded bg-destructive/5"
                  >
                    <div>
                      <p className="text-sm font-medium">{client.name}</p>
                      <p className="text-xs text-muted-foreground">
                        Due: {format(client.renewalDate, 'MMM d, yyyy')}
                      </p>
                    </div>
                    <Badge variant="destructive">Overdue</Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
