import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { InvoiceStats } from '@/types/invoice'
import { formatCurrency } from '@/lib/invoiceQueries'
import { FileText, CheckCircle, Clock, AlertTriangle, DollarSign, TrendingUp } from 'lucide-react'

interface KPICardsProps {
  stats: InvoiceStats
  loading?: boolean
}

export default function KPICards({ stats, loading = false }: KPICardsProps) {
  const kpis = [
    {
      title: 'Total Faktur',
      value: stats.totalInvoices.toString(),
      description: 'Jumlah total faktur',
      icon: FileText,
      color: 'bg-blue-500',
      bgGradient: 'from-blue-500/10 to-blue-600/5',
      borderColor: 'border-blue-500/20',
      textColor: 'text-blue-400',
    },
    {
      title: 'Total Nilai',
      value: formatCurrency(stats.totalAmount),
      description: 'Total nilai semua faktur',
      icon: DollarSign,
      color: 'bg-green-500',
      bgGradient: 'from-green-500/10 to-green-600/5',
      borderColor: 'border-green-500/20',
      textColor: 'text-green-400',
    },
    {
      title: 'Faktur Lunas',
      value: stats.paidInvoices.toString(),
      description: `${formatCurrency(stats.totalPaidAmount)}`,
      icon: CheckCircle,
      color: 'bg-emerald-500',
      bgGradient: 'from-emerald-500/10 to-emerald-600/5',
      borderColor: 'border-emerald-500/20',
      textColor: 'text-emerald-400',
    },
    {
      title: 'Menunggu Pembayaran',
      value: stats.pendingInvoices.toString(),
      description: `${formatCurrency(stats.totalPendingAmount)}`,
      icon: Clock,
      color: 'bg-amber-500',
      bgGradient: 'from-amber-500/10 to-amber-600/5',
      borderColor: 'border-amber-500/20',
      textColor: 'text-amber-400',
    },
    {
      title: 'Faktur Overdue',
      value: stats.overdueInvoices.toString(),
      description: 'Melewati tanggal jatuh tempo',
      icon: AlertTriangle,
      color: 'bg-red-500',
      bgGradient: 'from-red-500/10 to-red-600/5',
      borderColor: 'border-red-500/20',
      textColor: 'text-red-400',
    },
    {
      title: 'Tingkat Pelunasan',
      value: `${stats.totalInvoices > 0 ? Math.round((stats.paidInvoices / stats.totalInvoices) * 100) : 0}%`,
      description: 'Persentase faktur yang telah lunas',
      icon: TrendingUp,
      color: 'bg-purple-500',
      bgGradient: 'from-purple-500/10 to-purple-600/5',
      borderColor: 'border-purple-500/20',
      textColor: 'text-purple-400',
    },
  ]

  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <Card key={index} className="animate-pulse border-border bg-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                <div className="h-4 bg-muted rounded w-24"></div>
              </CardTitle>
              <div className="h-8 w-8 bg-muted rounded-full"></div>
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-muted rounded w-20 mb-2"></div>
              <div className="h-3 bg-muted rounded w-32"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {kpis.map((kpi, index) => {
        const Icon = kpi.icon
        return (
          <Card 
            key={index} 
            className={`
              relative overflow-hidden transition-all duration-200 hover:shadow-lg hover:shadow-primary/5 
              border-border bg-gradient-to-br ${kpi.bgGradient} ${kpi.borderColor} hover:border-opacity-40
              group hover:scale-[1.02]
            `}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors">
                {kpi.title}
              </CardTitle>
              <div className={`relative w-10 h-10 ${kpi.color} rounded-xl flex items-center justify-center shadow-lg`}>
                <Icon className="h-5 w-5 text-white drop-shadow-sm" />
                <div className="absolute inset-0 bg-white/20 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
              </div>
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold transition-colors duration-200 ${kpi.textColor} group-hover:brightness-110`}>
                {kpi.value}
              </div>
              <p className="text-xs text-muted-foreground mt-1 group-hover:text-muted-foreground/80 transition-colors">
                {kpi.description}
              </p>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}