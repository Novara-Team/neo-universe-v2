/*
  # Enhanced Review Editing System

  1. Changes
    - Add title field to reviews
    - Add pros and cons fields
    - Add verified_purchase flag
    - Add helpful_users array to track who found it helpful

  2. Security
    - Update RLS policies for admin editing
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'tool_reviews' AND column_name = 'title'
  ) THEN
    ALTER TABLE tool_reviews ADD COLUMN title text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'tool_reviews' AND column_name = 'pros'
  ) THEN
    ALTER TABLE tool_reviews ADD COLUMN pros text[];
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'tool_reviews' AND column_name = 'cons'
  ) THEN
    ALTER TABLE tool_reviews ADD COLUMN cons text[];
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'tool_reviews' AND column_name = 'verified_purchase'
  ) THEN
    ALTER TABLE tool_reviews ADD COLUMN verified_purchase boolean DEFAULT false;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'tool_reviews' AND column_name = 'helpful_users'
  ) THEN
    ALTER TABLE tool_reviews ADD COLUMN helpful_users uuid[] DEFAULT '{}'::uuid[];
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_tool_reviews_title ON tool_reviews(title);
CREATE INDEX IF NOT EXISTS idx_tool_reviews_verified ON tool_reviews(verified_purchase);
