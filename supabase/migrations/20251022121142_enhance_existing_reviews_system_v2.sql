/*
  # Enhance Existing Reviews System

  1. Changes to existing tool_reviews table
    - Add user_id column for better user tracking
    - Add title column for review titles
    - Add pros and cons arrays
    - Add verified_purchase flag
    - Add helpful_count for voting
    - Add review_text column (keep comment for backward compatibility)
    - Add updated_at timestamp
  
  2. New table
    - review_helpful_votes for tracking helpful votes

  3. Security
    - Update RLS policies for authenticated users
    - Users can only modify their own reviews
    - Add policies for helpful votes

  4. Functions and Triggers
    - Function to update helpful count
    - Function to update tool average rating
*/

-- Add new columns to existing tool_reviews table
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tool_reviews' AND column_name = 'user_id') THEN
    ALTER TABLE tool_reviews ADD COLUMN user_id uuid;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tool_reviews' AND column_name = 'title') THEN
    ALTER TABLE tool_reviews ADD COLUMN title text DEFAULT 'Review';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tool_reviews' AND column_name = 'review_text') THEN
    ALTER TABLE tool_reviews ADD COLUMN review_text text;
    UPDATE tool_reviews SET review_text = comment WHERE review_text IS NULL;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tool_reviews' AND column_name = 'pros') THEN
    ALTER TABLE tool_reviews ADD COLUMN pros text[] DEFAULT '{}';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tool_reviews' AND column_name = 'cons') THEN
    ALTER TABLE tool_reviews ADD COLUMN cons text[] DEFAULT '{}';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tool_reviews' AND column_name = 'verified_purchase') THEN
    ALTER TABLE tool_reviews ADD COLUMN verified_purchase boolean DEFAULT false;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tool_reviews' AND column_name = 'helpful_count') THEN
    ALTER TABLE tool_reviews ADD COLUMN helpful_count integer DEFAULT 0;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tool_reviews' AND column_name = 'updated_at') THEN
    ALTER TABLE tool_reviews ADD COLUMN updated_at timestamptz DEFAULT now();
  END IF;
END $$;

-- Create review_helpful_votes table
CREATE TABLE IF NOT EXISTS review_helpful_votes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  review_id uuid REFERENCES tool_reviews(id) ON DELETE CASCADE NOT NULL,
  voter_id uuid NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(review_id, voter_id)
);

-- Enable RLS on tables
ALTER TABLE tool_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE review_helpful_votes ENABLE ROW LEVEL SECURITY;

-- Drop and recreate policies for tool_reviews
DROP POLICY IF EXISTS "Anyone can view approved reviews" ON tool_reviews;
DROP POLICY IF EXISTS "Authenticated users can create reviews" ON tool_reviews;
DROP POLICY IF EXISTS "Users can update own reviews" ON tool_reviews;
DROP POLICY IF EXISTS "Users can delete own reviews" ON tool_reviews;

CREATE POLICY "Anyone can view approved reviews"
  ON tool_reviews FOR SELECT
  USING (approved = true OR auth.uid() = user_id);

CREATE POLICY "Authenticated users can create reviews"
  ON tool_reviews FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update own reviews"
  ON tool_reviews FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own reviews"
  ON tool_reviews FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Drop and recreate policies for review_helpful_votes
DROP POLICY IF EXISTS "Anyone can view helpful votes" ON review_helpful_votes;
DROP POLICY IF EXISTS "Users can add helpful votes" ON review_helpful_votes;
DROP POLICY IF EXISTS "Users can remove their helpful votes" ON review_helpful_votes;

CREATE POLICY "Anyone can view helpful votes"
  ON review_helpful_votes FOR SELECT
  USING (true);

CREATE POLICY "Users can add helpful votes"
  ON review_helpful_votes FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = voter_id);

CREATE POLICY "Users can remove their helpful votes"
  ON review_helpful_votes FOR DELETE
  TO authenticated
  USING (auth.uid() = voter_id);

-- Function to update review helpful count
CREATE OR REPLACE FUNCTION update_review_helpful_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE tool_reviews
    SET helpful_count = helpful_count + 1
    WHERE id = NEW.review_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE tool_reviews
    SET helpful_count = GREATEST(helpful_count - 1, 0)
    WHERE id = OLD.review_id;
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to update review helpful count
DROP TRIGGER IF EXISTS update_helpful_count_on_vote ON review_helpful_votes;
CREATE TRIGGER update_helpful_count_on_vote
  AFTER INSERT OR DELETE ON review_helpful_votes
  FOR EACH ROW
  EXECUTE FUNCTION update_review_helpful_count();

-- Function to update tool average rating
CREATE OR REPLACE FUNCTION update_tool_rating_from_reviews()
RETURNS TRIGGER AS $$
DECLARE
  avg_rating numeric;
BEGIN
  SELECT COALESCE(AVG(rating), 0)
  INTO avg_rating
  FROM tool_reviews
  WHERE tool_id = COALESCE(NEW.tool_id, OLD.tool_id) AND approved = true;
  
  UPDATE ai_tools
  SET rating = ROUND(avg_rating, 1)
  WHERE id = COALESCE(NEW.tool_id, OLD.tool_id);
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to update tool rating
DROP TRIGGER IF EXISTS update_tool_rating_on_review_change ON tool_reviews;
CREATE TRIGGER update_tool_rating_on_review_change
  AFTER INSERT OR UPDATE OF rating, approved OR DELETE ON tool_reviews
  FOR EACH ROW
  EXECUTE FUNCTION update_tool_rating_from_reviews();

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_tool_reviews_user_id ON tool_reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_tool_reviews_approved ON tool_reviews(approved);
CREATE INDEX IF NOT EXISTS idx_tool_reviews_helpful_count ON tool_reviews(helpful_count DESC);
CREATE INDEX IF NOT EXISTS idx_review_helpful_votes_review_id ON review_helpful_votes(review_id);
CREATE INDEX IF NOT EXISTS idx_review_helpful_votes_voter_id ON review_helpful_votes(voter_id);
