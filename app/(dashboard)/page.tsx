'use client'

import { 
  TrendingUp, 
  Users, 
  AlertCircle, 
  CheckCircle,
  DollarSign,
  Calendar,
  Zap
} from 'lucide-react'
import { KPICard } from '@/components/dashboard/kpi-card'
import { MonthlyCollectionsChart } from '@/components/dashboard/monthly-collections-chart'
import { RenewalsTrendChart } from '@/components/dashboard/renewals-trend-chart'
import { UrgentRenewalsTable } from '@/components/dashboard/urgent-renewals-table'
import { RecentPaymentsTable } from '@/components/dashboard/recent-payments-table'
import { ClientsNearRenewal } from '@/components/dashboard/clients-near-renewal'
import { 
  calculateKPIs, 
  getUrgentRenewals, 
  getMonthlyCollections,
  getRenewalsTrend,
  getClientsIn5DayWarning
} from '@/lib/calculations'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { useClients } from '@/components/clients/client-context'
import { usePayments } from '@/components/payments/payment-context'

export default function Dashboard() {
  const { clients } = useClients()
  const { payments } = usePayments()
  
  const kpis = calculateKPIs(clients, payments)
  const urgentRenewals = getUrgentRenewals(clients)
  const monthlyCollections = getMonthlyCollections(payments)
  const renewalsTrend = getRenewalsTrend(clients)
  const clientsIn5DayWarning = getClientsIn5DayWarning(clients)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground mt-2">Welcome back! Here&apos;s your payment overview.</p>
        </div>
        <Link href="/clients">
          <Button>Add New Client</Button>
        </Link>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          title="Total Clients"
          value={kpis.totalClients}
          icon={Users}
          description="Active and inactive"
        />
        <KPICard
          title="Active Clients"
          value={kpis.activeClients}
          icon={CheckCircle}
          description="Current subscriptions"
        />
        <KPICard
          title="5-Day Warning"
          value={clientsIn5DayWarning.length}
          icon={Zap}
          description="Renewing within 5 days"
          variant={clientsIn5DayWarning.length > 0 ? "warning" : "default"}
        />
        <KPICard
          title="Overdue Renewals"
          value={kpis.overdueRenewals}
          icon={AlertCircle}
          description="Require immediate action"
          variant={kpis.overdueRenewals > 0 ? "destructive" : "default"}
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <MonthlyCollectionsChart data={monthlyCollections} />
        <RenewalsTrendChart data={renewalsTrend} />
      </div>

      {/* Near Renewal */}
      <ClientsNearRenewal clients={clients} />

      {/* Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <UrgentRenewalsTable clients={urgentRenewals} />
        <RecentPaymentsTable payments={payments} clients={clients} />
      </div>
    </div>
  )
}
