import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

interface KPICardProps {
  title: string
  value: number | string
  description?: string
  icon: LucideIcon
  trend?: {
    value: number
    label: string
    isPositive: boolean
  }
  className?: string
  variant?: 'default' | 'warning' | 'destructive'
  ariaLabel?: string
}

export function KPICard({
  title,
  value,
  description,
  icon: Icon,
  trend,
  className,
  variant = 'default',
  ariaLabel,
}: KPICardProps) {
  const variantStyles = {
    default: {
      cardClass: 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 hover:shadow-md transition-all duration-200',
      iconBg: 'bg-blue-100 dark:bg-blue-900/30',
      iconColor: 'text-blue-600 dark:text-blue-400',
      textColor: 'text-gray-900 dark:text-gray-100',
    },
    warning: {
      cardClass: 'border-amber-300 dark:border-amber-700 bg-amber-50 dark:bg-amber-950/20 hover:shadow-md transition-all duration-200',
      iconBg: 'bg-amber-100 dark:bg-amber-900/40',
      iconColor: 'text-amber-600 dark:text-amber-400',
      textColor: 'text-amber-700 dark:text-amber-300',
    },
    destructive: {
      cardClass: 'border-red-300 dark:border-red-700 bg-red-50 dark:bg-red-950/20 hover:shadow-md transition-all duration-200',
      iconBg: 'bg-red-100 dark:bg-red-900/40',
      iconColor: 'text-red-600 dark:text-red-400',
      textColor: 'text-red-700 dark:text-red-300',
    },
  }

  const styles = variantStyles[variant]

  return (
    <Card className={cn(styles.cardClass, className)} role="region" aria-label={ariaLabel || title}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="flex-1">
          <CardTitle className="text-sm font-semibold text-gray-700 dark:text-gray-300">{title}</CardTitle>
          {description && (
            <CardDescription className="text-xs mt-2 text-gray-600 dark:text-gray-400">{description}</CardDescription>
          )}
        </div>
        <div className={cn('p-3 rounded-lg flex-shrink-0', styles.iconBg)} aria-hidden="true">
          <Icon className={cn('w-5 h-5', styles.iconColor)} />
        </div>
      </CardHeader>
      <CardContent>
        <div className={cn('text-3xl font-bold tracking-tight', styles.textColor)} role="status">
          {value}
        </div>
        {trend && (
          <p
            className={cn(
              'text-xs mt-3 font-medium',
              trend.isPositive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
            )}
            aria-label={`${trend.label}: ${trend.isPositive ? 'increased' : 'decreased'} by ${trend.value}%`}
          >
            <span aria-hidden="true">{trend.isPositive ? '↑' : '↓'}</span> {trend.value}% {trend.label}
          </p>
        )}
      </CardContent>
    </Card>
  )
}
