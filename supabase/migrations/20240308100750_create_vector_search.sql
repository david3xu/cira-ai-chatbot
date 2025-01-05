-- Enable vector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- Create documents table with vector search
CREATE TABLE IF NOT EXISTS documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content TEXT NOT NULL,
  content_vector vector(1536), -- OpenAI embedding dimension
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create GiST index for vector similarity search
CREATE INDEX IF NOT EXISTS documents_vector_idx ON documents 
USING ivfflat (content_vector vector_cosine_ops)
WITH (lists = 100);

-- Function to match documents by similarity
CREATE OR REPLACE FUNCTION match_documents(
  p_query TEXT,
  p_domain_field TEXT DEFAULT 'general',
  p_match_limit INT DEFAULT 3,
  p_min_similarity FLOAT DEFAULT 0.5
) RETURNS TABLE (
  content TEXT,
  score FLOAT,
  source JSONB
) LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  RETURN QUERY
  SELECT 
    d.content,
    1 - (d.content_vector <=> q.query_vector) as similarity,
    jsonb_build_object(
      'title', d.metadata->>'title',
      'url', d.metadata->>'url'
    ) as source
  FROM 
    documents d,
    get_embedding(p_query) q
  WHERE 
    d.metadata->>'domain_field' = p_domain_field
    AND 1 - (d.content_vector <=> q.query_vector) > p_min_similarity
  ORDER BY 
    d.content_vector <=> q.query_vector
  LIMIT p_match_limit;
END;
$$;

-- Function to index new documents
CREATE OR REPLACE FUNCTION index_document(
  p_content TEXT,
  p_metadata JSONB DEFAULT '{}'
) RETURNS UUID LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_id UUID;
BEGIN
  INSERT INTO documents (content, content_vector, metadata)
  VALUES (
    p_content,
    (SELECT embedding FROM get_embedding(p_content)),
    p_metadata
  )
  RETURNING id INTO v_id;
  
  RETURN v_id;
END;
$$;

-- Helper function to get embeddings (implement with your embedding provider)
CREATE OR REPLACE FUNCTION get_embedding(text) 
RETURNS vector 
LANGUAGE plpgsql STABLE AS $$
BEGIN
  -- Implementation depends on your embedding provider
  -- This is a placeholder
  RETURN NULL;
END;
$$; 