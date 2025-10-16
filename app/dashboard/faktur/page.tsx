'use client'

import { useEffect, useState } from 'react'
import { Invoice, InvoiceStats, ChartData, VendorData } from '@/types/invoice'
import { 
  fetchInvoices, 
  calculateInvoiceStats, 
  generateChartData, 
  generateVendorData 
} from '@/lib/invoiceQueries'
import KPICards from '@/components/KPICards'
import InvoiceCharts from '@/components/InvoiceCharts'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { RefreshCw, Plus, Users } from 'lucide-react'

export default function FakturPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [stats, setStats] = useState<InvoiceStats>({
    totalInvoices: 0,
    totalAmount: 0,
    paidInvoices: 0,
    pendingInvoices: 0,
    overdueInvoices: 0,
    totalPaidAmount: 0,
    totalPendingAmount: 0,
  })
  const [chartData, setChartData] = useState<ChartData[]>([])
  const [vendorData, setVendorData] = useState<VendorData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadDashboardData = async () => {
    try {
      setLoading(true)
      setError(null)

      // Fetch invoices from Supabase
      const invoiceData = await fetchInvoices()
      setInvoices(invoiceData)

      // Calculate statistics
      const calculatedStats = await calculateInvoiceStats(invoiceData)
      setStats(calculatedStats)

      // Generate chart data
      const monthlyChartData = generateChartData(invoiceData)
      setChartData(monthlyChartData)

      // Generate vendor data
      const topVendorData = generateVendorData(invoiceData)
      setVendorData(topVendorData)

    } catch (err) {
      console.error('Error loading dashboard data:', err)
      setError('Gagal memuat data dashboard. Pastikan koneksi Supabase sudah dikonfigurasi dengan benar.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadDashboardData()
  }, [])

  const handleRefresh = () => {
    loadDashboardData()
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Manajemen Faktur</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Kelola dan pantau faktur serta vendor Anda dengan mudah
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={handleRefresh}
            disabled={loading}
            className="flex items-center gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* KPI Cards */}
      <KPICards stats={stats} loading={loading} />

      {/* Charts */}
      <InvoiceCharts 
        chartData={chartData} 
        vendorData={vendorData} 
        loading={loading} 
      />

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Aksi Cepat
          </CardTitle>
          <CardDescription>
            Kelola faktur dan vendor dengan mudah
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Tambah Faktur Baru
            </Button>
            <Button variant="outline" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Kelola Vendor
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Recent Invoices Table */}
      {!loading && invoices.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Faktur Terbaru</CardTitle>
            <CardDescription>
              {invoices.length} faktur ditemukan dalam database
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-2">Nomor Faktur</th>
                    <th className="text-left py-2">Vendor</th>
                    <th className="text-left py-2">Tanggal</th>
                    <th className="text-left py-2">Jatuh Tempo</th>
                    <th className="text-right py-2">Total</th>
                    <th className="text-center py-2">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {invoices.slice(0, 10).map((invoice) => (
                    <tr key={invoice.NomorFaktur} className="border-b border-border/50">
                      <td className="py-2 font-medium">{invoice.NomorFaktur}</td>
                      <td className="py-2">{invoice.NamaVendor}</td>
                      <td className="py-2">{new Date(invoice.TanggalFaktur).toLocaleDateString('id-ID')}</td>
                      <td className="py-2">{new Date(invoice.TanggalJatuhTempo).toLocaleDateString('id-ID')}</td>
                      <td className="py-2 text-right font-medium">
                        {new Intl.NumberFormat('id-ID', {
                          style: 'currency',
                          currency: 'IDR',
                          minimumFractionDigits: 0,
                        }).format(invoice.TotalTagihan)}
                      </td>
                      <td className="py-2 text-center">
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                          invoice.StatusPembayaran === 'Lunas'
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200'
                            : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                        }`}>
                          {invoice.StatusPembayaran}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
