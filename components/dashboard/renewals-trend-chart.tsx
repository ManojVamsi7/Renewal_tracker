'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'

interface RenewalsTrendChartProps {
  data: Record<string, number>
}

export function RenewalsTrendChart({ data }: RenewalsTrendChartProps) {
  const chartData = Object.entries(data).map(([month, count]) => ({
    month,
    count,
  }))

  return (
    <Card>
      <CardHeader>
        <CardTitle>Renewals Trend</CardTitle>
        <CardDescription>Number of renewals scheduled for next 6 months</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
            <XAxis dataKey="month" stroke="var(--muted-foreground)" />
            <YAxis stroke="var(--muted-foreground)" />
            <Tooltip
              contentStyle={{
                backgroundColor: 'var(--card)',
                border: '1px solid var(--border)',
              }}
            />
            <Line
              type="monotone"
              dataKey="count"
              stroke="var(--chart-2)"
              strokeWidth={2}
              dot={{ fill: 'var(--chart-2)', r: 4 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
