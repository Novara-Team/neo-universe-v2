/*
  # Add Collection Remix/Fork Feature

  1. New Columns
    - Add `forked_from` column to `tool_collections` to track original collection
    - Add `fork_count` column to track how many times a collection has been remixed

  2. New Function
    - `remix_collection` - Function to create a copy of another user's collection

  3. Security
    - Users can only remix public collections
    - Function copies all tools from the original collection

  4. Notes
    - Remixing creates a new collection with all the tools from the original
    - The new collection is owned by the user who remixed it
    - A reference to the original collection is maintained
*/

-- Add columns to tool_collections if they don't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'tool_collections' 
    AND column_name = 'forked_from'
  ) THEN
    ALTER TABLE tool_collections 
    ADD COLUMN forked_from uuid REFERENCES tool_collections(id) ON DELETE SET NULL;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'tool_collections' 
    AND column_name = 'fork_count'
  ) THEN
    ALTER TABLE tool_collections 
    ADD COLUMN fork_count integer DEFAULT 0;
  END IF;
END $$;

-- Function to remix/fork a collection
CREATE OR REPLACE FUNCTION remix_collection(
  original_collection_id uuid,
  new_user_id uuid,
  new_name text,
  new_description text DEFAULT NULL
)
RETURNS uuid AS $$
DECLARE
  original_collection RECORD;
  new_collection_id uuid;
  tool_record RECORD;
BEGIN
  -- Get the original collection
  SELECT * INTO original_collection
  FROM tool_collections
  WHERE id = original_collection_id
  AND is_public = true;

  -- Check if collection exists and is public
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Collection not found or is not public';
  END IF;

  -- Create new collection
  INSERT INTO tool_collections (
    user_id,
    name,
    description,
    slug,
    is_public,
    forked_from
  ) VALUES (
    new_user_id,
    new_name,
    COALESCE(new_description, original_collection.description),
    lower(regexp_replace(new_name, '[^a-zA-Z0-9]+', '-', 'g')) || '-' || substring(gen_random_uuid()::text, 1, 8),
    false,
    original_collection_id
  )
  RETURNING id INTO new_collection_id;

  -- Copy all tools from original collection
  FOR tool_record IN
    SELECT tool_id, position
    FROM collection_tools
    WHERE collection_id = original_collection_id
    ORDER BY position
  LOOP
    INSERT INTO collection_tools (
      collection_id,
      tool_id,
      position
    ) VALUES (
      new_collection_id,
      tool_record.tool_id,
      tool_record.position
    );
  END LOOP;

  -- Increment fork count on original collection
  UPDATE tool_collections
  SET fork_count = fork_count + 1
  WHERE id = original_collection_id;

  RETURN new_collection_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create index for forked_from lookups
CREATE INDEX IF NOT EXISTS idx_tool_collections_forked_from ON tool_collections(forked_from);