export interface FinanceOverview {
  // Pendapatan
  totalPendapatan: number;
  pendapatanTerbayar: number;
  pendapatanPending: number;
  
  // Pengeluaran
  totalPengeluaran: number;
  pengeluaranLunas: number;
  pengeluaranPending: number;
  
  // Net & Analysis
  netCashflow: number;
  netProfit: number;
  cashflowRatio: number;
  
  // Trends
  pendapatanGrowth: number;
  pengeluaranGrowth: number;
}

export interface FinanceComparison {
  bulan: string;
  pendapatan: number;
  pengeluaran: number;
  netCashflow: number;
}

export interface CashflowSummary {
  period: string;
  cashIn: number;
  cashOut: number;
  balance: number;
}

export interface FinanceHealth {
  healthScore: number;
  status: 'Excellent' | 'Good' | 'Fair' | 'Poor';
  indicators: {
    name: string;
    value: number;
    status: 'positive' | 'neutral' | 'negative';
    description: string;
  }[];
}

export interface TopCategory {
  category: string;
  amount: number;
  percentage: number;
  type: 'income' | 'expense';
}
