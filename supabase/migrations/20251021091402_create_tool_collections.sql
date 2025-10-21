/*
  # Create Tool Collections Feature

  1. New Tables
    - `tool_collections`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references user_profiles)
      - `name` (text, collection name)
      - `description` (text, nullable)
      - `slug` (text, unique, for sharing)
      - `is_public` (boolean, whether collection is publicly shareable)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

    - `collection_tools`
      - `id` (uuid, primary key)
      - `collection_id` (uuid, references tool_collections)
      - `tool_id` (uuid, references ai_tools)
      - `position` (integer, for ordering tools in collection)
      - `created_at` (timestamptz)
      - Unique constraint on (collection_id, tool_id)

  2. Security
    - Enable RLS on both tables
    - Users can view their own collections
    - Users can view public collections from others
    - Users can create/update/delete their own collections
    - Collection tools inherit collection permissions

  3. Performance
    - Add indexes on user_id, slug, collection_id, and tool_id
*/

-- Create tool_collections table
CREATE TABLE IF NOT EXISTS tool_collections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text DEFAULT '',
  slug text UNIQUE NOT NULL,
  is_public boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create collection_tools table
CREATE TABLE IF NOT EXISTS collection_tools (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  collection_id uuid NOT NULL REFERENCES tool_collections(id) ON DELETE CASCADE,
  tool_id uuid NOT NULL REFERENCES ai_tools(id) ON DELETE CASCADE,
  position integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  UNIQUE(collection_id, tool_id)
);

-- Enable RLS
ALTER TABLE tool_collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE collection_tools ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own collections" ON tool_collections;
DROP POLICY IF EXISTS "Users can view public collections" ON tool_collections;
DROP POLICY IF EXISTS "Users can create own collections" ON tool_collections;
DROP POLICY IF EXISTS "Users can update own collections" ON tool_collections;
DROP POLICY IF EXISTS "Users can delete own collections" ON tool_collections;
DROP POLICY IF EXISTS "Users can view collection tools if they can view collection" ON collection_tools;
DROP POLICY IF EXISTS "Users can insert tools to own collections" ON collection_tools;
DROP POLICY IF EXISTS "Users can update tools in own collections" ON collection_tools;
DROP POLICY IF EXISTS "Users can delete tools from own collections" ON collection_tools;

-- Policies for tool_collections
CREATE POLICY "Users can view own collections"
  ON tool_collections FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view public collections"
  ON tool_collections FOR SELECT
  TO authenticated, anon
  USING (is_public = true);

CREATE POLICY "Users can create own collections"
  ON tool_collections FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own collections"
  ON tool_collections FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own collections"
  ON tool_collections FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Policies for collection_tools
CREATE POLICY "Users can view collection tools if they can view collection"
  ON collection_tools FOR SELECT
  TO authenticated, anon
  USING (
    EXISTS (
      SELECT 1 FROM tool_collections
      WHERE tool_collections.id = collection_tools.collection_id
      AND (tool_collections.user_id = auth.uid() OR tool_collections.is_public = true)
    )
  );

CREATE POLICY "Users can insert tools to own collections"
  ON collection_tools FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM tool_collections
      WHERE tool_collections.id = collection_tools.collection_id
      AND tool_collections.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update tools in own collections"
  ON collection_tools FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM tool_collections
      WHERE tool_collections.id = collection_tools.collection_id
      AND tool_collections.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM tool_collections
      WHERE tool_collections.id = collection_tools.collection_id
      AND tool_collections.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete tools from own collections"
  ON collection_tools FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM tool_collections
      WHERE tool_collections.id = collection_tools.collection_id
      AND tool_collections.user_id = auth.uid()
    )
  );

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_tool_collections_user_id ON tool_collections(user_id);
CREATE INDEX IF NOT EXISTS idx_tool_collections_slug ON tool_collections(slug);
CREATE INDEX IF NOT EXISTS idx_tool_collections_is_public ON tool_collections(is_public);
CREATE INDEX IF NOT EXISTS idx_collection_tools_collection_id ON collection_tools(collection_id);
CREATE INDEX IF NOT EXISTS idx_collection_tools_tool_id ON collection_tools(tool_id);
CREATE INDEX IF NOT EXISTS idx_collection_tools_position ON collection_tools(collection_id, position);

-- Function to update updated_at timestamp on tool_collections
DROP TRIGGER IF EXISTS on_tool_collections_updated ON tool_collections;
CREATE TRIGGER on_tool_collections_updated
  BEFORE UPDATE ON tool_collections
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
