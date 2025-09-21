export interface Invoice {
  NomorFaktur: string;
  NamaVendor: string;
  TanggalFaktur: string; // Format 'YYYY-MM-DD'
  TanggalJatuhTempo: string; // Format 'YYYY-MM-DD'
  TotalTagihan: number;
  LinkInvoice: string;
  TanggalPembayaran: string | null;
  StatusPembayaran: "Lunas" | "Menunggu Persetujuan";
}

export interface InvoiceStats {
  totalInvoices: number;
  totalAmount: number;
  paidInvoices: number;
  pendingInvoices: number;
  overdueInvoices: number;
  totalPaidAmount: number;
  totalPendingAmount: number;
}

export interface ChartData {
  month: string;
  totalAmount: number;
  paidAmount: number;
  pendingAmount: number;
}

export interface VendorData {
  vendor: string;
  totalAmount: number;
  invoiceCount: number;
}