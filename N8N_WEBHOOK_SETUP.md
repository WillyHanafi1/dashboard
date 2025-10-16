# n8n Webhook Setup untuk Rekonsiliasi Bank

## Overview
Aplikasi akan mengirim **satu request tunggal** dengan **multiple PDF files** sebagai binary data menggunakan `multipart/form-data`.

## Webhook Configuration

### 1. Webhook Node Setup
- **Method**: `POST`
- **Authentication**: None (atau sesuai kebutuhan)
- **Response**: JSON

### 2. Data Structure

#### Form Fields:
```
originalFileName: "rekening_koran.pdf"
totalPages: "15"
totalChunks: "5"
chunks: [File, File, File, File, File]  // Array of binary PDF files
chunk_1_info: {"chunkNumber":1,"pageRange":"1-3","fileSize":45678}
chunk_2_info: {"chunkNumber":2,"pageRange":"4-6","fileSize":43210}
chunk_3_info: {"chunkNumber":3,"pageRange":"7-9","fileSize":41234}
chunk_4_info: {"chunkNumber":4,"pageRange":"10-12","fileSize":44567}
chunk_5_info: {"chunkNumber":5,"pageRange":"13-15","fileSize":39876}
```

## n8n Workflow Example

### Node 1: Webhook (Trigger)
```
Method: POST
Path: /webhook-test/c8a5808f-4f67-4dc5-87e0-299df709cbb8
Response Mode: Using Fields Below
Response Data: JSON
```

### Node 2: Extract Metadata
```javascript
// Get metadata from form data
const originalFileName = $json.body.originalFileName;
const totalPages = parseInt($json.body.totalPages);
const totalChunks = parseInt($json.body.totalChunks);

// Get all PDF files from the 'chunks' field
const chunks = $json.files; // n8n automatically parses multipart files

return {
  originalFileName,
  totalPages,
  totalChunks,
  chunkCount: chunks.length
};
```

### Node 3: Loop Over Each Chunk
```javascript
// Split into items - one item per chunk
const items = [];

for (let i = 0; i < $json.chunkCount; i++) {
  const chunkInfoKey = `chunk_${i + 1}_info`;
  const chunkInfo = JSON.parse($json.body[chunkInfoKey]);
  
  items.push({
    json: {
      chunkNumber: chunkInfo.chunkNumber,
      pageRange: chunkInfo.pageRange,
      fileSize: chunkInfo.fileSize,
      originalFileName: $json.originalFileName,
      // File binary data is in $binary
      file: $binary.chunks[i]
    }
  });
}

return items;
```

### Node 4: Process Each PDF Chunk

Setiap chunk sekarang bisa diproses:

#### Option A: Save to File System
```javascript
const fs = require('fs');
const path = '/path/to/save/' + $json.chunkNumber + '.pdf';

fs.writeFileSync(path, Buffer.from($binary.file.data, 'base64'));

return { saved: true, path };
```

#### Option B: Send to Cloud Storage (S3, Google Drive, etc.)
Gunakan node S3/Google Drive dan kirim `$binary.file`

#### Option C: Extract Text dengan PDF Parser
```javascript
// Jika ada node PDF parser
const pdfData = $binary.file.data;
// Process PDF...
```

## Accessing Files in n8n

### Method 1: Access via $json.body (for form fields)
```javascript
const metadata = {
  originalFileName: $json.body.originalFileName,
  totalPages: $json.body.totalPages,
  totalChunks: $json.body.totalChunks
};
```

### Method 2: Access via $binary (for files)
```javascript
// n8n stores uploaded files in $binary
// For multipart with field name 'chunks', access as:
const allChunks = $binary.chunks; // This is an array

// Or access individual file:
const firstChunk = $binary.chunks[0];
```

### Method 3: Access Individual Chunk Info
```javascript
// Parse chunk metadata
const chunk1Info = JSON.parse($json.body.chunk_1_info);
// {
//   "chunkNumber": 1,
//   "pageRange": "1-3", 
//   "fileSize": 45678
// }
```

## Complete Workflow Structure

```
┌─────────────────┐
│  Webhook Trigger│
│  (Receive POST) │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Extract Metadata│
│ - originalName  │
│ - totalPages    │
│ - totalChunks   │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Split Into Items│
│ (Loop Prep)     │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Loop Over      │
│  Each Chunk     │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Process PDF     │
│ - Extract Text  │
│ - Save to DB    │
│ - Upload to S3  │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Aggregate       │
│ Results         │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Send Response   │
│ (Success/Fail)  │
└─────────────────┘
```

## Testing with curl

```bash
curl -X POST http://localhost:5678/webhook-test/c8a5808f-4f67-4dc5-87e0-299df709cbb8 \
  -F "originalFileName=test.pdf" \
  -F "totalPages=9" \
  -F "totalChunks=3" \
  -F "chunks=@chunk_1.pdf" \
  -F "chunks=@chunk_2.pdf" \
  -F "chunks=@chunk_3.pdf" \
  -F 'chunk_1_info={"chunkNumber":1,"pageRange":"1-3","fileSize":1234}' \
  -F 'chunk_2_info={"chunkNumber":2,"pageRange":"4-6","fileSize":1234}' \
  -F 'chunk_3_info={"chunkNumber":3,"pageRange":"7-9","fileSize":1234}'
```

## Response Format

n8n harus mengembalikan JSON response:

```json
{
  "success": true,
  "message": "Successfully processed 5 chunks",
  "processedChunks": 5,
  "results": [
    {
      "chunkNumber": 1,
      "status": "processed",
      "extractedData": { ... }
    }
  ]
}
```

## Important Notes

1. **File Size Limits**: 
   - Default n8n webhook has file size limits
   - Adjust in n8n settings if needed: `N8N_PAYLOAD_SIZE_MAX`

2. **Binary Data Handling**:
   - n8n automatically parses multipart/form-data
   - Files are available in `$binary` object
   - Metadata in `$json.body`

3. **Error Handling**:
   - Return proper HTTP status codes
   - Include error messages in response

4. **Performance**:
   - Process chunks in parallel jika memungkinkan
   - Use n8n's SplitInBatches node untuk heavy processing

5. **Field Naming**:
   - Form field `chunks` akan berisi array of files
   - Jangan ubah nama field tanpa update API route

## Debugging Tips

### Check Webhook Payload
Add a "Code" node after webhook:
```javascript
return [
  {
    json: {
      bodyKeys: Object.keys($json.body),
      binaryKeys: Object.keys($binary),
      firstChunkInfo: $json.body.chunk_1_info
    }
  }
];
```

### Verify File Reception
```javascript
return [
  {
    json: {
      receivedFiles: $binary.chunks ? $binary.chunks.length : 0,
      firstFileSize: $binary.chunks && $binary.chunks[0] ? 
        $binary.chunks[0].data.length : 0
    }
  }
];
```

## Security Considerations

1. **Authentication**: 
   - Add API key validation
   - Use n8n's built-in authentication

2. **File Validation**:
   - Check file types
   - Validate file sizes
   - Scan for malware if needed

3. **Rate Limiting**:
   - Implement request throttling
   - Prevent abuse

4. **HTTPS**:
   - Use HTTPS in production
   - Never send sensitive data over HTTP
