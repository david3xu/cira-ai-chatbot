-- Drop existing versions
DROP FUNCTION IF EXISTS hybrid_search(text, vector(1024), int, float, float, int);
DROP FUNCTION IF EXISTS hybrid_search(text, vector(1024), int, float, float, int, text, float);

-- Create new function
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
    id, 
    ROW_NUMBER() OVER(ORDER BY ts_rank_cd(fts, websearch_to_tsquery(query_text)) DESC) AS rank_ix 
  FROM 
    documents
  WHERE 
    fts @@ websearch_to_tsquery(query_text)
    AND domination_field = in_domination_field
  ORDER BY rank_ix
  LIMIT LEAST(match_count, 30) * 2
),
semantic AS (
  SELECT 
    id,
    ROW_NUMBER() OVER(ORDER BY embedding <#> query_embedding) AS rank_ix
  FROM
    documents
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