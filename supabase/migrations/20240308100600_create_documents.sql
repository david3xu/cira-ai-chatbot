-- Enable vector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- Create documents table
CREATE TABLE documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source TEXT,
  source_id TEXT,
  content TEXT NOT NULL,
  content_vector vector(1024),
  document_id TEXT,
  author TEXT,
  url TEXT,
  domination_field TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  fts tsvector GENERATED ALWAYS AS (to_tsvector('english', content)) STORED
);

-- Create indexes
CREATE INDEX IF NOT EXISTS ix_documents_fts ON documents USING gin(fts);
CREATE INDEX IF NOT EXISTS ix_documents_vector_idx ON documents 
USING ivfflat (content_vector vector_cosine_ops)
WITH (lists = 100);

-- Enable RLS
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Enable read access for all users" ON documents
    FOR SELECT USING (true);
    
CREATE POLICY "Enable insert access for all users" ON documents
    FOR INSERT WITH CHECK (true);