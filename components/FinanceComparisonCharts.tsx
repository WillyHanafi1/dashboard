'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { FinanceComparison, FinanceHealth, TopCategory } from '@/types/finance'
import { formatCurrency, formatPercentage } from '@/lib/financeQueries'
import { AreaChart, BarChart, DonutChart } from '@tremor/react'
import { TrendingUp, AlertCircle, CheckCircle2, Activity } from 'lucide-react'

interface FinanceComparisonChartsProps {
  comparisonData: FinanceComparison[]
  healthData: FinanceHealth
  topCategories: TopCategory[]
  loading?: boolean
}

export default function FinanceComparisonCharts({ 
  comparisonData, 
  healthData,
  topCategories,
  loading = false 
}: FinanceComparisonChartsProps) {
  // Prepare data for charts
  const renamedComparisonData = comparisonData.map(item => ({
    ...item,
    'Pendapatan': item.pendapatan,
    'Pengeluaran': item.pengeluaran,
    'Net Cashflow': item.netCashflow,
  }))

  // Separate income and expense categories
  const incomeCategories = topCategories.filter(cat => cat.type === 'income')
  const expenseCategories = topCategories.filter(cat => cat.type === 'expense')

  // Get health status color
  const getHealthColor = (status: string) => {
    switch (status) {
      case 'Excellent': return 'text-green-500 bg-green-500/10 border-green-500/20'
      case 'Good': return 'text-blue-500 bg-blue-500/10 border-blue-500/20'
      case 'Fair': return 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20'
      case 'Poor': return 'text-red-500 bg-red-500/10 border-red-500/20'
      default: return 'text-gray-500 bg-gray-500/10 border-gray-500/20'
    }
  }

  const getIndicatorIcon = (status: string) => {
    switch (status) {
      case 'positive': return <CheckCircle2 className="h-4 w-4 text-green-500" />
      case 'neutral': return <Activity className="h-4 w-4 text-yellow-500" />
      case 'negative': return <AlertCircle className="h-4 w-4 text-red-500" />
      default: return null
    }
  }

  if (loading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {Array.from({ length: 4 }).map((_, index) => (
          <Card key={index} className="animate-pulse">
            <CardHeader>
              <div className="h-5 bg-muted rounded w-32"></div>
              <div className="h-4 bg-muted rounded w-48"></div>
            </CardHeader>
            <CardContent>
              <div className="h-64 bg-muted rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Finance Health Score */}
      <Card className={`border-2 ${getHealthColor(healthData.status)}`}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-card-foreground">Finance Health Score</CardTitle>
              <CardDescription className="text-muted-foreground">
                Indikator kesehatan keuangan secara keseluruhan
              </CardDescription>
            </div>
            <div className="text-center">
              <div className={`text-4xl font-bold ${getHealthColor(healthData.status).split(' ')[0]}`}>
                {healthData.healthScore}
              </div>
              <div className={`text-sm font-medium ${getHealthColor(healthData.status).split(' ')[0]}`}>
                {healthData.status}
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {healthData.indicators.map((indicator, index) => (
              <div 
                key={index}
                className="flex items-start gap-3 p-3 bg-background/50 rounded-lg border border-border"
              >
                <div className="mt-1">
                  {getIndicatorIcon(indicator.status)}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">{indicator.name}</p>
                  <p className="text-xs text-muted-foreground mt-1">{indicator.description}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Comparison Chart */}
      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle className="text-card-foreground">Perbandingan Pendapatan vs Pengeluaran</CardTitle>
          <CardDescription className="text-muted-foreground">
            Tren bulanan pendapatan dan pengeluaran (Januari - Desember)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AreaChart
            className="h-80"
            data={renamedComparisonData}
            index="bulan"
            categories={["Pendapatan", "Pengeluaran"]}
            colors={["emerald", "rose"]}
            valueFormatter={(value) => formatCurrency(value)}
            yAxisWidth={150}
            curveType="monotone"
            showAnimation={true}
            connectNulls={true}
            customTooltip={({ active, payload, label }) => {
              if (active && payload && payload.length) {
                const data = payload[0].payload as FinanceComparison
                return (
                  <div className="bg-background border border-border rounded-lg shadow-lg p-4">
                    <p className="text-foreground font-medium mb-2">{label}</p>
                    <div className="space-y-1">
                      <div className="flex items-center justify-between gap-4">
                        <span className="text-sm text-emerald-500">Pendapatan:</span>
                        <span className="text-sm font-semibold text-emerald-500">
                          {formatCurrency(data.pendapatan)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between gap-4">
                        <span className="text-sm text-rose-500">Pengeluaran:</span>
                        <span className="text-sm font-semibold text-rose-500">
                          {formatCurrency(data.pengeluaran)}
                        </span>
                      </div>
                      <div className="border-t border-border pt-1 mt-1">
                        <div className="flex items-center justify-between gap-4">
                          <span className="text-sm text-muted-foreground">Net Cashflow:</span>
                          <span className={`text-sm font-bold ${
                            data.netCashflow >= 0 ? 'text-cyan-500' : 'text-amber-500'
                          }`}>
                            {formatCurrency(data.netCashflow)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              }
              return null
            }}
          />
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Income Sources */}
        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle className="text-card-foreground flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-500" />
              Top Sumber Pendapatan
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              5 sumber pendapatan terbesar
            </CardDescription>
          </CardHeader>
          <CardContent>
            {incomeCategories.length > 0 ? (
              <BarChart
                className="h-64"
                data={incomeCategories}
                index="category"
                categories={["amount"]}
                colors={["emerald"]}
                valueFormatter={(value) => formatCurrency(value)}
                yAxisWidth={120}
                layout="vertical"
                showAnimation={true}
                customTooltip={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload as TopCategory
                    return (
                      <div className="bg-background border border-border rounded-lg shadow-lg p-3">
                        <p className="text-foreground font-medium mb-1">{label}</p>
                        <p className="text-emerald-500 font-bold">{formatCurrency(data.amount)}</p>
                        <p className="text-xs text-muted-foreground">{formatPercentage(data.percentage)} dari total</p>
                      </div>
                    )
                  }
                  return null
                }}
              />
            ) : (
              <div className="h-64 flex items-center justify-center text-muted-foreground">
                Tidak ada data pendapatan
              </div>
            )}
          </CardContent>
        </Card>

        {/* Top Expense Categories */}
        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle className="text-card-foreground flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-red-500 rotate-180" />
              Top Kategori Pengeluaran
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              5 kategori pengeluaran terbesar
            </CardDescription>
          </CardHeader>
          <CardContent>
            {expenseCategories.length > 0 ? (
              <BarChart
                className="h-64"
                data={expenseCategories}
                index="category"
                categories={["amount"]}
                colors={["rose"]}
                valueFormatter={(value) => formatCurrency(value)}
                yAxisWidth={120}
                layout="vertical"
                showAnimation={true}
                customTooltip={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload as TopCategory
                    return (
                      <div className="bg-background border border-border rounded-lg shadow-lg p-3">
                        <p className="text-foreground font-medium mb-1">{label}</p>
                        <p className="text-rose-500 font-bold">{formatCurrency(data.amount)}</p>
                        <p className="text-xs text-muted-foreground">{formatPercentage(data.percentage)} dari total</p>
                      </div>
                    )
                  }
                  return null
                }}
              />
            ) : (
              <div className="h-64 flex items-center justify-center text-muted-foreground">
                Tidak ada data pengeluaran
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
