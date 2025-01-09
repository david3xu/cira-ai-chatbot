-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Enable bucket creation for authenticated users" ON storage.buckets;
DROP POLICY IF EXISTS "Enable bucket read for authenticated users" ON storage.buckets;
DROP POLICY IF EXISTS "Enable object read for authenticated users" ON storage.objects;
DROP POLICY IF EXISTS "Enable object insert for authenticated users" ON storage.objects;
DROP POLICY IF EXISTS "Enable object update for authenticated users" ON storage.objects;
DROP POLICY IF EXISTS "Enable object delete for authenticated users" ON storage.objects;

-- Enable RLS for storage.buckets
ALTER TABLE storage.buckets ENABLE ROW LEVEL SECURITY;

-- Create policies for storage.buckets
CREATE POLICY "Enable public access to buckets" ON storage.buckets
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Enable RLS for storage.objects
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Create policies for storage.objects
CREATE POLICY "Enable public access to objects" ON storage.objects
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Grant necessary permissions
GRANT ALL ON storage.buckets TO anon;
GRANT ALL ON storage.objects TO anon;
GRANT ALL ON storage.buckets TO service_role;
GRANT ALL ON storage.objects TO service_role; 