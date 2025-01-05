-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS vector;
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS http;

-- Create a function to get embeddings from OpenAI
CREATE OR REPLACE FUNCTION get_embedding(input_text TEXT)
RETURNS vector
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
AS $$
DECLARE
  embedding_vector vector(1024);
  api_response JSONB;
  api_key TEXT := 'sk-proj-01H234567890123456789012345678901';
BEGIN
  -- Get API key from secure storage
  SELECT current_setting('app.openai_key', TRUE) INTO api_key;
  
  -- Call OpenAI API
  SELECT content::jsonb INTO api_response
  FROM http((
    'POST',
    'http://localhost:11434/v1/embeddings',
    ARRAY[
      ('Authorization', 'Bearer ' || api_key),
      ('Content-Type', 'application/json')
    ],
    'application/json',
    jsonb_build_object(
      'model', 'mxbai-embed-large:latest',
      'input', input_text
    )::text
  )::http_request);

  -- Extract embedding from response
  embedding_vector := (
    SELECT array_to_vector(
      ARRAY(
        SELECT jsonb_array_elements_text(
          api_response->'data'->0->'embedding'
        )::float
      )
    )
  );

  RETURN embedding_vector;
EXCEPTION WHEN OTHERS THEN
  -- Log error and return null
  RAISE WARNING 'Error getting embedding: %', SQLERRM;
  RETURN NULL;
END;
$$;

-- Add caching table for embeddings
CREATE TABLE IF NOT EXISTS embedding_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  input_text TEXT NOT NULL,
  embedding vector(1536) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  last_accessed TIMESTAMPTZ DEFAULT now(),
  access_count INTEGER DEFAULT 1,
  CONSTRAINT unique_input UNIQUE (input_text)
);

-- Create index on frequently accessed embeddings
CREATE INDEX IF NOT EXISTS idx_embedding_cache_access 
ON embedding_cache(access_count DESC);

-- Function to get cached embedding or compute new one
CREATE OR REPLACE FUNCTION get_cached_embedding(input_text TEXT)
RETURNS vector
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
AS $$
DECLARE
  cached_vector vector(1536);
  new_vector vector(1536);
BEGIN
  -- Try to get from cache
  SELECT embedding, 
         access_count + 1,
         now()
    INTO cached_vector
    FROM embedding_cache
    WHERE embedding_cache.input_text = get_cached_embedding.input_text
    FOR UPDATE;
    
  IF FOUND THEN
    -- Update access stats
    UPDATE embedding_cache 
    SET access_count = access_count + 1,
        last_accessed = now()
    WHERE input_text = get_cached_embedding.input_text;
    
    RETURN cached_vector;
  END IF;

  -- Not found in cache, compute new embedding
  SELECT get_embedding(input_text) INTO new_vector;
  
  -- Cache the result
  INSERT INTO embedding_cache (input_text, embedding)
  VALUES (input_text, new_vector)
  ON CONFLICT (input_text) DO UPDATE
  SET embedding = new_vector,
      access_count = embedding_cache.access_count + 1,
      last_accessed = now();
  
  RETURN new_vector;
END;
$$;

-- Function to cleanup old cache entries
CREATE OR REPLACE FUNCTION cleanup_embedding_cache(
  max_age_days INTEGER DEFAULT 30,
  min_access_count INTEGER DEFAULT 5
)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM embedding_cache
  WHERE (
    last_accessed < now() - (max_age_days || ' days')::INTERVAL
    AND access_count < min_access_count
  )
  RETURNING COUNT(*) INTO deleted_count;
  
  RETURN deleted_count;
END;
$$;

-- Only schedule cleanup if pg_cron is available
DO $do$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_extension WHERE extname = 'pg_cron'
  ) THEN
    PERFORM cron.schedule(
      'cleanup-embeddings',
      '0 0 * * *',
      'SELECT cleanup_embedding_cache(30, 5)'
    );
  END IF;
END
$do$; 