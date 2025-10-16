'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { FinanceOverview } from '@/types/finance'
import { formatCurrency, formatPercentage } from '@/lib/financeQueries'
import { 
  TrendingUp, 
  TrendingDown,
  DollarSign,
  Wallet,
  CreditCard,
  PiggyBank,
  Activity,
  Target
} from 'lucide-react'

interface FinanceOverviewCardsProps {
  overview: FinanceOverview
  loading?: boolean
}

export default function FinanceOverviewCards({ overview, loading = false }: FinanceOverviewCardsProps) {
  const kpiData = [
    {
      title: 'Total Pendapatan',
      value: formatCurrency(overview.totalPendapatan),
      subtitle: `Terbayar: ${formatCurrency(overview.pendapatanTerbayar)}`,
      icon: TrendingUp,
      iconColor: 'text-green-500',
      bgColor: 'bg-green-500/10',
      borderColor: 'border-green-500/20',
      trend: overview.pendapatanGrowth,
    },
    {
      title: 'Total Pengeluaran',
      value: formatCurrency(overview.totalPengeluaran),
      subtitle: `Terbayar: ${formatCurrency(overview.pengeluaranLunas)}`,
      icon: TrendingDown,
      iconColor: 'text-red-500',
      bgColor: 'bg-red-500/10',
      borderColor: 'border-red-500/20',
      trend: overview.pengeluaranGrowth,
    },
    {
      title: 'Net Cashflow',
      value: formatCurrency(overview.netCashflow),
      subtitle: overview.netCashflow >= 0 ? 'Surplus' : 'Defisit',
      icon: Activity,
      iconColor: overview.netCashflow >= 0 ? 'text-emerald-500' : 'text-amber-500',
      bgColor: overview.netCashflow >= 0 ? 'bg-emerald-500/10' : 'bg-amber-500/10',
      borderColor: overview.netCashflow >= 0 ? 'border-emerald-500/20' : 'border-amber-500/20',
    },
    {
      title: 'Net Profit',
      value: formatCurrency(overview.netProfit),
      subtitle: overview.netProfit >= 0 ? 'Profit' : 'Loss',
      icon: PiggyBank,
      iconColor: overview.netProfit >= 0 ? 'text-blue-500' : 'text-orange-500',
      bgColor: overview.netProfit >= 0 ? 'bg-blue-500/10' : 'bg-orange-500/10',
      borderColor: overview.netProfit >= 0 ? 'border-blue-500/20' : 'border-orange-500/20',
    },
    {
      title: 'Rasio Cashflow',
      value: formatPercentage(overview.cashflowRatio),
      subtitle: overview.cashflowRatio >= 100 ? 'Sehat' : 'Perlu Perhatian',
      icon: Target,
      iconColor: overview.cashflowRatio >= 100 ? 'text-cyan-500' : 'text-yellow-500',
      bgColor: overview.cashflowRatio >= 100 ? 'bg-cyan-500/10' : 'bg-yellow-500/10',
      borderColor: overview.cashflowRatio >= 100 ? 'border-cyan-500/20' : 'border-yellow-500/20',
    },
    {
      title: 'Pendapatan Pending',
      value: formatCurrency(overview.pendapatanPending),
      subtitle: 'Belum Terbayar',
      icon: Wallet,
      iconColor: 'text-purple-500',
      bgColor: 'bg-purple-500/10',
      borderColor: 'border-purple-500/20',
    },
  ]

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, index) => (
          <Card key={index} className="animate-pulse">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="h-4 bg-muted rounded w-24"></div>
              <div className="h-10 w-10 bg-muted rounded-lg"></div>
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-muted rounded w-32 mb-2"></div>
              <div className="h-3 bg-muted rounded w-20"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {kpiData.map((kpi, index) => {
        const Icon = kpi.icon
        return (
          <Card
            key={index}
            className={`border-2 ${kpi.borderColor} ${kpi.bgColor} transition-all duration-200 hover:scale-105 hover:shadow-lg group`}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {kpi.title}
              </CardTitle>
              <div className={`h-10 w-10 rounded-lg ${kpi.bgColor} flex items-center justify-center group-hover:brightness-110 transition-all`}>
                <Icon className={`h-5 w-5 ${kpi.iconColor}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${kpi.iconColor} mb-1`}>
                {kpi.value}
              </div>
              <p className="text-xs text-muted-foreground">
                {kpi.subtitle}
              </p>
              {kpi.trend !== undefined && kpi.trend !== 0 && (
                <div className={`flex items-center gap-1 mt-2 text-xs ${
                  kpi.trend > 0 ? 'text-green-500' : 'text-red-500'
                }`}>
                  {kpi.trend > 0 ? (
                    <TrendingUp className="h-3 w-3" />
                  ) : (
                    <TrendingDown className="h-3 w-3" />
                  )}
                  <span>{Math.abs(kpi.trend).toFixed(1)}%</span>
                </div>
              )}
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
