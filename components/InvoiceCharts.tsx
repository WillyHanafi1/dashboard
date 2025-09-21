'use client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ChartData, VendorData } from '@/types/invoice'
import { formatCurrency } from '@/lib/invoiceQueries'
import { AreaChart, BarChart, DonutChart } from '@tremor/react'
import { useTheme } from 'next-themes'

interface InvoiceChartsProps {
  chartData: ChartData[]
  vendorData: VendorData[]
  loading?: boolean
}

export default function InvoiceCharts({ chartData, vendorData, loading = false }: InvoiceChartsProps) {
  const { theme } = useTheme()
  
  // Menyiapkan data untuk grafik donat status pembayaran
  const totalPaid = chartData.reduce((sum, item) => sum + item.paidAmount, 0)
  const totalPending = chartData.reduce((sum, item) => sum + item.pendingAmount, 0)
  
  const statusData = [
    {
      name: 'Lunas',
      value: totalPaid,
      share: totalPaid + totalPending > 0 ? (totalPaid / (totalPaid + totalPending)) * 100 : 0,
    },
    {
      name: 'Pending',
      value: totalPending,
      share: totalPaid + totalPending > 0 ? (totalPending / (totalPaid + totalPending)) * 100 : 0,
    },
  ]

  // Warna dinamis berdasarkan tema (terang/gelap)
  const getChartColors = () => {
    // Memeriksa apakah tema saat ini adalah 'dark'
    const isDark = theme === 'dark'
    return {
      area: isDark ? ['#10b981', '#f59e0b'] : ['#059669', '#d97706'], // emerald, amber
      bar: isDark ? ['#06b6d4'] : ['#0891b2'],   // cyan
      donut: isDark ? ['#22c55e', '#eab308'] : ['#16a34a', '#ca8a04'] // green, yellow
    }
  }

  const chartColors = getChartColors()

  if (loading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {Array.from({ length: 3 }).map((_, index) => (
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
          <CardTitle className="text-card-foreground">Tren Faktur Bulanan</CardTitle>
          <CardDescription className="text-muted-foreground">
            Perbandingan nilai faktur yang sudah dibayar vs yang masih pending
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AreaChart
            className="h-72"
            data={chartData}
            index="month"
            categories={["paidAmount", "pendingAmount"]}
            colors={chartColors.area} // Menggunakan warna dinamis
            valueFormatter={(value) => formatCurrency(value)}
            yAxisWidth={120}
            customTooltip={({ active, payload, label }) => {
              if (active && payload && payload.length) {
                return (
                  <div className="bg-background border border-border rounded-lg shadow-lg p-3">
                    <p className="text-foreground font-medium">{`${label}`}</p>
                    {payload.map((entry, index) => (
                      <p key={index} className="text-sm" style={{ color: entry.color }}>
                        {`${entry.name === 'paidAmount' ? 'Lunas' : 'Pending'}: ${formatCurrency(entry.value as number)}`}
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
        {/* Grafik Top Vendor */}
        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle className="text-card-foreground">Top 10 Vendor</CardTitle>
            <CardDescription className="text-muted-foreground">
              Vendor dengan total nilai faktur tertinggi
            </CardDescription>
          </CardHeader>
          <CardContent>
            <BarChart
              className="h-80"
              data={vendorData}
              index="vendor"
              categories={["totalAmount"]}
              colors={chartColors.bar} // PERBAIKAN: Menggunakan warna dinamis dari chartColors.bar
              valueFormatter={(value) => formatCurrency(value)}
              yAxisWidth={120}
              layout="vertical"
              customTooltip={({ active, payload, label }) => {
                if (active && payload && payload.length) {
                  return (
                    <div className="bg-background border border-border rounded-lg shadow-lg p-3">
                      <p className="text-foreground font-medium">{`${label}`}</p>
                      <p className="text-sm text-primary">
                        {`Total: ${formatCurrency(payload[0].value as number)}`}
                      </p>
                    </div>
                  )
                }
                return null
              }}
            />
          </CardContent>
        </Card>

        {/* Grafik Donat Status Pembayaran */}
        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle className="text-card-foreground">Status Pembayaran</CardTitle>
            <CardDescription className="text-muted-foreground">
              Distribusi status pembayaran faktur
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center">
            <DonutChart
              className="h-60"
              data={statusData}
              category="value"
              index="name"
              valueFormatter={(value) => formatCurrency(value)}
              colors={chartColors.donut} // PERBAIKAN: Menggunakan warna dinamis dari chartColors.donut
              customTooltip={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload
                  return (
                    <div className="bg-background border border-border rounded-lg shadow-lg p-3">
                      <p className="text-foreground font-medium">{data.name}</p>
                      <p className="text-sm text-primary">
                        {`Nilai: ${formatCurrency(data.value)}`}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {`Persentase: ${data.share.toFixed(1)}%`}
                      </p>
                    </div>
                  )
                }
                return null
              }}
            />
            <div className="mt-4 grid grid-cols-2 gap-4 text-center w-full">
              <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/20">
                <div className="text-2xl font-bold text-green-400">
                  {statusData[0].share.toFixed(1)}%
                </div>
                <div className="text-sm text-green-300">Lunas</div>
                <div className="text-xs text-muted-foreground mt-1">
                  {formatCurrency(statusData[0].value)}
                </div>
              </div>
              <div className="p-3 rounded-lg bg-orange-500/10 border border-orange-500/20">
                <div className="text-2xl font-bold text-orange-400">
                  {statusData[1].share.toFixed(1)}%
                </div>
                <div className="text-sm text-orange-300">Pending</div>
                <div className="text-xs text-muted-foreground mt-1">
                  {formatCurrency(statusData[1].value)}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

