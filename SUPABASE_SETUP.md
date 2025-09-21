# Setup Supabase untuk Dashboard Faktur

## Schema Database yang Diperlukan

Untuk menggunakan dashboard ini dengan data real dari Supabase, Anda perlu membuat tabel `MainFaktur` dengan struktur berikut:

### SQL untuk membuat tabel MainFaktur

```sql
CREATE TABLE MainFaktur (
    id SERIAL PRIMARY KEY,
    NomorFaktur VARCHAR(100) UNIQUE NOT NULL,
    NamaVendor VARCHAR(255) NOT NULL,
    TanggalFaktur DATE NOT NULL,
    TanggalJatuhTempo DATE NOT NULL,
    TotalTagihan DECIMAL(15,2) NOT NULL,
    LinkInvoice TEXT,
    TanggalPembayaran DATE NULL,
    StatusPembayaran VARCHAR(50) CHECK (StatusPembayaran IN ('Lunas', 'Menunggu Persetujuan')) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Contoh data untuk testing

```sql
INSERT INTO MainFaktur (NomorFaktur, NamaVendor, TanggalFaktur, TanggalJatuhTempo, TotalTagihan, LinkInvoice, TanggalPembayaran, StatusPembayaran) VALUES
('INV-2024-001', 'PT. Teknologi Maju', '2024-01-15', '2024-02-15', 15000000, 'https://example.com/invoice-001.pdf', '2024-02-10', 'Lunas'),
('INV-2024-002', 'CV. Sumber Rejeki', '2024-01-20', '2024-02-20', 8500000, 'https://example.com/invoice-002.pdf', NULL, 'Menunggu Persetujuan'),
('INV-2024-003', 'PT. Digital Solutions', '2024-02-01', '2024-03-01', 22000000, 'https://example.com/invoice-003.pdf', '2024-02-25', 'Lunas'),
('INV-2024-004', 'CV. Kreatif Media', '2024-02-10', '2024-03-10', 12500000, 'https://example.com/invoice-004.pdf', NULL, 'Menunggu Persetujuan'),
('INV-2024-005', 'PT. Teknologi Maju', '2024-02-15', '2024-03-15', 18000000, 'https://example.com/invoice-005.pdf', '2024-03-12', 'Lunas');
```

### Row Level Security (RLS)

Jika Anda ingin menggunakan Row Level Security, tambahkan policy berikut:

```sql
-- Enable RLS
ALTER TABLE MainFaktur ENABLE ROW LEVEL SECURITY;

-- Policy untuk authenticated users
CREATE POLICY "Enable read access for authenticated users" ON MainFaktur
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Enable insert for authenticated users" ON MainFaktur
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Enable update for authenticated users" ON MainFaktur
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Enable delete for authenticated users" ON MainFaktur
    FOR DELETE USING (auth.role() = 'authenticated');
```

## Konfigurasi Environment Variables

Pastikan file `.env.local` Anda berisi:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

## Fitur Dashboard

Dashboard ini akan menampilkan:

1. **KPI Cards:**
   - Total Faktur
   - Total Nilai
   - Faktur Lunas
   - Menunggu Pembayaran
   - Faktur Overdue
   - Tingkat Pelunasan

2. **Charts:**
   - Tren faktur bulanan (Area Chart)
   - Top 10 vendor (Bar Chart)
   - Distribusi status pembayaran (Donut Chart)

3. **Tabel Faktur Terbaru:**
   - Menampilkan 10 faktur terbaru
   - Informasi lengkap nomor, vendor, tanggal, total, dan status

## Mode Fallback

Jika Supabase belum dikonfigurasi, dashboard akan menggunakan mock data untuk demonstrasi fitur-fitur yang tersedia.