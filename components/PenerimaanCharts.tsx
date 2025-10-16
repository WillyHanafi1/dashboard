'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { PenerimaanChartData, RusunwaData, GedungData } from '@/types/penerimaan'
import { formatCurrency, formatPercentage } from '@/lib/penerimaanQueries'
import { AreaChart, BarChart, DonutChart } from '@tremor/react'

interface PenerimaanChartsProps {
  chartData: PenerimaanChartData[]
  rusunwaData: RusunwaData[]
  gedungData: GedungData[]
  loading?: boolean
}

export default function PenerimaanCharts({ 
  chartData, 
  rusunwaData, 
  gedungData,
  loading = false 
}: PenerimaanChartsProps) {
  // Calculate totals for donut chart
  const totalTerbayar = chartData.reduce((sum, item) => sum + item.totalTerbayar, 0)
  const totalPending = chartData.reduce((sum, item) => sum + item.totalPending, 0)
  
  const statusData = [
    {
      name: 'Terbayar',
      value: totalTerbayar,
      share: totalTerbayar + totalPending > 0 ? (totalTerbayar / (totalTerbayar + totalPending)) * 100 : 0,
    },
    {
      name: 'Pending',
      value: totalPending,
      share: totalTerbayar + totalPending > 0 ? (totalPending / (totalTerbayar + totalPending)) * 100 : 0,
    },
  ]

  // Rename categories for the legend
  const renamedChartData = chartData.map(item => ({
    ...item,
    'Terbayar': item.totalTerbayar,
    'Pending': item.totalPending,
  }))

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
      {/* Grafik Tren Bulanan */}
      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle className="text-card-foreground">Tren Penerimaan Bulanan</CardTitle>
          <CardDescription className="text-muted-foreground">
            Perbandingan jumlah yang terbayar vs yang masih pending per bulan (Januari - Desember)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AreaChart
            className="h-72"
            data={renamedChartData}
            index="bulan"
            categories={["Terbayar", "Pending"]}
            colors={["emerald", "amber"]}
            valueFormatter={(value) => formatCurrency(value)}
            yAxisWidth={150}
            curveType="monotone"
            showAnimation={true}
            connectNulls={true}
            customTooltip={({ active, payload, label }) => {
              if (active && payload && payload.length) {
                return (
                  <div className="bg-background border border-border rounded-lg shadow-lg p-3">
                    <p className="text-foreground font-medium">{`${label}`}</p>
                    {payload.map((entry, index) => (
                      <p key={index} className="text-sm" style={{ color: entry.color }}>
                        {`${entry.name}: ${formatCurrency(entry.value as number)}`}
                      </p>
                    ))}
                  </div>
                )
              }
              return null
            }}
          />
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Grafik Per Rusunawa */}
        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle className="text-card-foreground">Penerimaan per Rusunawa</CardTitle>
            <CardDescription className="text-muted-foreground">
              Total penerimaan dari setiap Rusunawa
            </CardDescription>
          </CardHeader>
          <CardContent>
            <BarChart
              className="h-80"
              data={rusunwaData}
              index="rusunawa"
              categories={["totalPenerimaan"]}
              colors={["blue"]}
              valueFormatter={(value) => formatCurrency(value)}
              yAxisWidth={150}
              layout="vertical"
              showAnimation={true}
              customTooltip={({ active, payload, label }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload as RusunwaData
                  return (
                    <div className="bg-background border border-border rounded-lg shadow-lg p-3 min-w-[220px]">
                      <p className="text-foreground font-bold text-lg mb-2">{label}</p>
                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-muted-foreground text-sm">Total Penerimaan</span>
                          <span className="text-primary font-semibold">
                            {formatCurrency(data.totalPenerimaan)}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-muted-foreground text-sm">Jumlah Unit</span>
                          <span className="text-foreground font-medium">{data.jumlahUnit}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-muted-foreground text-sm">Tingkat Pelunasan</span>
                          <span className="text-green-500 font-medium">{formatPercentage(data.tingkatPelunasan)}</span>
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

        {/* Grafik Status Pembayaran */}
        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle className="text-card-foreground">Status Pembayaran</CardTitle>
            <CardDescription className="text-muted-foreground">
              Distribusi pembayaran yang sudah terbayar vs pending
            </CardDescription>
          </CardHeader>
          <CardContent>
            <DonutChart
              className="h-64"
              data={statusData}
              category="value"
              index="name"
              colors={["emerald", "amber"]}
              valueFormatter={(value) => formatCurrency(value)}
              showAnimation={true}
              customTooltip={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload
                  return (
                    <div className="bg-background border border-border rounded-lg shadow-lg p-3">
                      <p className="text-foreground font-medium mb-1">{data.name}</p>
                      <p className="text-primary font-bold">{formatCurrency(data.value)}</p>
                      <p className="text-muted-foreground text-sm">{formatPercentage(data.share)}</p>
                    </div>
                  )
                }
                return null
              }}
            />
            <div className="mt-6 flex justify-center gap-6">
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-emerald-500"></div>
                <div>
                  <p className="text-xs text-muted-foreground">Terbayar</p>
                  <p className="text-sm font-semibold text-emerald-500">{formatCurrency(totalTerbayar)}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-amber-500"></div>
                <div>
                  <p className="text-xs text-muted-foreground">Pending</p>
                  <p className="text-sm font-semibold text-amber-500">{formatCurrency(totalPending)}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Grafik Per Gedung */}
        <Card className="border-border bg-card lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-card-foreground">Top 10 Gedung dengan Penerimaan Tertinggi</CardTitle>
            <CardDescription className="text-muted-foreground">
              Gedung dengan total penerimaan terbesar
            </CardDescription>
          </CardHeader>
          <CardContent>
            <BarChart
              className="h-80"
              data={gedungData}
              index="gedung"
              categories={["totalPenerimaan"]}
              colors={["cyan"]}
              valueFormatter={(value) => formatCurrency(value)}
              yAxisWidth={150}
              showAnimation={true}
              customTooltip={({ active, payload, label }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload as GedungData
                  return (
                    <div className="bg-background border border-border rounded-lg shadow-lg p-3 min-w-[200px]">
                      <p className="text-foreground font-bold text-lg mb-1">Gedung {label}</p>
                      <p className="text-muted-foreground text-sm mb-2">{data.rusunawa}</p>
                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-muted-foreground text-sm">Total Penerimaan</span>
                          <span className="text-primary font-semibold">
                            {formatCurrency(data.totalPenerimaan)}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-muted-foreground text-sm">Jumlah Unit</span>
                          <span className="text-foreground font-medium">{data.jumlahUnit}</span>
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
      </div>
    </div>
  )
}
