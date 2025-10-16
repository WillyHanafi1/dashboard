'use client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ChartData, VendorData } from '@/types/invoice'
import { formatCurrency } from '@/lib/invoiceQueries'
import { AreaChart, BarChart, DonutChart } from '@tremor/react'

interface InvoiceChartsProps {
  chartData: ChartData[]
  vendorData: VendorData[]
  loading?: boolean
}

export default function InvoiceCharts({ chartData, vendorData, loading = false }: InvoiceChartsProps) {
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

  // Sort chart data chronologically
  const sortedChartData = [...chartData].sort((a, b) => {
    const [aMonth, aYear] = a.month.split(' ');
    const [bMonth, bYear] = b.month.split(' ');
    const monthMap: { [key: string]: number } = { 'Jan': 1, 'Feb': 2, 'Mar': 3, 'Apr': 4, 'Mei': 5, 'Jun': 6, 'Jul': 7, 'Agu': 8, 'Sep': 9, 'Okt': 10, 'Nov': 11, 'Des': 12 };
    
    const aDate = new Date(parseInt(aYear), monthMap[aMonth] - 1);
    const bDate = new Date(parseInt(bYear), monthMap[bMonth] - 1);
    
    return aDate.getTime() - bDate.getTime();
  });

  // Sort and take top 10 vendors
  const sortedVendorData = [...vendorData]
    .sort((a, b) => b.totalAmount - a.totalAmount)
    .slice(0, 10)
    .map((item, index) => ({ ...item, rank: `#${index + 1}` }));

  // Rename categories for the legend
  const renamedChartData = sortedChartData.map(item => ({
    ...item,
    'Lunas': item.paidAmount,
    'Pending': item.pendingAmount,
  }));

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
            data={renamedChartData}
            index="month"
            categories={["Lunas", "Pending"]}
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
              data={sortedVendorData}
              index="vendor"
              categories={["totalAmount"]}
              colors={["blue"]}
              valueFormatter={(value) => formatCurrency(value)}
              yAxisWidth={150}
              layout="vertical"
              showAnimation={true}
              customTooltip={({ active, payload, label }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload;
                  return (
                    <div className="bg-background border border-border rounded-lg shadow-lg p-3 min-w-[200px]">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-foreground font-bold text-lg">{label}</p>
                        <p className="text-sm font-mono text-blue-500 bg-blue-500/10 px-2 py-1 rounded">{data.rank}</p>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground text-sm">Total Faktur</span>
                        <span className="text-primary font-semibold">
                          {formatCurrency(payload[0].value as number)}
                        </span>
                      </div>
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
              colors={["emerald", "yellow"]}
              showAnimation={true}
              label=""
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
            {/* Total pembayaran di bawah chart */}
            <div className="mt-2 text-center">
              <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                {formatCurrency(totalPaid + totalPending)}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Total Pembayaran
              </p>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-4 text-center w-full">
              <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/20">
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {statusData[0].share.toFixed(1)}%
                </div>
                <div className="text-sm text-green-600 dark:text-green-300">Lunas</div>
                <div className="text-xs text-foreground mt-1">
                  {formatCurrency(statusData[0].value)}
                </div>
              </div>
              <div className="p-3 rounded-lg bg-orange-500/10 border border-orange-500/20">
                <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                  {statusData[1].share.toFixed(1)}%
                </div>
                <div className="text-sm text-orange-600 dark:text-orange-300">Pending</div>
                <div className="text-xs text-foreground mt-1">
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

