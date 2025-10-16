'use client'

import { useEffect, useState } from 'react'
import { Penerimaan, PenerimaanStats, PenerimaanChartData, RusunwaData, GedungData } from '@/types/penerimaan'
import { 
  fetchPenerimaan, 
  calculatePenerimaanStats, 
  generatePenerimaanChartData, 
  generateRusunwaData,
  generateGedungData,
  formatCurrency
} from '@/lib/penerimaanQueries'
import PenerimaanKPICards from '@/components/PenerimaanKPICards'
import PenerimaanCharts from '@/components/PenerimaanCharts'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { RefreshCw, Download, Filter } from 'lucide-react'

export default function PendapatanPage() {
  const [penerimaan, setPenerimaan] = useState<Penerimaan[]>([])
  const [stats, setStats] = useState<PenerimaanStats>({
    totalPenerimaan: 0,
    totalTagihan: 0,
    totalTerbayar: 0,
    totalPending: 0,
    jumlahLunas: 0,
    jumlahBelumLunas: 0,
    totalSewa: 0,
    totalParkir: 0,
    totalDenda: 0,
    tingkatPelunasan: 0,
  })
  const [chartData, setChartData] = useState<PenerimaanChartData[]>([])
  const [rusunwaData, setRusunwaData] = useState<RusunwaData[]>([])
  const [gedungData, setGedungData] = useState<GedungData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadPenerimaanData = async () => {
    try {
      setLoading(true)
      setError(null)

      // Fetch penerimaan data from Supabase
      const penerimaanData = await fetchPenerimaan()
      setPenerimaan(penerimaanData)

      // Calculate statistics
      const calculatedStats = await calculatePenerimaanStats(penerimaanData)
      setStats(calculatedStats)

      // Generate chart data
      const monthlyChartData = generatePenerimaanChartData(penerimaanData)
      setChartData(monthlyChartData)

      // Generate rusunawa data
      const rusunwaAnalytics = generateRusunwaData(penerimaanData)
      setRusunwaData(rusunwaAnalytics)

      // Generate gedung data
      const gedungAnalytics = generateGedungData(penerimaanData)
      setGedungData(gedungAnalytics)

    } catch (err) {
      console.error('Error loading penerimaan data:', err)
      setError('Gagal memuat data penerimaan. Pastikan koneksi Supabase sudah dikonfigurasi dengan benar.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadPenerimaanData()
  }, [])

  const handleRefresh = () => {
    loadPenerimaanData()
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Dashboard Pendapatan</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Monitoring dan analisis penerimaan dari seluruh Rusunawa
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
          <Button variant="outline" className="flex items-center gap-2">
            <Filter className="h-4 w-4" />
            Filter
          </Button>
          <Button className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            Export
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
      <PenerimaanKPICards stats={stats} loading={loading} />

      {/* Charts */}
      <PenerimaanCharts 
        chartData={chartData} 
        rusunwaData={rusunwaData}
        gedungData={gedungData}
        loading={loading} 
      />

      {/* Breakdown Components */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Breakdown by Component */}
        <Card>
          <CardHeader>
            <CardTitle>Breakdown Komponen Tagihan</CardTitle>
            <CardDescription>
              Rincian dari komponen tagihan
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-blue-500/10 rounded-lg border border-blue-500/20">
                <span className="text-sm font-medium">Total Sewa</span>
                <span className="text-lg font-bold text-blue-500">{formatCurrency(stats.totalSewa)}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-cyan-500/10 rounded-lg border border-cyan-500/20">
                <span className="text-sm font-medium">Total Parkir</span>
                <span className="text-lg font-bold text-cyan-500">{formatCurrency(stats.totalParkir)}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-red-500/10 rounded-lg border border-red-500/20">
                <span className="text-sm font-medium">Total Denda</span>
                <span className="text-lg font-bold text-red-500">{formatCurrency(stats.totalDenda)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Summary Statistics */}
        <Card>
          <CardHeader>
            <CardTitle>Ringkasan Statistik</CardTitle>
            <CardDescription>
              Informasi umum penerimaan
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center py-2 border-b border-border">
                <span className="text-sm text-muted-foreground">Total Unit</span>
                <span className="text-sm font-semibold">{stats.totalPenerimaan} Unit</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-border">
                <span className="text-sm text-muted-foreground">Unit Lunas</span>
                <span className="text-sm font-semibold text-green-500">{stats.jumlahLunas} Unit</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-border">
                <span className="text-sm text-muted-foreground">Unit Belum Lunas</span>
                <span className="text-sm font-semibold text-amber-500">{stats.jumlahBelumLunas} Unit</span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-sm text-muted-foreground">Rata-rata per Unit</span>
                <span className="text-sm font-semibold">
                  {stats.totalPenerimaan > 0 
                    ? formatCurrency(stats.totalTagihan / stats.totalPenerimaan)
                    : formatCurrency(0)
                  }
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Transactions Table */}
      {!loading && penerimaan.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Transaksi Terbaru</CardTitle>
            <CardDescription>
              {penerimaan.length} transaksi ditemukan dalam database
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-2">Rusunawa</th>
                    <th className="text-left py-2">Gedung</th>
                    <th className="text-left py-2">Unit</th>
                    <th className="text-left py-2">Nama</th>
                    <th className="text-left py-2">Bulan</th>
                    <th className="text-right py-2">Tagihan</th>
                    <th className="text-right py-2">Terbayar</th>
                    <th className="text-center py-2">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {penerimaan.slice(0, 10).map((item) => (
                    <tr key={item.id} className="border-b border-border/50 hover:bg-muted/50">
                      <td className="py-2">{item.Rusunawa}</td>
                      <td className="py-2">{item.Gedung}</td>
                      <td className="py-2">{item.Lantai}-{item.Nomor}</td>
                      <td className="py-2 font-medium">{item.Nama}</td>
                      <td className="py-2">{item.Bulan}</td>
                      <td className="py-2 text-right font-medium">
                        {formatCurrency(item.Total_Tagihan)}
                      </td>
                      <td className="py-2 text-right font-medium">
                        {formatCurrency(item.Jumlah_Pembayaran)}
                      </td>
                      <td className="py-2 text-center">
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                          item.Status_Pembayaran === 'Lunas'
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200'
                            : item.Status_Pembayaran === 'Sebagian'
                            ? 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200'
                            : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                        }`}>
                          {item.Status_Pembayaran}
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
