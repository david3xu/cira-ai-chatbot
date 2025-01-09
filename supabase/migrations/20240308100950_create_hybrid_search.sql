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
WITH ranked_chunks AS (
  SELECT
    dc.document_id,
    ts_rank_cd(dc.fts, websearch_to_tsquery(query_text)) as text_rank,
    dc.content_vector <#> query_embedding as semantic_distance
  FROM
    document_chunks dc
  WHERE
    dc.domination_field = in_domination_field
    AND (
      dc.fts @@ websearch_to_tsquery(query_text)
      OR true  -- Include all for semantic search
    )
),
full_text AS (
  SELECT
    document_id as id,
    ROW_NUMBER() OVER (ORDER BY MAX(text_rank) DESC) as rank_ix
  FROM
    ranked_chunks
  GROUP BY
    document_id
  ORDER BY rank_ix
  LIMIT LEAST(match_count, 30) * 2
),
semantic AS (
  SELECT
    document_id as id,
    ROW_NUMBER() OVER (ORDER BY MIN(semantic_distance)) as rank_ix
  FROM
    ranked_chunks
  GROUP BY
    document_id
  ORDER BY rank_ix
  LIMIT LEAST(match_count, 30) * 2
)
SELECT
  d.*
FROM
  full_text
  FULL OUTER JOIN semantic
    ON full_text.id = semantic.id
  JOIN documents d
    ON COALESCE(full_text.id, semantic.id) = d.id
ORDER BY
  COALESCE(1.0 / (rrf_k + full_text.rank_ix), 0.0) * full_text_weight +
  COALESCE(1.0 / (rrf_k + semantic.rank_ix), 0.0) * semantic_weight DESC
LIMIT
  LEAST(match_count, 30);
$$;

-- Add function comment
COMMENT ON FUNCTION hybrid_search IS 'Performs hybrid search combining full-text and semantic similarity';