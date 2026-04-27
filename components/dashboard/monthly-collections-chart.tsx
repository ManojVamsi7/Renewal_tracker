'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'

interface MonthlyCollectionsChartProps {
  data: Record<string, number>
}

export function MonthlyCollectionsChart({ data }: MonthlyCollectionsChartProps) {
  const chartData = Object.entries(data).map(([month, amount]) => ({
    month,
    amount,
  }))

  return (
    <Card>
      <CardHeader>
        <CardTitle>Monthly Collections</CardTitle>
        <CardDescription>Revenue collected over the last 6 months</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
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
  )
}
