export interface Penerimaan {
  id: number;
  Rusunawa: string;
  Gedung: string;
  Lantai: string;
  Nomor: string;
  Bulan: string;
  Tanggal_Tagihan: string; // Format 'YYYY-MM-DD'
  Nama: string;
  Sewa: number;
  Parkir: number | null;
  Denda: number | null;
  Total_Tagihan: number;
  Jumlah_Pembayaran: number;
  Status_Pembayaran: "Lunas" | "Belum Lunas" | "Sebagian";
  Tanggal_Bayar: string | null;
  StatusRekonsiliasi: "Sudah Rekonsiliasi" | "Belum Rekonsiliasi";
}

export interface PenerimaanStats {
  totalPenerimaan: number;
  totalTagihan: number;
  totalTerbayar: number;
  totalPending: number;
  jumlahLunas: number;
  jumlahBelumLunas: number;
  totalSewa: number;
  totalParkir: number;
  totalDenda: number;
  tingkatPelunasan: number;
}

export interface PenerimaanChartData {
  bulan: string;
  totalTagihan: number;
  totalTerbayar: number;
  totalPending: number;
}

export interface RusunwaData {
  rusunawa: string;
  totalPenerimaan: number;
  jumlahUnit: number;
  tingkatPelunasan: number;
}

export interface GedungData {
  gedung: string;
  rusunawa: string;
  totalPenerimaan: number;
  jumlahUnit: number;
}
