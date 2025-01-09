-- Enable vector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- Create documents table
CREATE TABLE IF NOT EXISTS documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT,
  content TEXT,
  url TEXT,
  source TEXT DEFAULT 'default',
  author TEXT DEFAULT 'default',
  domination_field TEXT DEFAULT 'NORMAL_CHAT',
  metadata JSONB DEFAULT '{}'::jsonb,
  status TEXT DEFAULT 'processing',
  content_type TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  fts tsvector GENERATED ALWAYS AS (to_tsvector('english', COALESCE(title, '') || ' ' || COALESCE(content, ''))) STORED
);

-- Create document_chunks table for storing document chunks
CREATE TABLE IF NOT EXISTS document_chunks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  document_id UUID REFERENCES documents(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  content_vector vector(1024),
  source TEXT DEFAULT 'default',
  author TEXT DEFAULT 'default',
  url TEXT,
  domination_field TEXT DEFAULT 'NORMAL_CHAT',
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  fts tsvector GENERATED ALWAYS AS (to_tsvector('english', content)) STORED
);

-- Add updated_at trigger for documents
CREATE TRIGGER set_documents_updated_at
  BEFORE UPDATE ON documents
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Add updated_at trigger for document_chunks
CREATE TRIGGER set_document_chunks_updated_at
  BEFORE UPDATE ON document_chunks
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_documents_domination_field ON documents(domination_field);
CREATE INDEX IF NOT EXISTS idx_documents_content_type ON documents(content_type);
CREATE INDEX IF NOT EXISTS idx_documents_fts ON documents USING gin(fts);

CREATE INDEX IF NOT EXISTS idx_document_chunks_document_id ON document_chunks(document_id);
CREATE INDEX IF NOT EXISTS idx_document_chunks_domination_field ON document_chunks(domination_field);
CREATE INDEX IF NOT EXISTS idx_document_chunks_fts ON document_chunks USING gin(fts);
CREATE INDEX IF NOT EXISTS idx_document_chunks_content_vector ON document_chunks USING ivfflat (content_vector vector_cosine_ops) WITH (lists = 100);

-- Enable RLS
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_chunks ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Enable read access for all users" ON documents
    FOR SELECT USING (true);
    
CREATE POLICY "Enable insert access for all users" ON documents
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable read access for all users" ON document_chunks
    FOR SELECT USING (true);
    
CREATE POLICY "Enable insert access for all users" ON document_chunks
    FOR INSERT WITH CHECK (true);