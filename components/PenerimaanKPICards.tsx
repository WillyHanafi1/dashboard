'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { PenerimaanStats } from '@/types/penerimaan'
import { formatCurrency, formatPercentage } from '@/lib/penerimaanQueries'
import { 
  Wallet, 
  TrendingUp, 
  CheckCircle, 
  AlertCircle,
  DollarSign,
  Receipt
} from 'lucide-react'

interface PenerimaanKPICardsProps {
  stats: PenerimaanStats
  loading?: boolean
}

export default function PenerimaanKPICards({ stats, loading = false }: PenerimaanKPICardsProps) {
  const kpiData = [
    {
      title: 'Total Tagihan',
      value: formatCurrency(stats.totalTagihan),
      icon: Receipt,
      iconColor: 'text-blue-500',
      bgColor: 'bg-blue-500/10',
      borderColor: 'border-blue-500/20',
    },
    {
      title: 'Total Terbayar',
      value: formatCurrency(stats.totalTerbayar),
      icon: Wallet,
      iconColor: 'text-green-500',
      bgColor: 'bg-green-500/10',
      borderColor: 'border-green-500/20',
    },
    {
      title: 'Total Pending',
      value: formatCurrency(stats.totalPending),
      icon: AlertCircle,
      iconColor: 'text-amber-500',
      bgColor: 'bg-amber-500/10',
      borderColor: 'border-amber-500/20',
    },
    {
      title: 'Tingkat Pelunasan',
      value: formatPercentage(stats.tingkatPelunasan),
      icon: TrendingUp,
      iconColor: 'text-emerald-500',
      bgColor: 'bg-emerald-500/10',
      borderColor: 'border-emerald-500/20',
    },
    {
      title: 'Unit Lunas',
      value: `${stats.jumlahLunas} Unit`,
      icon: CheckCircle,
      iconColor: 'text-cyan-500',
      bgColor: 'bg-cyan-500/10',
      borderColor: 'border-cyan-500/20',
    },
    {
      title: 'Unit Belum Lunas',
      value: `${stats.jumlahBelumLunas} Unit`,
      icon: AlertCircle,
      iconColor: 'text-red-500',
      bgColor: 'bg-red-500/10',
      borderColor: 'border-red-500/20',
    },
  ]

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, index) => (
          <Card key={index} className="animate-pulse">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="h-4 bg-muted rounded w-24"></div>
              <div className="h-10 w-10 bg-muted rounded-lg"></div>
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-muted rounded w-32"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {kpiData.map((kpi, index) => {
        const Icon = kpi.icon
        return (
          <Card
            key={index}
            className={`border-2 ${kpi.borderColor} ${kpi.bgColor} transition-all duration-200 hover:scale-105 hover:shadow-lg group`}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {kpi.title}
              </CardTitle>
              <div className={`h-10 w-10 rounded-lg ${kpi.bgColor} flex items-center justify-center group-hover:brightness-110 transition-all`}>
                <Icon className={`h-5 w-5 ${kpi.iconColor}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${kpi.iconColor}`}>
                {kpi.value}
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
