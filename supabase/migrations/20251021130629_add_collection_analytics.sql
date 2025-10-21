/*
  # Add Collection Analytics

  1. Modifications to Tables
    - Add analytics columns to `tool_collections` table:
      - `views` (integer, default 0) - Track how many times a collection is viewed
      - `shares` (integer, default 0) - Track how many times a collection link is shared

  2. New Tables
    - `collection_views`
      - `id` (uuid, primary key)
      - `collection_id` (uuid, references tool_collections)
      - `viewer_ip` (text, nullable) - For anonymous tracking
      - `viewer_user_id` (uuid, nullable, references user_profiles) - For authenticated users
      - `viewed_at` (timestamptz)
      
    - `collection_shares`
      - `id` (uuid, primary key)
      - `collection_id` (uuid, references tool_collections)
      - `shared_by_user_id` (uuid, nullable, references user_profiles)
      - `shared_at` (timestamptz)

  3. Security
    - Enable RLS on new tables
    - Allow anyone to insert views (for tracking)
    - Only collection owners can view analytics details
    - Public read access to aggregate counts

  4. Performance
    - Add indexes on collection_id for both analytics tables
    - Add indexes on timestamps for time-based queries
*/

-- Add analytics columns to tool_collections
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'tool_collections' AND column_name = 'views'
  ) THEN
    ALTER TABLE tool_collections ADD COLUMN views integer DEFAULT 0;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'tool_collections' AND column_name = 'shares'
  ) THEN
    ALTER TABLE tool_collections ADD COLUMN shares integer DEFAULT 0;
  END IF;
END $$;

-- Create collection_views table
CREATE TABLE IF NOT EXISTS collection_views (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  collection_id uuid NOT NULL REFERENCES tool_collections(id) ON DELETE CASCADE,
  viewer_ip text,
  viewer_user_id uuid REFERENCES user_profiles(id) ON DELETE SET NULL,
  viewed_at timestamptz DEFAULT now()
);

-- Create collection_shares table
CREATE TABLE IF NOT EXISTS collection_shares (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  collection_id uuid NOT NULL REFERENCES tool_collections(id) ON DELETE CASCADE,
  shared_by_user_id uuid REFERENCES user_profiles(id) ON DELETE SET NULL,
  shared_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE collection_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE collection_shares ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Anyone can insert collection views" ON collection_views;
DROP POLICY IF EXISTS "Collection owners can view analytics" ON collection_views;
DROP POLICY IF EXISTS "Anyone can insert collection shares" ON collection_shares;
DROP POLICY IF EXISTS "Collection owners can view share analytics" ON collection_shares;

-- Policies for collection_views
CREATE POLICY "Anyone can insert collection views"
  ON collection_views FOR INSERT
  TO authenticated, anon
  WITH CHECK (true);

CREATE POLICY "Collection owners can view analytics"
  ON collection_views FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM tool_collections
      WHERE tool_collections.id = collection_views.collection_id
      AND tool_collections.user_id = auth.uid()
    )
  );

-- Policies for collection_shares
CREATE POLICY "Anyone can insert collection shares"
  ON collection_shares FOR INSERT
  TO authenticated, anon
  WITH CHECK (true);

CREATE POLICY "Collection owners can view share analytics"
  ON collection_shares FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM tool_collections
      WHERE tool_collections.id = collection_shares.collection_id
      AND tool_collections.user_id = auth.uid()
    )
  );

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_collection_views_collection_id ON collection_views(collection_id);
CREATE INDEX IF NOT EXISTS idx_collection_views_viewed_at ON collection_views(viewed_at);
CREATE INDEX IF NOT EXISTS idx_collection_shares_collection_id ON collection_shares(collection_id);
CREATE INDEX IF NOT EXISTS idx_collection_shares_shared_at ON collection_shares(shared_at);

-- Function to increment collection views count
CREATE OR REPLACE FUNCTION increment_collection_views()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE tool_collections
  SET views = views + 1
  WHERE id = NEW.collection_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to increment collection shares count
CREATE OR REPLACE FUNCTION increment_collection_shares()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE tool_collections
  SET shares = shares + 1
  WHERE id = NEW.collection_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers
DROP TRIGGER IF EXISTS on_collection_view_inserted ON collection_views;
CREATE TRIGGER on_collection_view_inserted
  AFTER INSERT ON collection_views
  FOR EACH ROW EXECUTE FUNCTION increment_collection_views();

DROP TRIGGER IF EXISTS on_collection_share_inserted ON collection_shares;
CREATE TRIGGER on_collection_share_inserted
  AFTER INSERT ON collection_shares
  FOR EACH ROW EXECUTE FUNCTION increment_collection_shares();
