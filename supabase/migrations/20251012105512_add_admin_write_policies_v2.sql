/*
  # Add Admin Write Policies
  
  ## Summary
  This migration adds comprehensive write policies for the admin panel to enable full CRUD operations.
  
  ## Changes
  1. Drop existing restrictive policies if they exist
  2. Add INSERT, UPDATE, DELETE policies for all admin-managed tables
  3. Allow anonymous users to perform these operations (client-side auth in place)
  
  ## Security Note
  The admin panel uses password protection on the client side.
*/

-- Drop existing policies that might conflict
DROP POLICY IF EXISTS "Admins can insert tools" ON ai_tools;
DROP POLICY IF EXISTS "Admins can update tools" ON ai_tools;
DROP POLICY IF EXISTS "Admins can delete tools" ON ai_tools;
DROP POLICY IF EXISTS "Admins can insert news" ON ai_news;
DROP POLICY IF EXISTS "Admins can update news" ON ai_news;
DROP POLICY IF EXISTS "Admins can delete news" ON ai_news;
DROP POLICY IF EXISTS "Admins can update reviews" ON tool_reviews;
DROP POLICY IF EXISTS "Admins can delete reviews" ON tool_reviews;
DROP POLICY IF EXISTS "Anyone can view all reviews" ON tool_reviews;
DROP POLICY IF EXISTS "Admins can update submissions" ON tool_submissions;
DROP POLICY IF EXISTS "Admins can insert categories" ON categories;
DROP POLICY IF EXISTS "Admins can update categories" ON categories;
DROP POLICY IF EXISTS "Admins can delete categories" ON categories;

-- AI Tools policies for admin
CREATE POLICY "Admins can insert tools"
  ON ai_tools FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Admins can update tools"
  ON ai_tools FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Admins can delete tools"
  ON ai_tools FOR DELETE
  TO anon, authenticated
  USING (true);

-- AI News policies for admin
CREATE POLICY "Admins can insert news"
  ON ai_news FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Admins can update news"
  ON ai_news FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Admins can delete news"
  ON ai_news FOR DELETE
  TO anon, authenticated
  USING (true);

-- Tool Reviews policies for admin
CREATE POLICY "Admins can update reviews"
  ON tool_reviews FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Admins can delete reviews"
  ON tool_reviews FOR DELETE
  TO anon, authenticated
  USING (true);

CREATE POLICY "Anyone can view all reviews"
  ON tool_reviews FOR SELECT
  TO anon, authenticated
  USING (true);

-- Tool Submissions policies for admin
CREATE POLICY "Admins can update submissions"
  ON tool_submissions FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

-- Categories policies for admin
CREATE POLICY "Admins can insert categories"
  ON categories FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Admins can update categories"
  ON categories FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Admins can delete categories"
  ON categories FOR DELETE
  TO anon, authenticated
  USING (true);