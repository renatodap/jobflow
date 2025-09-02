// Content Ingestion Types

export interface ContentSource {
  id: string
  user_id: string
  subject_id?: string
  title: string
  source_type: 'pdf' | 'url' | 'manual' | 'youtube'
  file_path?: string
  url?: string
  status: 'processing' | 'completed' | 'failed'
  metadata: Record<string, any>
  created_at: string
  updated_at: string
}

export interface ContentChunk {
  id: string
  source_id: string
  chunk_text: string
  chunk_index: number
  page_number?: number
  embedding?: number[]
  metadata: Record<string, any>
  created_at: string
}

export interface ProcessingJob {
  id: string
  source_id: string
  job_type: 'text_extraction' | 'chunking' | 'embedding'
  status: 'pending' | 'processing' | 'completed' | 'failed'
  progress: number
  error_message?: string
  started_at?: string
  completed_at?: string
  created_at: string
}

// Form types for creating content
export interface CreateContentSourceData {
  subject_id?: string
  title: string
  source_type: ContentSource['source_type']
  file_path?: string
  url?: string
  metadata?: Record<string, any>
}

export interface UploadProgress {
  loaded: number
  total: number
  percentage: number
}

export interface ProcessingProgress {
  source_id: string
  current_step: string
  progress: number
  total_steps: number
  estimated_time_remaining?: number
  error?: string
}

// PDF processing types
export interface PDFExtraction {
  text: string
  pages: PDFPage[]
  metadata: PDFMetadata
}

export interface PDFPage {
  pageNumber: number
  text: string
}

export interface PDFMetadata {
  title?: string
  author?: string
  subject?: string
  keywords?: string[]
  creationDate?: Date
  pageCount: number
  fileSize: number
}

// Text chunking types
export interface TextChunk {
  text: string
  startIndex: number
  endIndex: number
  pageNumber?: number
}

export interface ChunkingOptions {
  maxTokens: number
  overlap: number
  preserveSentences: boolean
}

export interface ChunkingResult {
  chunks: TextChunk[]
  totalChunks: number
}

// Embedding types
export interface EmbeddingRequest {
  chunks: string[]
  source_id: string
}

export interface EmbeddingResponse {
  embeddings: number[][]
  source_id: string
  success: boolean
  error?: string
}

// Search types
export interface ContentSearchQuery {
  query: string
  subject_ids?: string[]
  source_types?: ContentSource['source_type'][]
  limit?: number
  threshold?: number
}

export interface ContentSearchResult {
  chunk: ContentChunk
  source: ContentSource
  similarity_score: number
  page_number?: number
}

// Extended types with relationships
export interface ContentSourceWithChunks extends ContentSource {
  chunks: ContentChunk[]
  processing_jobs: ProcessingJob[]
}

export interface ContentSourceWithStats extends ContentSource {
  chunk_count: number
  total_tokens: number
  processing_progress: number
  last_processed: string
}

// API response types
export interface ContentAPIResponse<T> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface ContentListResponse {
  sources: ContentSourceWithStats[]
  total: number
  page: number
  limit: number
}

export interface ContentSearchResponse {
  results: ContentSearchResult[]
  total: number
  query: string
  search_time: number
}

// File upload types
export interface FileUploadOptions {
  maxSize: number // in bytes
  allowedTypes: string[]
  destination: string
}

export interface UploadResponse {
  success: boolean
  file_path?: string
  source_id?: string
  error?: string
}

// Processing status types
export interface ProcessingStatus {
  source_id: string
  overall_status: ContentSource['status']
  current_job?: ProcessingJob
  jobs: ProcessingJob[]
  progress_percentage: number
  estimated_completion?: Date
}

// Batch operation types
export interface BatchDeleteRequest {
  source_ids: string[]
}

export interface BatchProcessRequest {
  source_ids: string[]
  force_reprocess?: boolean
}

export interface BatchOperationResponse {
  success: boolean
  processed: number
  failed: number
  errors: Array<{ source_id: string; error: string }>
}

// Analytics types
export interface ContentAnalytics {
  total_sources: number
  total_chunks: number
  storage_used: number // in bytes
  processing_success_rate: number
  average_processing_time: number // in seconds
  most_active_subjects: Array<{
    subject_id: string
    subject_name: string
    source_count: number
  }>
}

export interface ContentUsageStats {
  uploads_this_month: number
  searches_this_month: number
  storage_limit: number
  storage_used: number
  processing_queue_length: number
}