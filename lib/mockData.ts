import { Invoice } from '@/types/invoice'

export const mockInvoices: Invoice[] = [
  {
    NomorFaktur: "INV-2024-001",
    NamaVendor: "PT. Teknologi Maju",
    TanggalFaktur: "2024-01-15",
    TanggalJatuhTempo: "2024-02-15",
    TotalTagihan: 15000000,
    LinkInvoice: "https://example.com/invoice-001.pdf",
    TanggalPembayaran: "2024-02-10",
    StatusPembayaran: "Lunas"
  },
  {
    NomorFaktur: "INV-2024-002",
    NamaVendor: "CV. Sumber Rejeki",
    TanggalFaktur: "2024-01-20",
    TanggalJatuhTempo: "2024-02-20",
    TotalTagihan: 8500000,
    LinkInvoice: "https://example.com/invoice-002.pdf",
    TanggalPembayaran: null,
    StatusPembayaran: "Menunggu Persetujuan"
  },
  {
    NomorFaktur: "INV-2024-003",
    NamaVendor: "PT. Digital Solutions",
    TanggalFaktur: "2024-02-01",
    TanggalJatuhTempo: "2024-03-01",
    TotalTagihan: 22000000,
    LinkInvoice: "https://example.com/invoice-003.pdf",
    TanggalPembayaran: "2024-02-25",
    StatusPembayaran: "Lunas"
  },
  {
    NomorFaktur: "INV-2024-004",
    NamaVendor: "CV. Kreatif Media",
    TanggalFaktur: "2024-02-10",
    TanggalJatuhTempo: "2024-01-10", // Overdue
    TotalTagihan: 12500000,
    LinkInvoice: "https://example.com/invoice-004.pdf",
    TanggalPembayaran: null,
    StatusPembayaran: "Menunggu Persetujuan"
  },
  {
    NomorFaktur: "INV-2024-005",
    NamaVendor: "PT. Teknologi Maju",
    TanggalFaktur: "2024-02-15",
    TanggalJatuhTempo: "2024-03-15",
    TotalTagihan: 18000000,
    LinkInvoice: "https://example.com/invoice-005.pdf",
    TanggalPembayaran: "2024-03-12",
    StatusPembayaran: "Lunas"
  },
  {
    NomorFaktur: "INV-2024-006",
    NamaVendor: "CV. Inovasi Bisnis",
    TanggalFaktur: "2024-03-01",
    TanggalJatuhTempo: "2024-04-01",
    TotalTagihan: 9500000,
    LinkInvoice: "https://example.com/invoice-006.pdf",
    TanggalPembayaran: null,
    StatusPembayaran: "Menunggu Persetujuan"
  },
  {
    NomorFaktur: "INV-2024-007",
    NamaVendor: "PT. Global Services",
    TanggalFaktur: "2024-03-05",
    TanggalJatuhTempo: "2024-04-05",
    TotalTagihan: 25000000,
    LinkInvoice: "https://example.com/invoice-007.pdf",
    TanggalPembayaran: "2024-04-02",
    StatusPembayaran: "Lunas"
  },
  {
    NomorFaktur: "INV-2024-008",
    NamaVendor: "CV. Sumber Rejeki",
    TanggalFaktur: "2024-03-10",
    TanggalJatuhTempo: "2024-02-10", // Overdue
    TotalTagihan: 14000000,
    LinkInvoice: "https://example.com/invoice-008.pdf",
    TanggalPembayaran: null,
    StatusPembayaran: "Menunggu Persetujuan"
  },
  {
    NomorFaktur: "INV-2024-009",
    NamaVendor: "PT. Smart Technology",
    TanggalFaktur: "2024-03-15",
    TanggalJatuhTempo: "2024-04-15",
    TotalTagihan: 17500000,
    LinkInvoice: "https://example.com/invoice-009.pdf",
    TanggalPembayaran: "2024-04-12",
    StatusPembayaran: "Lunas"
  },
  {
    NomorFaktur: "INV-2024-010",
    NamaVendor: "CV. Kreatif Media",
    TanggalFaktur: "2024-04-20",
    TanggalJatuhTempo: "2024-05-20",
    TotalTagihan: 11000000,
    LinkInvoice: "https://example.com/invoice-010.pdf",
    TanggalPembayaran: null,
    StatusPembayaran: "Menunggu Persetujuan"
  },
  {
    NomorFaktur: "INV-2024-011",
    NamaVendor: "PT. Sejahtera Corp",
    TanggalFaktur: "2024-05-01",
    TanggalJatuhTempo: "2024-06-01",
    TotalTagihan: 19500000,
    LinkInvoice: "https://example.com/invoice-011.pdf",
    TanggalPembayaran: "2024-05-28",
    StatusPembayaran: "Lunas"
  },
  {
    NomorFaktur: "INV-2024-012",
    NamaVendor: "CV. Media Prima",
    TanggalFaktur: "2024-05-15",
    TanggalJatuhTempo: "2024-06-15",
    TotalTagihan: 7200000,
    LinkInvoice: "https://example.com/invoice-012.pdf",
    TanggalPembayaran: null,
    StatusPembayaran: "Menunggu Persetujuan"
  }
]