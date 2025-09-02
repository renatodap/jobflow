# RAG Pipeline Foundation Implementation Plan

**Plan ID:** 004
**Feature:** RAG Pipeline with Vector Search & Q&A
**Priority:** CRITICAL PATH #3
**Estimated Time:** 3-4 hours
**Started:** 2025-08-13 15:15 UTC

## Scope

Implement complete RAG (Retrieval-Augmented Generation) pipeline for AI-powered question answering:
- PDF text extraction and intelligent chunking
- OpenAI embedding generation and storage
- Vector similarity search implementation
- Question answering API with source citations
- AI chat interface connected to user's content

## Current Foundation ✅

Already implemented from Priority #2:
- ✅ Content upload and storage system
- ✅ Database schema with vector support
- ✅ Processing job queue infrastructure
- ✅ Content management UI
- ✅ RLS policies for data security

## Implementation Phases

### Phase 1: Text Processing Engine (1 hour)

**PDF Text Extraction**
```typescript
// lib/content/pdf-processor.ts
import { getDocument } from 'pdfjs-dist'

export interface PDFExtractionResult {
  text: string
  pages: Array<{ pageNumber: number; text: string }>
  metadata: {
    title?: string
    author?: string
    pageCount: number
    fileSize: number
  }
}

export async function extractTextFromPDF(
  buffer: Buffer
): Promise<PDFExtractionResult>
```

**Intelligent Text Chunking**
```typescript
// lib/content/text-chunker.ts
export interface ChunkingOptions {
  maxTokens: number // 512 default
  overlap: number   // 50 tokens default
  preserveSentences: boolean // true
}

export function chunkText(
  text: string, 
  options: ChunkingOptions
): Array<{
  text: string
  startIndex: number
  endIndex: number
  pageNumber?: number
}>
```

**API Integration**
- `POST /api/content/process` - Trigger text processing
- Background job processing with progress updates
- Chunk storage in `content_chunks` table

### Phase 2: Embedding Generation (1 hour)

**OpenAI API Integration**
```typescript
// lib/ai/embeddings.ts
export async function generateEmbeddings(
  chunks: string[]
): Promise<number[][]> {
  // Batch processing for efficiency
  // Rate limiting and retry logic
  // Cost optimization
}
```

**Vector Storage**
```typescript
// Store embeddings in content_chunks.embedding
// Update processing job status
// Enable vector similarity search
```

**API Endpoints**
- `POST /api/ai/embeddings` - Generate embeddings for chunks
- Batch processing with progress tracking
- Error handling and retry logic

### Phase 3: Vector Search & RAG (1.5 hours)

**Similarity Search**
```sql
-- Vector similarity query
SELECT 
  cc.chunk_text,
  cc.page_number,
  cs.title,
  cs.id as source_id,
  1 - (cc.embedding <=> $1) as similarity_score
FROM content_chunks cc
JOIN content_sources cs ON cs.id = cc.source_id  
WHERE cs.user_id = $2
  AND (1 - (cc.embedding <=> $1)) > $3
ORDER BY similarity_score DESC
LIMIT $4;
```

**RAG API Implementation**
```typescript
// app/api/ai/chat/route.ts
export interface RAGRequest {
  query: string
  max_chunks: number
  threshold: number
  source_ids?: string[]
}

export interface RAGResponse {
  answer: string
  sources: Array<{
    chunk_text: string
    source_title: string
    page_number?: number
    similarity_score: number
  }>
  query: string
  response_time: number
}
```

**OpenAI Chat Integration**
```typescript
// Generate query embedding
// Search similar chunks
// Construct prompt with context
// Generate response with citations
// Return structured response
```

### Phase 4: Chat Interface (30 minutes)

**Enhanced Chat Component**
```typescript
// components/ai/rag-chat.tsx
interface RAGChatProps {
  subjectId?: string
  sourceIds?: string[]
}

// Features:
// - Query input with real-time suggestions
// - Source-cited responses
// - Conversation history
// - Source preview on click
// - Export conversation
```

**Chat Integration**
- Connect existing chat UI to RAG backend
- Display source citations with links
- Show similarity scores
- Allow filtering by subject/source

## API Specifications

### Text Processing API

**POST /api/content/process**
```typescript
{
  source_id: string
  force_reprocess?: boolean
}
```

**Response**
```typescript
{
  success: boolean
  jobs_created: string[]
  message: string
}
```

### Embeddings API

**POST /api/ai/embeddings**
```typescript
{
  source_id: string
  chunks: Array<{
    id: string
    text: string
  }>
}
```

**Response**
```typescript
{
  success: boolean
  embeddings_generated: number
  cost_estimate: number
  processing_time: number
}
```

### RAG Chat API

**POST /api/ai/chat**
```typescript
{
  query: string
  context?: {
    subject_ids?: string[]
    source_ids?: string[]
    conversation_id?: string
  }
  options?: {
    max_chunks: number
    similarity_threshold: number
    model: string
  }
}
```

**Response**
```typescript
{
  success: boolean
  answer: string
  sources: Array<{
    chunk_id: string
    chunk_text: string
    source_title: string
    source_id: string
    page_number?: number
    similarity_score: number
  }>
  conversation_id: string
  tokens_used: number
  response_time: number
  model_used: string
}
```

## Database Updates

### Processing Job Types
```sql
-- Add new job types to existing enum
ALTER TYPE job_type ADD VALUE 'text_processing';
ALTER TYPE job_type ADD VALUE 'embedding_batch';
```

### Conversation History
```sql
CREATE TABLE IF NOT EXISTS conversations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS conversation_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  sources JSONB DEFAULT '[]',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### RLS Policies
```sql
-- Conversations RLS
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversation_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own conversations" ON conversations
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can access own conversation messages" ON conversation_messages
  FOR ALL USING (
    auth.uid() IN (
      SELECT user_id FROM conversations WHERE conversations.id = conversation_messages.conversation_id
    )
  );
```

## Configuration Requirements

### Environment Variables
```bash
# OpenAI Configuration
OPENAI_API_KEY=sk-...
OPENAI_EMBEDDING_MODEL=text-embedding-3-small
OPENAI_CHAT_MODEL=gpt-4o-mini

# Anthropic Configuration (alternative)
ANTHROPIC_API_KEY=sk-ant-...

# Processing Configuration
MAX_CHUNK_SIZE=512
CHUNK_OVERLAP=50
SIMILARITY_THRESHOLD=0.7
MAX_SEARCH_RESULTS=10
```

### Feature Flags
```typescript
// lib/config/features.ts
export const FEATURES = {
  RAG_ENABLED: process.env.FEATURE_RAG_ENABLED === 'true',
  EMBEDDING_PROVIDER: process.env.EMBEDDING_PROVIDER || 'openai',
  CHAT_MODEL: process.env.CHAT_MODEL || 'gpt-4o-mini'
}
```

## Dependencies & Installation

### PDF Processing
```bash
npm install pdfjs-dist
npm install @types/pdfjs-dist
```

### AI APIs
```bash
npm install openai
npm install @anthropic-ai/sdk
```

### Text Processing
```bash
npm install tiktoken  # Token counting
npm install compromise  # NLP for sentence detection
```

## Error Handling Strategy

### PDF Processing Errors
- **Corrupted PDF**: Graceful failure with user message
- **Password-protected**: Detection and user guidance
- **Large files**: Memory management and timeouts
- **OCR fallback**: For scanned documents (future)

### Embedding Generation Errors
- **Rate limiting**: Exponential backoff and retry
- **API failures**: Fallback to different provider
- **Cost limits**: User quota management
- **Network issues**: Resumable processing

### Search & RAG Errors
- **No relevant content**: Helpful user guidance
- **Model failures**: Fallback models
- **Response quality**: Content validation
- **Citation accuracy**: Source verification

## Performance Optimization

### Text Processing
- Stream large PDFs for memory efficiency
- Parallel chunk processing where possible
- Smart caching of extracted text
- Background processing queue

### Embedding Generation
- Batch API calls for cost efficiency
- Async processing with job queue
- Progress reporting for long operations
- Intelligent retry logic

### Vector Search
- Optimized pgvector indexes
- Query result caching
- Similarity threshold tuning
- Search result ranking

## Security Considerations

### API Key Management
- Environment-based configuration
- Rotation support
- Usage monitoring
- Cost alerting

### Content Security
- User data isolation via RLS
- Secure prompt construction
- Response sanitization
- Source attribution verification

### Rate Limiting
- Per-user API quotas
- Processing job limits
- Search request throttling
- Cost budgeting

## Testing Strategy

### Unit Tests
- PDF text extraction accuracy
- Chunking algorithm effectiveness
- Embedding generation reliability
- Vector search precision

### Integration Tests
- End-to-end RAG pipeline
- Multi-user data isolation
- Error recovery scenarios
- Performance under load

### User Acceptance Tests
- Upload various PDF types
- Test question answering quality
- Verify source citations
- Measure response times

## Success Metrics

### Technical Metrics
- Text extraction accuracy > 95%
- Embedding generation < 30s for 10MB PDF
- Vector search response < 500ms
- RAG response generation < 5s

### Quality Metrics  
- Answer relevance > 80% user satisfaction
- Source citation accuracy > 95%
- Response coherence score > 4/5
- User engagement with sources > 60%

## Rollback Plan

If RAG implementation breaks existing functionality:
1. Disable RAG features with feature flags
2. Revert chat interface to simple mode
3. Maintain content upload functionality
4. Preserve all user data and processing

## Post-Implementation Tasks

### Monitoring Setup
- API usage tracking
- Response quality metrics
- User satisfaction surveys
- Cost monitoring dashboards

### Documentation
- User guide for AI features
- API documentation
- Troubleshooting guide
- Performance tuning guide

### Future Enhancements
- Multi-modal content support
- Advanced search filters
- Conversation management
- Study plan integration

---

**Implementation Priority:** HIGH - Core differentiator feature
**Dependencies:** OpenAI API key, PDF.js setup
**Risk Level:** MEDIUM - External API dependencies
**User Impact:** HIGH - Primary value proposition