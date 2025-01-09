-- Enable vector extension
CREATE EXTENSION IF NOT EXISTS vector;

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
    document_chunks d,
    get_embedding(p_query) q
  WHERE 
    d.domination_field = p_domain_field
    AND 1 - (d.content_vector <=> q.query_vector) > p_min_similarity
  ORDER BY 
    d.content_vector <=> q.query_vector
  LIMIT p_match_limit;
END;
$$;

-- Function to index new document chunks
CREATE OR REPLACE FUNCTION index_document_chunk(
  p_content TEXT,
  p_document_id UUID,
  p_metadata JSONB DEFAULT '{}'
) RETURNS UUID LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_id UUID;
BEGIN
  INSERT INTO document_chunks (content, content_vector, document_id, metadata)
  VALUES (
    p_content,
    (SELECT embedding FROM get_embedding(p_content)),
    p_document_id,
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