import { Invoice } from '@/types/invoice'
import { Penerimaan } from '@/types/penerimaan'
import { 
  FinanceOverview, 
  FinanceComparison, 
  CashflowSummary, 
  FinanceHealth,
  TopCategory 
} from '@/types/finance'
import { fetchInvoices, calculateInvoiceStats } from '@/lib/invoiceQueries'
import { fetchPenerimaan, calculatePenerimaanStats } from '@/lib/penerimaanQueries'

export async function fetchFinanceOverview(): Promise<FinanceOverview> {
  try {
    // Fetch both data sources
    const [invoices, penerimaan] = await Promise.all([
      fetchInvoices(),
      fetchPenerimaan()
    ])

    // Calculate individual stats
    const invoiceStats = await calculateInvoiceStats(invoices)
    const penerimaanStats = await calculatePenerimaanStats(penerimaan)

    // Calculate overview
    const overview: FinanceOverview = {
      // Pendapatan (Income)
      totalPendapatan: penerimaanStats.totalTagihan,
      pendapatanTerbayar: penerimaanStats.totalTerbayar,
      pendapatanPending: penerimaanStats.totalPending,
      
      // Pengeluaran (Expenses)
      totalPengeluaran: invoiceStats.totalAmount,
      pengeluaranLunas: invoiceStats.totalPaidAmount,
      pengeluaranPending: invoiceStats.totalPendingAmount,
      
      // Net & Analysis
      netCashflow: penerimaanStats.totalTerbayar - invoiceStats.totalPaidAmount,
      netProfit: penerimaanStats.totalTagihan - invoiceStats.totalAmount,
      cashflowRatio: invoiceStats.totalPaidAmount > 0 
        ? (penerimaanStats.totalTerbayar / invoiceStats.totalPaidAmount) * 100 
        : 0,
      
      // Trends (simplified - would need historical data for real calculation)
      pendapatanGrowth: 0,
      pengeluaranGrowth: 0,
    }

    return overview
  } catch (error) {
    console.error('Error fetching finance overview:', error)
    throw error
  }
}

export async function generateFinanceComparison(): Promise<FinanceComparison[]> {
  try {
    const [invoices, penerimaan] = await Promise.all([
      fetchInvoices(),
      fetchPenerimaan()
    ])

    // Initialize all 12 months with zero values
    const allMonths = [
      'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
      'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
    ]

    const monthlyData = new Map<string, { pendapatan: number; pengeluaran: number }>()
    
    // Initialize all months with zero
    allMonths.forEach(bulan => {
      monthlyData.set(bulan, { pendapatan: 0, pengeluaran: 0 })
    })

    // Process Penerimaan (Income)
    penerimaan.forEach((item) => {
      const bulan = item.Bulan
      if (monthlyData.has(bulan)) {
        monthlyData.get(bulan)!.pendapatan += item.Jumlah_Pembayaran
      }
    })

    // Process Invoices (Expenses)
    invoices.forEach((invoice) => {
      const date = new Date(invoice.TanggalFaktur)
      const bulan = date.toLocaleString('id-ID', { month: 'long' })
      
      if (monthlyData.has(bulan)) {
        if (invoice.StatusPembayaran === 'Lunas') {
          monthlyData.get(bulan)!.pengeluaran += invoice.TotalTagihan
        }
      }
    })

    // Convert to array and calculate netCashflow
    const monthOrder: { [key: string]: number } = {
      'Januari': 1, 'Februari': 2, 'Maret': 3, 'April': 4, 
      'Mei': 5, 'Juni': 6, 'Juli': 7, 'Agustus': 8, 
      'September': 9, 'Oktober': 10, 'November': 11, 'Desember': 12
    }

    // Return all 12 months sorted by order
    return Array.from(monthlyData.entries())
      .map(([bulan, data]) => ({
        bulan,
        pendapatan: data.pendapatan,
        pengeluaran: data.pengeluaran,
        netCashflow: data.pendapatan - data.pengeluaran,
      }))
      .sort((a, b) => (monthOrder[a.bulan] || 0) - (monthOrder[b.bulan] || 0))
  } catch (error) {
    console.error('Error generating finance comparison:', error)
    return []
  }
}

export async function calculateFinanceHealth(): Promise<FinanceHealth> {
  try {
    const overview = await fetchFinanceOverview()
    
    // Calculate health indicators
    const indicators = []
    let totalScore = 0
    
    // 1. Cashflow Ratio (Income vs Expense)
    const cashflowScore = overview.cashflowRatio >= 120 ? 25 : 
                          overview.cashflowRatio >= 100 ? 20 :
                          overview.cashflowRatio >= 80 ? 15 : 10
    totalScore += cashflowScore
    indicators.push({
      name: 'Rasio Cashflow',
      value: overview.cashflowRatio,
      status: overview.cashflowRatio >= 100 ? 'positive' : overview.cashflowRatio >= 80 ? 'neutral' : 'negative',
      description: `${overview.cashflowRatio.toFixed(1)}% - ${overview.cashflowRatio >= 100 ? 'Sehat' : 'Perlu Perhatian'}`
    })
    
    // 2. Net Cashflow
    const netCashflowScore = overview.netCashflow > 0 ? 25 : 
                             overview.netCashflow === 0 ? 15 : 10
    totalScore += netCashflowScore
    indicators.push({
      name: 'Net Cashflow',
      value: overview.netCashflow,
      status: overview.netCashflow > 0 ? 'positive' : overview.netCashflow === 0 ? 'neutral' : 'negative',
      description: `${formatCurrency(overview.netCashflow)} - ${overview.netCashflow > 0 ? 'Surplus' : 'Defisit'}`
    })
    
    // 3. Income Collection Rate
    const incomeCollectionRate = overview.totalPendapatan > 0 
      ? (overview.pendapatanTerbayar / overview.totalPendapatan) * 100 
      : 0
    const collectionScore = incomeCollectionRate >= 90 ? 25 : 
                           incomeCollectionRate >= 70 ? 20 : 
                           incomeCollectionRate >= 50 ? 15 : 10
    totalScore += collectionScore
    indicators.push({
      name: 'Tingkat Penagihan',
      value: incomeCollectionRate,
      status: incomeCollectionRate >= 70 ? 'positive' : incomeCollectionRate >= 50 ? 'neutral' : 'negative',
      description: `${incomeCollectionRate.toFixed(1)}% Tertagih`
    })
    
    // 4. Expense Control
    const expenseControlRate = overview.totalPengeluaran > 0
      ? (overview.pengeluaranLunas / overview.totalPengeluaran) * 100
      : 0
    const expenseScore = expenseControlRate <= 70 ? 25 :
                        expenseControlRate <= 85 ? 20 :
                        expenseControlRate <= 95 ? 15 : 10
    totalScore += expenseScore
    indicators.push({
      name: 'Kontrol Pengeluaran',
      value: expenseControlRate,
      status: expenseControlRate <= 85 ? 'positive' : expenseControlRate <= 95 ? 'neutral' : 'negative',
      description: `${expenseControlRate.toFixed(1)}% Terbayar`
    })
    
    // Determine health status
    const healthScore = totalScore
    const status: FinanceHealth['status'] = 
      healthScore >= 85 ? 'Excellent' :
      healthScore >= 70 ? 'Good' :
      healthScore >= 50 ? 'Fair' : 'Poor'
    
    return {
      healthScore,
      status,
      indicators: indicators as FinanceHealth['indicators']
    }
  } catch (error) {
    console.error('Error calculating finance health:', error)
    return {
      healthScore: 0,
      status: 'Poor',
      indicators: []
    }
  }
}

export async function getTopCategories(): Promise<TopCategory[]> {
  try {
    const [invoices, penerimaan] = await Promise.all([
      fetchInvoices(),
      fetchPenerimaan()
    ])

    const categories: TopCategory[] = []
    
    // Top Expense Categories (by Vendor)
    const vendorMap = new Map<string, number>()
    invoices.forEach(invoice => {
      const current = vendorMap.get(invoice.NamaVendor) || 0
      vendorMap.set(invoice.NamaVendor, current + invoice.TotalTagihan)
    })
    
    const totalExpense = Array.from(vendorMap.values()).reduce((sum, val) => sum + val, 0)
    Array.from(vendorMap.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .forEach(([vendor, amount]) => {
        categories.push({
          category: vendor,
          amount,
          percentage: totalExpense > 0 ? (amount / totalExpense) * 100 : 0,
          type: 'expense'
        })
      })
    
    // Top Income Categories (by Rusunawa)
    const rusunwaMap = new Map<string, number>()
    penerimaan.forEach(item => {
      const current = rusunwaMap.get(item.Rusunawa) || 0
      rusunwaMap.set(item.Rusunawa, current + item.Jumlah_Pembayaran)
    })
    
    const totalIncome = Array.from(rusunwaMap.values()).reduce((sum, val) => sum + val, 0)
    Array.from(rusunwaMap.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .forEach(([rusunawa, amount]) => {
        categories.push({
          category: rusunawa,
          amount,
          percentage: totalIncome > 0 ? (amount / totalIncome) * 100 : 0,
          type: 'income'
        })
      })
    
    return categories
  } catch (error) {
    console.error('Error getting top categories:', error)
    return []
  }
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(amount)
}

export function formatPercentage(value: number): string {
  return `${value.toFixed(1)}%`
}
