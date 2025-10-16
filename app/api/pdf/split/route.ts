import { NextRequest, NextResponse } from 'next/server'
import { PDFDocument } from 'pdf-lib'
import axios from 'axios'

// n8n webhook URL
const N8N_WEBHOOK_URL = 'http://localhost:5678/webhook-test/c8a5808f-4f67-4dc5-87e0-299df709cbb8'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    
    if (!file) {
      return NextResponse.json(
        { error: 'No file uploaded' },
        { status: 400 }
      )
    }

    // Validate file type
    if (file.type !== 'application/pdf') {
      return NextResponse.json(
        { error: 'File must be a PDF' },
        { status: 400 }
      )
    }

    // Read the PDF file
    const arrayBuffer = await file.arrayBuffer()
    const pdfDoc = await PDFDocument.load(arrayBuffer)
    const totalPages = pdfDoc.getPageCount()

    console.log(`Processing PDF: ${file.name}, Total pages: ${totalPages}`)

    // Split PDF into chunks of 3 pages
    const chunkSize = 3
    const totalChunks = Math.ceil(totalPages / chunkSize)

    // Create all chunks first
    console.log('📄 Creating PDF chunks...')
    const chunks = []
    
    for (let i = 0; i < totalChunks; i++) {
      const startPage = i * chunkSize
      const endPage = Math.min(startPage + chunkSize, totalPages)
      
      // Create a new PDF document for this chunk
      const chunkDoc = await PDFDocument.create()
      
      // Copy pages to the new document
      const copiedPages = await chunkDoc.copyPages(
        pdfDoc,
        Array.from({ length: endPage - startPage }, (_, idx) => startPage + idx)
      )
      
      copiedPages.forEach((page) => {
        chunkDoc.addPage(page)
      })

      // Save the chunk as bytes
      const chunkBytes = await chunkDoc.save()
      const chunkBuffer = Buffer.from(chunkBytes)

      const chunkInfo = {
        chunkNumber: i + 1,
        totalChunks,
        pageRange: `${startPage + 1}-${endPage}`,
        chunkFileName: `${file.name.replace('.pdf', '')}_chunk_${i + 1}.pdf`,
        fileSize: chunkBuffer.length,
        buffer: chunkBuffer
      }

      chunks.push(chunkInfo)
      console.log(`✓ Chunk ${i + 1}/${totalChunks} created (${chunkBuffer.length} bytes)`)
    }

    // Send all chunks in a single multipart/form-data request
    console.log('📤 Sending all chunks as binary files in a single request to n8n...')
    
    let results
    try {
      // Create FormData with multiple files
      const FormData = require('form-data')
      const formData = new FormData()
      
      // Add metadata
      formData.append('originalFileName', file.name)
      formData.append('totalPages', totalPages.toString())
      formData.append('totalChunks', totalChunks.toString())
      
      // Add each chunk as a binary file
      chunks.forEach((chunk) => {
        formData.append('chunks', chunk.buffer, {
          filename: chunk.chunkFileName,
          contentType: 'application/pdf',
        })
        
        // Add metadata for each chunk
        formData.append(`chunk_${chunk.chunkNumber}_info`, JSON.stringify({
          chunkNumber: chunk.chunkNumber,
          pageRange: chunk.pageRange,
          fileSize: chunk.fileSize,
        }))
      })

      const response = await axios.post(N8N_WEBHOOK_URL, formData, {
        headers: {
          ...formData.getHeaders(),
        },
        timeout: 60000, // 60 seconds timeout for large payloads
        maxContentLength: Infinity,
        maxBodyLength: Infinity,
      })

      console.log(`✓ All chunks sent successfully: ${response.status} ${response.statusText}`)

      // Single success response
      return NextResponse.json({
        success: true,
        message: `Successfully sent ${totalChunks} chunks to n8n`,
        summary: {
          originalFileName: file.name,
          totalPages,
          totalChunks,
          chunkSize,
          totalSize: chunks.reduce((sum, c) => sum + c.fileSize, 0)
        },
        webhookResponse: {
          status: response.status,
          statusText: response.statusText,
          data: response.data
        },
        chunks: chunks.map(chunk => ({
          chunkNumber: chunk.chunkNumber,
          pageRange: chunk.pageRange,
          chunkFileName: chunk.chunkFileName,
          fileSize: chunk.fileSize
        }))
      })

    } catch (webhookError: any) {
      console.error('✗ Failed to send chunks:', webhookError.message)
      
      // Single error response
      return NextResponse.json({
        success: false,
        message: `Failed to send chunks to n8n: ${webhookError.message}`,
        summary: {
          originalFileName: file.name,
          totalPages,
          totalChunks,
          chunkSize,
          totalSize: chunks.reduce((sum, c) => sum + c.fileSize, 0)
        },
        error: {
          message: webhookError.message,
          code: webhookError.code,
          response: webhookError.response?.data
        },
        chunks: chunks.map(chunk => ({
          chunkNumber: chunk.chunkNumber,
          pageRange: chunk.pageRange,
          chunkFileName: chunk.chunkFileName,
          fileSize: chunk.fileSize
        }))
      })
    }

  } catch (error: any) {
    console.error('Error processing PDF:', error)
    return NextResponse.json(
      { 
        error: 'Failed to process PDF',
        details: error.message 
      },
      { status: 500 }
    )
  }
}
