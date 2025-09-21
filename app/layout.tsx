// app/layout.tsx

import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { ThemeProvider } from '@/components/theme-provider' // Pastikan path ini benar

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Dashboard - Invoice Management',
  description: 'Manage your invoices and vendors efficiently',
}

// Perbaikan 1: Gunakan React.ReactNode
export default function RootLayout({
  children,
}: {
  children: React.ReactNode 
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body 
        className={`${inter.className} min-h-screen bg-background text-foreground`}
        suppressHydrationWarning
      >
        {/* Perbaikan 2: Panggil ThemeProvider tanpa props tambahan */}
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}