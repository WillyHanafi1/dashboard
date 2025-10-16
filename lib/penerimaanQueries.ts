import { supabase } from '@/lib/supabase'
import { Penerimaan, PenerimaanStats, PenerimaanChartData, RusunwaData, GedungData } from '@/types/penerimaan'
import { mockPenerimaan } from '@/lib/mockPenerimaan'

export async function fetchPenerimaan(): Promise<Penerimaan[]> {
  try {
    // Check if Supabase is properly configured
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    
    if (!supabaseUrl || !supabaseKey || supabaseUrl.includes('placeholder')) {
      console.warn('Supabase not configured, using mock data')
      return mockPenerimaan
    }

    // Fetch all data using pagination to bypass 1000 record limit
    let allData: Penerimaan[] = []
    let from = 0
    const batchSize = 1000
    let hasMore = true

    while (hasMore) {
      const { data, error, count } = await supabase
        .from('Penerimaan')
        .select('*', { count: 'exact' })
        .order('Tanggal_Tagihan', { ascending: false })
        .range(from, from + batchSize - 1)

      if (error) {
        console.error('Error fetching penerimaan from Supabase:', error)
        console.log('Falling back to mock data')
        return mockPenerimaan
      }

      if (data && data.length > 0) {
        allData = [...allData, ...data]
        from += batchSize
        
        // Check if we've fetched all records
        if (count && allData.length >= count) {
          hasMore = false
          console.log(`Successfully fetched all ${count} records from Penerimaan table`)
        } else if (data.length < batchSize) {
          hasMore = false
          console.log(`Successfully fetched ${allData.length} records from Penerimaan table`)
        }
      } else {
        hasMore = false
      }
    }

    return allData.length > 0 ? allData : mockPenerimaan
  } catch (error) {
    console.error('Failed to fetch penerimaan:', error)
    console.log('Using mock data as fallback')
    return mockPenerimaan
  }
}

export async function calculatePenerimaanStats(data: Penerimaan[]): Promise<PenerimaanStats> {
  const stats = data.reduce(
    (acc, item) => {
      acc.totalPenerimaan += 1
      acc.totalTagihan += item.Total_Tagihan
      acc.totalTerbayar += item.Jumlah_Pembayaran
      acc.totalSewa += item.Sewa
      acc.totalParkir += item.Parkir || 0
      acc.totalDenda += item.Denda || 0

      if (item.Status_Pembayaran === 'Lunas') {
        acc.jumlahLunas += 1
      } else {
        acc.jumlahBelumLunas += 1
      }

      return acc
    },
    {
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
    }
  )

  stats.totalPending = stats.totalTagihan - stats.totalTerbayar
  stats.tingkatPelunasan = stats.totalTagihan > 0 
    ? (stats.totalTerbayar / stats.totalTagihan) * 100 
    : 0

  return stats
}

export function generatePenerimaanChartData(data: Penerimaan[]): PenerimaanChartData[] {
  // Mapping nama bulan Indonesia
  const monthOrder: { [key: string]: number } = {
    'Januari': 1, 'Februari': 2, 'Maret': 3, 'April': 4, 
    'Mei': 5, 'Juni': 6, 'Juli': 7, 'Agustus': 8, 
    'September': 9, 'Oktober': 10, 'November': 11, 'Desember': 12
  }

  // Initialize all 12 months with zero values
  const allMonths = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ]

  const monthlyData = new Map<string, { totalTagihan: number; totalTerbayar: number; totalPending: number }>()
  
  // Initialize all months with zero
  allMonths.forEach(bulan => {
    monthlyData.set(bulan, { totalTagihan: 0, totalTerbayar: 0, totalPending: 0 })
  })

  // Populate with actual data
  data.forEach((item) => {
    const bulan = item.Bulan
    
    if (monthlyData.has(bulan)) {
      const monthData = monthlyData.get(bulan)!
      monthData.totalTagihan += item.Total_Tagihan
      monthData.totalTerbayar += item.Jumlah_Pembayaran
      monthData.totalPending += (item.Total_Tagihan - item.Jumlah_Pembayaran)
    }
  })

  // Return all 12 months sorted by order
  return Array.from(monthlyData.entries())
    .map(([bulan, data]) => ({
      bulan,
      ...data,
    }))
    .sort((a, b) => (monthOrder[a.bulan] || 0) - (monthOrder[b.bulan] || 0))
}

export function generateRusunwaData(data: Penerimaan[]): RusunwaData[] {
  const rusunwaMap = new Map<string, { totalPenerimaan: number; jumlahUnit: number; totalTagihan: number; totalTerbayar: number }>()

  data.forEach((item) => {
    if (!rusunwaMap.has(item.Rusunawa)) {
      rusunwaMap.set(item.Rusunawa, { 
        totalPenerimaan: 0, 
        jumlahUnit: 0,
        totalTagihan: 0,
        totalTerbayar: 0
      })
    }

    const rusunwaData = rusunwaMap.get(item.Rusunawa)!
    rusunwaData.totalPenerimaan += item.Jumlah_Pembayaran
    rusunwaData.jumlahUnit += 1
    rusunwaData.totalTagihan += item.Total_Tagihan
    rusunwaData.totalTerbayar += item.Jumlah_Pembayaran
  })

  return Array.from(rusunwaMap.entries())
    .map(([rusunawa, data]) => ({
      rusunawa,
      totalPenerimaan: data.totalPenerimaan,
      jumlahUnit: data.jumlahUnit,
      tingkatPelunasan: data.totalTagihan > 0 
        ? (data.totalTerbayar / data.totalTagihan) * 100 
        : 0,
    }))
    .sort((a, b) => b.totalPenerimaan - a.totalPenerimaan)
}

export function generateGedungData(data: Penerimaan[]): GedungData[] {
  const gedungMap = new Map<string, { rusunawa: string; totalPenerimaan: number; jumlahUnit: number }>()

  data.forEach((item) => {
    const key = `${item.Rusunawa}-${item.Gedung}`
    
    if (!gedungMap.has(key)) {
      gedungMap.set(key, { 
        rusunawa: item.Rusunawa,
        totalPenerimaan: 0, 
        jumlahUnit: 0 
      })
    }

    const gedungData = gedungMap.get(key)!
    gedungData.totalPenerimaan += item.Jumlah_Pembayaran
    gedungData.jumlahUnit += 1
  })

  return Array.from(gedungMap.entries())
    .map(([key, data]) => ({
      gedung: key.split('-')[1],
      rusunawa: data.rusunawa,
      totalPenerimaan: data.totalPenerimaan,
      jumlahUnit: data.jumlahUnit,
    }))
    .sort((a, b) => b.totalPenerimaan - a.totalPenerimaan)
    .slice(0, 10)
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
