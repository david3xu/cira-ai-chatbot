CREATE TABLE IF NOT EXISTS documents (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    source TEXT,
    source_id TEXT,
    content TEXT,
    document_id TEXT,
    author TEXT,
    url TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    embedding VECTOR(1024),
    domination_field TEXT NOT NULL,
    fts tsvector GENERATED ALWAYS AS (to_tsvector('english', content)) STORED
);

-- Indexes
CREATE INDEX IF NOT EXISTS ix_documents_domination_field ON documents USING gin (fts);
CREATE INDEX IF NOT EXISTS ix_documents_embedding ON documents USING ivfflat(embedding) WITH (lists=100);

-- RLS Setup
ALTER TABLE documents DISABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_policy" ON documents;
DROP POLICY IF EXISTS "insert_policy" ON documents;
DROP POLICY IF EXISTS "Enable read access for all users" ON documents;
DROP POLICY IF EXISTS "Enable insert access for all users" ON documents;

CREATE POLICY "select_policy" ON documents FOR SELECT USING (true);
CREATE POLICY "insert_policy" ON documents FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable read access for all users" ON documents
    FOR SELECT USING (true);

CREATE POLICY "Enable insert access for all users" ON documents
    FOR INSERT WITH CHECK (true);

ALTER TABLE documents ENABLE ROW LEVEL SECURITY; 