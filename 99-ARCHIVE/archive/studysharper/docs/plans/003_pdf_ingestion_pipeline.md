# PDF Upload & Processing Pipeline Implementation Plan

**Plan ID:** 003
**Feature:** PDF Upload & Text Processing Pipeline  
**Priority:** CRITICAL PATH #2
**Estimated Time:** 3-4 hours
**Started:** 2025-08-13 14:00 UTC

## Scope

Implement comprehensive PDF processing pipeline for content ingestion:
- PDF file upload with validation and storage
- Text extraction and preprocessing 
- Intelligent chunking for embeddings
- Metadata extraction and organization
- Progress tracking for large files

## Database Requirements

### New Tables Needed:

1. **Content Sources (`content_sources`)**
   ```sql
   CREATE TABLE content_sources (
     id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
     user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
     subject_id UUID REFERENCES subjects(id) ON DELETE SET NULL,
     title TEXT NOT NULL,
     source_type TEXT NOT NULL, -- 'pdf', 'url', 'manual', 'youtube'
     file_path TEXT, -- for uploaded files
     url TEXT, -- for web sources
     status TEXT DEFAULT 'processing', -- 'processing', 'completed', 'failed'
     metadata JSONB DEFAULT '{}',
     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
     updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
   );
   ```

2. **Content Chunks (`content_chunks`)**
   ```sql
   CREATE TABLE content_chunks (
     id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
     source_id UUID NOT NULL REFERENCES content_sources(id) ON DELETE CASCADE,
     chunk_text TEXT NOT NULL,
     chunk_index INTEGER NOT NULL,
     page_number INTEGER,
     embedding VECTOR(1536), -- OpenAI text-embedding-3-small
     metadata JSONB DEFAULT '{}',
     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
   );
   ```

3. **Processing Jobs (`processing_jobs`)**
   ```sql
   CREATE TABLE processing_jobs (
     id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
     source_id UUID NOT NULL REFERENCES content_sources(id) ON DELETE CASCADE,
     job_type TEXT NOT NULL, -- 'text_extraction', 'chunking', 'embedding'
     status TEXT DEFAULT 'pending', -- 'pending', 'processing', 'completed', 'failed'
     progress INTEGER DEFAULT 0, -- 0-100
     error_message TEXT,
     started_at TIMESTAMP WITH TIME ZONE,
     completed_at TIMESTAMP WITH TIME ZONE,
     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
   );
   ```

### Indexes and RLS:
```sql
-- Indexes
CREATE INDEX idx_content_sources_user_id ON content_sources(user_id);
CREATE INDEX idx_content_sources_subject_id ON content_sources(subject_id);
CREATE INDEX idx_content_chunks_source_id ON content_chunks(source_id);
CREATE INDEX idx_content_chunks_embedding ON content_chunks USING ivfflat (embedding vector_cosine_ops);
CREATE INDEX idx_processing_jobs_source_id ON processing_jobs(source_id);

-- RLS Policies
ALTER TABLE content_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_chunks ENABLE ROW LEVEL SECURITY;
ALTER TABLE processing_jobs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own content sources" ON content_sources
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can access chunks of own sources" ON content_chunks
  FOR ALL USING (
    auth.uid() IN (
      SELECT user_id FROM content_sources WHERE content_sources.id = content_chunks.source_id
    )
  );

CREATE POLICY "Users can view own processing jobs" ON processing_jobs
  FOR ALL USING (
    auth.uid() IN (
      SELECT user_id FROM content_sources WHERE content_sources.id = processing_jobs.source_id
    )
  );
```

## API Endpoints

### 1. File Upload API (`/api/content/upload`)
- **POST**: Upload PDF file
- Validation: file type, size limits (50MB max)
- Store in Supabase Storage bucket
- Create content_source record
- Trigger processing job

### 2. Processing Status API (`/api/content/status`)
- **GET**: Check processing status for source
- Return progress, current step, errors
- Real-time updates via polling or SSE

### 3. Content Management API (`/api/content/sources`)
- **GET**: List user's content sources
- **DELETE**: Remove content source and chunks
- **PUT**: Update source metadata

### 4. Text Processing API (`/api/content/process`)
- **POST**: Trigger processing for uploaded file
- Extract text using PDF.js or similar
- Chunk text intelligently (512 tokens)
- Generate embeddings via OpenAI API

## Frontend Components

### 1. Upload Interface (`components/content/pdf-upload.tsx`)
```typescript
interface PDFUploadProps {
  subjectId?: string
  onUploadComplete: (sourceId: string) => void
}

// Features:
// - Drag & drop file upload
// - Progress bar during upload
// - File validation feedback
// - Preview of uploaded PDF
```

### 2. Processing Status (`components/content/processing-status.tsx`)
```typescript
interface ProcessingStatusProps {
  sourceId: string
  onComplete: () => void
}

// Features:
// - Real-time progress updates
// - Step-by-step progress indicators
// - Error handling and retry
// - Estimated time remaining
```

### 3. Content Library (`components/content/content-library.tsx`)
```typescript
interface ContentLibraryProps {
  subjectId?: string
  sources: ContentSource[]
}

// Features:
// - Grid/list view of uploaded content
// - Search and filter capabilities
// - Quick actions (view, delete, reprocess)
// - Batch operations
```

### 4. PDF Viewer (`components/content/pdf-viewer.tsx`)
```typescript
interface PDFViewerProps {
  sourceId: string
  highlightChunks?: string[]
}

// Features:
// - Full PDF viewing
// - Chunk highlighting
// - Text selection and notes
// - Search within document
```

## Text Processing Pipeline

### 1. Text Extraction
```typescript
// Using PDF.js or similar library
const extractTextFromPDF = async (filePath: string): Promise<{
  text: string
  pages: { pageNumber: number; text: string }[]
  metadata: { title?: string; author?: string; pageCount: number }
}> => {
  // Implementation details
}
```

### 2. Intelligent Chunking
```typescript
const chunkText = async (text: string, options: {
  maxTokens: number // 512 default
  overlap: number   // 50 tokens default
  preserveSentences: boolean // true
}): Promise<{
  chunks: { text: string; startIndex: number; endIndex: number }[]
  totalChunks: number
}> => {
  // Smart chunking that:
  // - Respects sentence boundaries
  // - Maintains context with overlap
  // - Handles code blocks and lists
  // - Preserves formatting when important
}
```

### 3. Metadata Extraction
```typescript
const extractMetadata = async (pdfBuffer: Buffer): Promise<{
  title?: string
  author?: string
  subject?: string
  keywords?: string[]
  creationDate?: Date
  pageCount: number
  fileSize: number
}> => {
  // Extract PDF metadata
}
```

## Embedding Generation

### Integration with OpenAI API
```typescript
const generateEmbeddings = async (chunks: string[]): Promise<number[][]> => {
  // Batch process chunks
  // Handle rate limiting
  // Retry failed requests
  // Cache embeddings
}
```

### Embedding Storage
- Store embeddings in `content_chunks.embedding` column
- Use pgvector for similarity search
- Index for fast retrieval

## Storage Strategy

### Supabase Storage
- Create bucket: `content-files`
- Organize by user: `{user_id}/uploads/{timestamp}_{filename}`
- Enable RLS on storage bucket
- Set appropriate file size limits

### File Processing Workflow
1. Upload file to Supabase Storage
2. Create content_source record
3. Extract text asynchronously
4. Chunk text into appropriate sizes
5. Generate embeddings for each chunk
6. Store chunks with embeddings
7. Update source status to 'completed'

## Error Handling

### Common Error Scenarios
- **File Too Large**: Clear size limit messaging
- **Unsupported Format**: Guide user to supported formats
- **Corrupted PDF**: Retry with different extraction method
- **API Rate Limits**: Queue processing and retry
- **Network Failures**: Resume processing from last checkpoint

### Recovery Mechanisms
- Partial processing resume
- Chunk-level retry for failed embeddings
- Manual reprocessing trigger
- Error reporting and debugging info

## Performance Considerations

### Upload Optimization
- Stream large files for upload
- Client-side file validation
- Progress feedback during upload
- Background processing queue

### Processing Optimization
- Batch embedding generation
- Parallel chunk processing
- Memory-efficient PDF parsing
- Background job queue

### Database Optimization
- Efficient vector similarity queries
- Proper indexing strategy
- Connection pooling
- Query optimization

## User Experience

### Upload Flow
1. **Select Subject**: Choose which course/subject
2. **Upload File**: Drag & drop or file picker
3. **Add Metadata**: Title, description, tags
4. **Monitor Progress**: Real-time processing updates
5. **Review Content**: Preview chunks and organization

### Content Management
- Search across all uploaded content
- Filter by subject, date, file type
- Preview content without full download
- Bulk operations for organization

## Testing Strategy

### Unit Tests
- Text extraction accuracy
- Chunking algorithm effectiveness
- Embedding generation reliability
- API endpoint functionality

### Integration Tests
- End-to-end upload workflow
- Processing pipeline completion
- Error handling scenarios
- Performance under load

### User Acceptance Tests
- Upload various PDF types
- Large file handling (30MB+)
- Network interruption recovery
- Search and retrieval accuracy

## Acceptance Criteria

### ✅ File Upload
- [ ] Support PDF files up to 50MB
- [ ] Drag & drop interface
- [ ] Real-time upload progress
- [ ] File validation and error messages
- [ ] Upload to Supabase Storage with RLS

### ✅ Text Processing
- [ ] Extract text from uploaded PDFs
- [ ] Handle various PDF formats and encodings
- [ ] Intelligent text chunking (512 tokens)
- [ ] Preserve document structure context
- [ ] Extract and store metadata

### ✅ Embedding Generation
- [ ] Generate embeddings for all chunks
- [ ] Store embeddings in vector database
- [ ] Handle API rate limits gracefully
- [ ] Batch processing for efficiency
- [ ] Error recovery and retry logic

### ✅ Content Management
- [ ] List uploaded content by subject
- [ ] View processing status and progress
- [ ] Delete content and associated data
- [ ] Search within uploaded content
- [ ] Preview content chunks

### ✅ Performance
- [ ] Process 10MB PDF in < 60 seconds
- [ ] Upload progress updates every 5%
- [ ] Embedding generation < 2s per chunk
- [ ] Vector search < 500ms response
- [ ] Handle 10 concurrent uploads

## Security Considerations

### File Upload Security
- Validate file types server-side
- Scan for malicious content
- Limit file sizes appropriately
- Use secure file paths

### Data Privacy
- User content isolation via RLS
- Secure embedding storage
- No logging of content text
- GDPR compliance for data deletion

## Implementation Phases

### Phase 1: Basic Upload (1 hour)
- File upload component
- Storage integration
- Basic validation

### Phase 2: Text Processing (2 hours)
- PDF text extraction
- Chunking algorithm
- Progress tracking

### Phase 3: Embeddings (1 hour)
- OpenAI API integration
- Vector storage
- Error handling

### Phase 4: Content Management (30 minutes)
- Content library interface
- Search functionality
- Delete operations

## Post-Implementation

### Monitoring
- Track processing success rates
- Monitor embedding generation costs
- Measure user upload patterns
- Performance metrics

### Future Enhancements
- OCR for scanned PDFs
- Support for more file types
- Advanced chunking strategies
- Semantic search improvements

## Dependencies

- ✅ Academic structure (for subject association)
- ✅ Authentication system
- ✅ Database with vector support
- ❌ OpenAI API key (needs setup)
- ❌ Supabase Storage configuration
- ❌ PDF processing library (PDF.js)

## Risks & Mitigations

- **Risk**: Large PDF processing timeouts
  **Mitigation**: Background job queue with progress tracking

- **Risk**: Embedding costs for large documents
  **Mitigation**: Chunk optimization and cost monitoring

- **Risk**: Vector database performance
  **Mitigation**: Proper indexing and query optimization

- **Risk**: Storage quota limits
  **Mitigation**: File size limits and storage monitoring