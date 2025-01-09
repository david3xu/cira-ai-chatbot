-- Add relevance scoring functions and improvements

-- Create a scoring configuration table
CREATE TABLE IF NOT EXISTS scoring_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  domain_field TEXT NOT NULL UNIQUE,
  similarity_weight FLOAT DEFAULT 0.6,
  recency_weight FLOAT DEFAULT 0.2,
  popularity_weight FLOAT DEFAULT 0.2,
  min_similarity FLOAT DEFAULT 0.5,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create hybrid search function
CREATE OR REPLACE FUNCTION hybrid_search(
  query_text TEXT,
  query_embedding VECTOR(1024),
  match_count INT,
  full_text_weight FLOAT DEFAULT 1,
  semantic_weight FLOAT DEFAULT 1,
  rrf_k INT DEFAULT 50,
  in_domination_field TEXT DEFAULT 'Science'
)
RETURNS SETOF documents
LANGUAGE sql
AS $$
WITH full_text AS (
  SELECT
    document_id as id,
    ROW_NUMBER() OVER(ORDER BY ts_rank_cd(fts, websearch_to_tsquery(query_text)) DESC) AS rank_ix
  FROM
    document_chunks
  WHERE
    fts @@ websearch_to_tsquery(query_text)
    AND domination_field = in_domination_field
  ORDER BY rank_ix
  LIMIT LEAST(match_count, 30) * 2
),
semantic AS (
  SELECT
    document_id as id,
    ROW_NUMBER() OVER(ORDER BY content_vector <#> query_embedding) AS rank_ix
  FROM
    document_chunks
  WHERE
    domination_field = in_domination_field
  ORDER BY rank_ix
  LIMIT LEAST(match_count, 30) * 2
)
SELECT
  documents.*
FROM
  full_text
  FULL OUTER JOIN semantic
    ON full_text.id = semantic.id
  JOIN documents
    ON COALESCE(full_text.id, semantic.id) = documents.id
ORDER BY
  COALESCE(1.0 / (rrf_k + full_text.rank_ix), 0.0) * full_text_weight +
  COALESCE(1.0 / (rrf_k + semantic.rank_ix), 0.0) * semantic_weight DESC
LIMIT
  LEAST(match_count, 30);
$$;

-- Add document stats
ALTER TABLE documents ADD COLUMN IF NOT EXISTS view_count INTEGER DEFAULT 0;
ALTER TABLE documents ADD COLUMN IF NOT EXISTS relevance_score FLOAT DEFAULT 0;

-- Add function to update scoring config
CREATE OR REPLACE FUNCTION update_scoring_config(
  p_domain_field TEXT,
  p_similarity_weight FLOAT DEFAULT NULL,
  p_recency_weight FLOAT DEFAULT NULL,
  p_popularity_weight FLOAT DEFAULT NULL,
  p_min_similarity FLOAT DEFAULT NULL
) RETURNS scoring_config
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_config scoring_config;
BEGIN
  INSERT INTO scoring_config (
    domain_field,
    similarity_weight,
    recency_weight,
    popularity_weight,
    min_similarity
  ) VALUES (
    p_domain_field,
    COALESCE(p_similarity_weight, 0.6),
    COALESCE(p_recency_weight, 0.2),
    COALESCE(p_popularity_weight, 0.2),
    COALESCE(p_min_similarity, 0.5)
  )
  ON CONFLICT (domain_field) DO UPDATE
  SET
    similarity_weight = COALESCE(p_similarity_weight, scoring_config.similarity_weight),
    recency_weight = COALESCE(p_recency_weight, scoring_config.recency_weight),
    popularity_weight = COALESCE(p_popularity_weight, scoring_config.popularity_weight),
    min_similarity = COALESCE(p_min_similarity, scoring_config.min_similarity),
    updated_at = now()
  RETURNING * INTO v_config;

  RETURN v_config;
END;
$$;

COMMENT ON FUNCTION update_scoring_config IS 'Updates scoring configuration for a specific domain field';