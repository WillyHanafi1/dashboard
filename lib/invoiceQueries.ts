import { supabase } from '@/lib/supabase'
import { Invoice, InvoiceStats, ChartData, VendorData } from '@/types/invoice'
import { mockInvoices } from '@/lib/mockData'

export async function fetchInvoices(): Promise<Invoice[]> {
  try {
    // Check if Supabase is properly configured
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    
    if (!supabaseUrl || !supabaseKey || supabaseUrl.includes('placeholder')) {
      console.warn('Supabase not configured, using mock data')
      return mockInvoices
    }

    const { data, error } = await supabase
      .from('MainFaktur')
      .select('*')
      .order('TanggalFaktur', { ascending: false })

    if (error) {
      console.error('Error fetching invoices from Supabase:', error)
      console.log('Falling back to mock data')
      return mockInvoices
    }

    return data || mockInvoices
  } catch (error) {
    console.error('Failed to fetch invoices:', error)
    console.log('Using mock data as fallback')
    return mockInvoices
  }
}

export async function calculateInvoiceStats(invoices: Invoice[]): Promise<InvoiceStats> {
  const currentDate = new Date()
  
  const stats = invoices.reduce(
    (acc, invoice) => {
      const dueDate = new Date(invoice.TanggalJatuhTempo)
      const isPaid = invoice.StatusPembayaran === 'Lunas'
      const isOverdue = !isPaid && dueDate < currentDate

      acc.totalInvoices += 1
      acc.totalAmount += invoice.TotalTagihan

      if (isPaid) {
        acc.paidInvoices += 1
        acc.totalPaidAmount += invoice.TotalTagihan
      } else {
        acc.pendingInvoices += 1
        acc.totalPendingAmount += invoice.TotalTagihan
        if (isOverdue) {
          acc.overdueInvoices += 1
        }
      }

      return acc
    },
    {
      totalInvoices: 0,
      totalAmount: 0,
      paidInvoices: 0,
      pendingInvoices: 0,
      overdueInvoices: 0,
      totalPaidAmount: 0,
      totalPendingAmount: 0,
    }
  )

  return stats
}

export function generateChartData(invoices: Invoice[]): ChartData[] {
  const monthlyData = new Map<string, { totalAmount: number; paidAmount: number; pendingAmount: number }>()

  invoices.forEach((invoice) => {
    const date = new Date(invoice.TanggalFaktur)
    // Use a more readable format for month display
    const monthKey = date.toLocaleString('id-ID', { 
      month: 'short', 
      year: 'numeric' 
    })
    
    if (!monthlyData.has(monthKey)) {
      monthlyData.set(monthKey, { totalAmount: 0, paidAmount: 0, pendingAmount: 0 })
    }

    const data = monthlyData.get(monthKey)!
    data.totalAmount += invoice.TotalTagihan

    if (invoice.StatusPembayaran === 'Lunas') {
      data.paidAmount += invoice.TotalTagihan
    } else {
      data.pendingAmount += invoice.TotalTagihan
    }
  })

  // Sort by date and return last 6 months
  return Array.from(monthlyData.entries())
    .map(([month, data]) => ({
      month,
      ...data,
    }))
    .sort((a, b) => {
      // Parse month strings for proper sorting
      const dateA = new Date(a.month.split(' ').reverse().join('-') + '-01')
      const dateB = new Date(b.month.split(' ').reverse().join('-') + '-01')
      return dateA.getTime() - dateB.getTime()
    })
    .slice(-6) // Last 6 months
}

export function generateVendorData(invoices: Invoice[]): VendorData[] {
  const vendorMap = new Map<string, { totalAmount: number; invoiceCount: number }>()

  invoices.forEach((invoice) => {
    if (!vendorMap.has(invoice.NamaVendor)) {
      vendorMap.set(invoice.NamaVendor, { totalAmount: 0, invoiceCount: 0 })
    }

    const data = vendorMap.get(invoice.NamaVendor)!
    data.totalAmount += invoice.TotalTagihan
    data.invoiceCount += 1
  })

  return Array.from(vendorMap.entries())
    .map(([vendor, data]) => ({
      vendor,
      ...data,
    }))
    .sort((a, b) => b.totalAmount - a.totalAmount)
    .slice(0, 10) // Top 10 vendors
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(amount)
}