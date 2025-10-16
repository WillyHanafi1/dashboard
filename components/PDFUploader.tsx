'use client'

import { useState, useRef } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Upload, 
  FileText, 
  CheckCircle2, 
  XCircle, 
  Loader2,
  AlertCircle,
  FileCheck
} from 'lucide-react'

interface ChunkInfo {
  chunkNumber: number
  pageRange: string
  chunkFileName: string
  fileSize: number
}

interface UploadResponse {
  success: boolean
  message: string
  summary: {
    originalFileName: string
    totalPages: number
    totalChunks: number
    chunkSize: number
    totalSize: number
  }
  webhookResponse?: {
    status: number
    statusText: string
    data: any
  }
  error?: {
    message: string
    code?: string
    response?: any
  }
  chunks: ChunkInfo[]
}

export default function PDFUploader() {
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [result, setResult] = useState<UploadResponse | null>(null)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      if (selectedFile.type !== 'application/pdf') {
        setError('File harus berformat PDF')
        return
      }
      setFile(selectedFile)
      setError(null)
      setResult(null)
    }
  }

  const handleUpload = async () => {
    if (!file) {
      setError('Silakan pilih file PDF terlebih dahulu')
      return
    }

    setUploading(true)
    setError(null)
    setResult(null)

    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('/api/pdf/split', {
        method: 'POST',
        body: formData,
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Gagal memproses PDF')
      }

      setResult(data)
      
      // Clear file input after successful upload
      if (data.success) {
        setFile(null)
        if (fileInputRef.current) {
          fileInputRef.current.value = ''
        }
      }
    } catch (err: any) {
      setError(err.message || 'Terjadi kesalahan saat upload')
    } finally {
      setUploading(false)
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB'
  }

  return (
    <div className="space-y-6">
      {/* Upload Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Upload PDF
          </CardTitle>
          <CardDescription>
            Upload file PDF untuk dipecah per 3 halaman dan dikirim ke n8n webhook
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* File Input */}
          <div className="flex items-center gap-4">
            <input
              ref={fileInputRef}
              type="file"
              accept="application/pdf"
              onChange={handleFileChange}
              className="hidden"
              id="pdf-upload"
            />
            <label
              htmlFor="pdf-upload"
              className="cursor-pointer px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors flex items-center gap-2"
            >
              <FileText className="h-4 w-4" />
              Pilih File PDF
            </label>
            
            {file && (
              <div className="flex items-center gap-2 text-sm">
                <FileCheck className="h-4 w-4 text-green-500" />
                <span className="font-medium">{file.name}</span>
                <span className="text-muted-foreground">
                  ({formatFileSize(file.size)})
                </span>
              </div>
            )}
          </div>

          {/* Upload Button */}
          <Button
            onClick={handleUpload}
            disabled={!file || uploading}
            className="w-full"
          >
            {uploading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Memproses...
              </>
            ) : (
              <>
                <Upload className="h-4 w-4 mr-2" />
                Upload & Kirim ke n8n
              </>
            )}
          </Button>

          {/* Error Alert */}
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Results */}
      {result && (
        <Alert variant={result.success ? "default" : "destructive"} className={result.success ? "border-green-500 bg-green-500/10" : ""}>
          {result.success ? (
            <CheckCircle2 className="h-4 w-4 !text-green-500" />
          ) : (
            <AlertCircle className="h-4 w-4" />
          )}
          <AlertDescription>
            <div className="space-y-2">
              <p className={`font-semibold ${result.success ? 'text-green-600 dark:text-green-400' : ''}`}>
                {result.success ? '✓ Pengiriman Berhasil' : '✗ Pengiriman Gagal'}
              </p>
              <p className="text-sm">
                {result.success 
                  ? `${result.summary.totalChunks} chunks berhasil dikirim ke n8n (${result.summary.totalPages} halaman)`
                  : `Gagal mengirim chunks: ${result.error?.message}`
                }
              </p>
            </div>
          </AlertDescription>
        </Alert>
      )}
    </div>
  )
}
