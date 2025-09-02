-- Content ingestion tables for PDF processing and RAG

-- Content Sources table
CREATE TABLE IF NOT EXISTS content_sources (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    subject_id UUID REFERENCES subjects(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    source_type TEXT NOT NULL CHECK (source_type IN ('pdf', 'url', 'manual', 'youtube')),
    file_path TEXT,
    url TEXT,
    status TEXT DEFAULT 'processing' CHECK (status IN ('processing', 'completed', 'failed')),
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Content Chunks table
CREATE TABLE IF NOT EXISTS content_chunks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    source_id UUID NOT NULL REFERENCES content_sources(id) ON DELETE CASCADE,
    chunk_text TEXT NOT NULL,
    chunk_index INTEGER NOT NULL,
    page_number INTEGER,
    embedding VECTOR(1536), -- OpenAI text-embedding-3-small dimension
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Processing Jobs table
CREATE TABLE IF NOT EXISTS processing_jobs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    source_id UUID NOT NULL REFERENCES content_sources(id) ON DELETE CASCADE,
    job_type TEXT NOT NULL CHECK (job_type IN ('text_extraction', 'chunking', 'embedding')),
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
    progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
    error_message TEXT,
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_content_sources_user_id ON content_sources(user_id);
CREATE INDEX IF NOT EXISTS idx_content_sources_subject_id ON content_sources(subject_id);
CREATE INDEX IF NOT EXISTS idx_content_sources_status ON content_sources(status);
CREATE INDEX IF NOT EXISTS idx_content_chunks_source_id ON content_chunks(source_id);
CREATE INDEX IF NOT EXISTS idx_content_chunks_chunk_index ON content_chunks(chunk_index);
CREATE INDEX IF NOT EXISTS idx_processing_jobs_source_id ON processing_jobs(source_id);
CREATE INDEX IF NOT EXISTS idx_processing_jobs_status ON processing_jobs(status);

-- Vector similarity search index
CREATE INDEX IF NOT EXISTS idx_content_chunks_embedding ON content_chunks USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);

-- Enable RLS on all content tables
ALTER TABLE content_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_chunks ENABLE ROW LEVEL SECURITY;  
ALTER TABLE processing_jobs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for content_sources
CREATE POLICY "Users can manage own content sources" ON content_sources
    FOR ALL USING (auth.uid() = user_id);

-- RLS Policies for content_chunks
CREATE POLICY "Users can access chunks of own sources" ON content_chunks
    FOR ALL USING (
        auth.uid() IN (
            SELECT user_id FROM content_sources WHERE content_sources.id = content_chunks.source_id
        )
    );

-- RLS Policies for processing_jobs
CREATE POLICY "Users can view own processing jobs" ON processing_jobs
    FOR ALL USING (
        auth.uid() IN (
            SELECT user_id FROM content_sources WHERE content_sources.id = processing_jobs.source_id
        )
    );

-- Update trigger for content_sources
CREATE OR REPLACE FUNCTION update_content_sources_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_content_sources_updated_at 
    BEFORE UPDATE ON content_sources
    FOR EACH ROW EXECUTE FUNCTION update_content_sources_updated_at();

-- Function to update processing job status and progress
CREATE OR REPLACE FUNCTION update_processing_job_status(
    job_id UUID,
    new_status TEXT,
    new_progress INTEGER DEFAULT NULL,
    error_msg TEXT DEFAULT NULL
)
RETURNS VOID AS $$
BEGIN
    UPDATE processing_jobs 
    SET 
        status = new_status,
        progress = COALESCE(new_progress, progress),
        error_message = error_msg,
        started_at = CASE WHEN new_status = 'processing' AND started_at IS NULL THEN NOW() ELSE started_at END,
        completed_at = CASE WHEN new_status IN ('completed', 'failed') THEN NOW() ELSE NULL END
    WHERE id = job_id;
END;
$$ language 'plpgsql';

-- Function to create processing jobs for a content source
CREATE OR REPLACE FUNCTION create_processing_jobs(source_id UUID)
RETURNS VOID AS $$
BEGIN
    -- Create text extraction job
    INSERT INTO processing_jobs (source_id, job_type, status)
    VALUES (source_id, 'text_extraction', 'pending');
    
    -- Create chunking job
    INSERT INTO processing_jobs (source_id, job_type, status)
    VALUES (source_id, 'chunking', 'pending');
    
    -- Create embedding job  
    INSERT INTO processing_jobs (source_id, job_type, status)
    VALUES (source_id, 'embedding', 'pending');
END;
$$ language 'plpgsql';