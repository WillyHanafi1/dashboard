'use client'

import { useEffect, useState } from 'react'
import { FinanceOverview, FinanceComparison, FinanceHealth, TopCategory } from '@/types/finance'
import { 
  fetchFinanceOverview, 
  generateFinanceComparison,
  calculateFinanceHealth,
  getTopCategories
} from '@/lib/financeQueries'
import FinanceOverviewCards from '@/components/FinanceOverviewCards'
import FinanceComparisonCharts from '@/components/FinanceComparisonCharts'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { RefreshCw, Download, TrendingUp, TrendingDown, ArrowRight } from 'lucide-react'
import Link from 'next/link'

export default function DashboardPage() {
  const [overview, setOverview] = useState<FinanceOverview>({
    totalPendapatan: 0,
    pendapatanTerbayar: 0,
    pendapatanPending: 0,
    totalPengeluaran: 0,
    pengeluaranLunas: 0,
    pengeluaranPending: 0,
    netCashflow: 0,
    netProfit: 0,
    cashflowRatio: 0,
    pendapatanGrowth: 0,
    pengeluaranGrowth: 0,
  })
  const [comparisonData, setComparisonData] = useState<FinanceComparison[]>([])
  const [healthData, setHealthData] = useState<FinanceHealth>({
    healthScore: 0,
    status: 'Poor',
    indicators: []
  })
  const [topCategories, setTopCategories] = useState<TopCategory[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadFinanceData = async () => {
    try {
      setLoading(true)
      setError(null)

      // Fetch all finance data
      const [overviewData, comparison, health, categories] = await Promise.all([
        fetchFinanceOverview(),
        generateFinanceComparison(),
        calculateFinanceHealth(),
        getTopCategories()
      ])

      setOverview(overviewData)
      setComparisonData(comparison)
      setHealthData(health)
      setTopCategories(categories)

    } catch (err) {
      console.error('Error loading finance data:', err)
      setError('Gagal memuat data finance. Pastikan koneksi Supabase sudah dikonfigurasi dengan benar.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadFinanceData()
  }, [])

  const handleRefresh = () => {
    loadFinanceData()
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Dashboard Finance</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Overview lengkap pendapatan dan pengeluaran bisnis Anda
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

      {/* Overview KPI Cards */}
      <FinanceOverviewCards overview={overview} loading={loading} />

      {/* Comparison Charts */}
      <FinanceComparisonCharts 
        comparisonData={comparisonData}
        healthData={healthData}
        topCategories={topCategories}
        loading={loading}
      />

      {/* Quick Navigation */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Link href="/dashboard/vendor">
          <Card className="border-2 hover:border-green-500 transition-all cursor-pointer group h-full">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="h-12 w-12 rounded-lg bg-green-500/10 flex items-center justify-center group-hover:bg-green-500/20 transition-colors">
                  <TrendingUp className="h-6 w-6 text-green-500" />
                </div>
                <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-green-500 transition-colors" />
              </div>
              <CardTitle className="mt-4">Detail Pendapatan</CardTitle>
              <CardDescription>
                Lihat detail lengkap pendapatan dari Rusunawa
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Klik untuk mengakses dashboard pendapatan lengkap dengan breakdown per Rusunawa dan Gedung
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/dashboard/faktur">
          <Card className="border-2 hover:border-red-500 transition-all cursor-pointer group h-full">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="h-12 w-12 rounded-lg bg-red-500/10 flex items-center justify-center group-hover:bg-red-500/20 transition-colors">
                  <TrendingDown className="h-6 w-6 text-red-500" />
                </div>
                <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-red-500 transition-colors" />
              </div>
              <CardTitle className="mt-4">Detail Pengeluaran</CardTitle>
              <CardDescription>
                Lihat detail lengkap pengeluaran dan faktur vendor
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Klik untuk mengakses dashboard pengeluaran lengkap dengan breakdown per vendor dan status pembayaran
              </p>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Key Insights */}
      <Card>
        <CardHeader>
          <CardTitle>Key Insights</CardTitle>
          <CardDescription>
            Ringkasan penting untuk pengambilan keputusan
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="p-4 bg-muted/50 rounded-lg">
              <p className="text-sm text-muted-foreground mb-1">Status Cashflow</p>
              <p className={`text-lg font-bold ${
                overview.netCashflow >= 0 ? 'text-green-500' : 'text-red-500'
              }`}>
                {overview.netCashflow >= 0 ? '✓ Surplus' : '✗ Defisit'}
              </p>
            </div>
            <div className="p-4 bg-muted/50 rounded-lg">
              <p className="text-sm text-muted-foreground mb-1">Rasio Kesehatan</p>
              <p className={`text-lg font-bold ${
                overview.cashflowRatio >= 100 ? 'text-green-500' : 'text-yellow-500'
              }`}>
                {overview.cashflowRatio.toFixed(1)}%
              </p>
            </div>
            <div className="p-4 bg-muted/50 rounded-lg">
              <p className="text-sm text-muted-foreground mb-1">Finance Health</p>
              <p className={`text-lg font-bold ${
                healthData.status === 'Excellent' ? 'text-green-500' :
                healthData.status === 'Good' ? 'text-blue-500' :
                healthData.status === 'Fair' ? 'text-yellow-500' : 'text-red-500'
              }`}>
                {healthData.status}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}