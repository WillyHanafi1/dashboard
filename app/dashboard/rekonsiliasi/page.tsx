'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import PDFUploader from '@/components/PDFUploader'
import { FileCheck2, Database, Zap } from 'lucide-react'

export default function RekonsiliasiBankPage() {
  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Rekonsiliasi Bank</h1>
        <p className="text-muted-foreground mt-2">
          Upload dan proses rekening koran PDF secara otomatis dengan n8n workflow
        </p>
      </div>

      {/* How It Works */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-yellow-500" />
            Cara Kerja
          </CardTitle>
          <CardDescription>
            Proses otomatis rekonsiliasi bank menggunakan n8n workflow
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 flex flex-col items-center text-center p-4 border rounded-lg bg-muted/50">
              <div className="h-12 w-12 rounded-full bg-blue-500/10 flex items-center justify-center mb-3">
                <FileCheck2 className="h-6 w-6 text-blue-500" />
              </div>
              <h3 className="font-semibold mb-1">1. Upload PDF</h3>
              <p className="text-sm text-muted-foreground">
                Upload file rekening koran dalam format PDF
              </p>
            </div>

            <div className="flex-1 flex flex-col items-center text-center p-4 border rounded-lg bg-muted/50">
              <div className="h-12 w-12 rounded-full bg-green-500/10 flex items-center justify-center mb-3">
                <Database className="h-6 w-6 text-green-500" />
              </div>
              <h3 className="font-semibold mb-1">2. Split PDF</h3>
              <p className="text-sm text-muted-foreground">
                PDF dipecah otomatis per 3 halaman untuk processing
              </p>
            </div>

            <div className="flex-1 flex flex-col items-center text-center p-4 border rounded-lg bg-muted/50">
              <div className="h-12 w-12 rounded-full bg-purple-500/10 flex items-center justify-center mb-3">
                <Zap className="h-6 w-6 text-purple-500" />
              </div>
              <h3 className="font-semibold mb-1">3. n8n Processing</h3>
              <p className="text-sm text-muted-foreground">
                Semua chunk dikirim sekaligus dalam satu request untuk diproses
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* PDF Uploader */}
      <PDFUploader />
    </div>
  )
}
