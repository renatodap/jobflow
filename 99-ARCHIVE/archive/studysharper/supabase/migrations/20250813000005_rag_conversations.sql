-- RAG Conversations and Vector Search

-- Conversations table
CREATE TABLE IF NOT EXISTS conversations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Conversation messages table
CREATE TABLE IF NOT EXISTS conversation_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
    content TEXT NOT NULL,
    sources JSONB DEFAULT '[]',
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_conversations_user_id ON conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_conversations_created_at ON conversations(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_conversation_messages_conversation_id ON conversation_messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_conversation_messages_created_at ON conversation_messages(created_at);

-- Enable RLS
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversation_messages ENABLE ROW LEVEL SECURITY;

-- RLS Policies
DROP POLICY IF EXISTS "Users can manage own conversations" ON conversations;
CREATE POLICY "Users can manage own conversations" ON conversations
    FOR ALL USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can access own conversation messages" ON conversation_messages;
CREATE POLICY "Users can access own conversation messages" ON conversation_messages
    FOR ALL USING (
        auth.uid() IN (
            SELECT user_id FROM conversations WHERE conversations.id = conversation_messages.conversation_id
        )
    );

-- Vector similarity search function
CREATE OR REPLACE FUNCTION match_content_chunks(
    query_embedding VECTOR(1536),
    match_threshold FLOAT,
    match_count INT,
    user_id UUID
)
RETURNS TABLE (
    chunk_id UUID,
    chunk_text TEXT,
    chunk_index INT,
    page_number INT,
    source_id UUID,
    source_title TEXT,
    similarity_score FLOAT
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        cc.id as chunk_id,
        cc.chunk_text,
        cc.chunk_index,
        cc.page_number,
        cc.source_id,
        cs.title as source_title,
        1 - (cc.embedding <=> query_embedding) as similarity_score
    FROM content_chunks cc
    JOIN content_sources cs ON cs.id = cc.source_id
    WHERE 
        cs.user_id = match_content_chunks.user_id
        AND cc.embedding IS NOT NULL
        AND (1 - (cc.embedding <=> query_embedding)) > match_threshold
    ORDER BY cc.embedding <=> query_embedding
    LIMIT match_count;
END;
$$;

-- Alternative search function with source filtering
CREATE OR REPLACE FUNCTION match_content_chunks_filtered(
    query_embedding VECTOR(1536),
    match_threshold FLOAT,
    match_count INT,
    user_id UUID,
    source_ids UUID[]
)
RETURNS TABLE (
    chunk_id UUID,
    chunk_text TEXT,
    chunk_index INT,
    page_number INT,
    source_id UUID,
    source_title TEXT,
    similarity_score FLOAT
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        cc.id as chunk_id,
        cc.chunk_text,
        cc.chunk_index,
        cc.page_number,
        cc.source_id,
        cs.title as source_title,
        1 - (cc.embedding <=> query_embedding) as similarity_score
    FROM content_chunks cc
    JOIN content_sources cs ON cs.id = cc.source_id
    WHERE 
        cs.user_id = match_content_chunks_filtered.user_id
        AND cc.embedding IS NOT NULL
        AND (source_ids IS NULL OR cc.source_id = ANY(source_ids))
        AND (1 - (cc.embedding <=> query_embedding)) > match_threshold
    ORDER BY cc.embedding <=> query_embedding
    LIMIT match_count;
END;
$$;

-- Update trigger for conversations
CREATE OR REPLACE FUNCTION update_conversations_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_conversations_updated_at ON conversations;
CREATE TRIGGER update_conversations_updated_at 
    BEFORE UPDATE ON conversations
    FOR EACH ROW EXECUTE FUNCTION update_conversations_updated_at();

-- Grant execute permissions on functions
GRANT EXECUTE ON FUNCTION match_content_chunks TO authenticated;
GRANT EXECUTE ON FUNCTION match_content_chunks_filtered TO authenticated;