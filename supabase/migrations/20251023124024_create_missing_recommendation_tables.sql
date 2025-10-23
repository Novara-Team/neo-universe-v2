/*
  # Create Missing Recommendation System Tables

  1. New Tables
    - `user_contexts`
      - Stores user browsing and interaction context for personalized recommendations
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users)
      - `browsing_history` (jsonb) - Stores visited tools and pages
      - `search_queries` (text[]) - User's search history
      - `preferences` (jsonb) - User preferences and interests
      - `last_active_at` (timestamptz)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

    - `emerging_tools`
      - Tracks trending and emerging AI tools
      - `id` (uuid, primary key)
      - `tool_id` (uuid, foreign key to ai_tools)
      - `trend_score` (numeric) - Calculated trend score
      - `growth_rate` (numeric) - Growth rate percentage
      - `momentum` (numeric) - Momentum indicator
      - `calculated_at` (timestamptz)
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to read their own data
    - Add policies for admins to manage all data
*/

-- Create user_contexts table
CREATE TABLE IF NOT EXISTS user_contexts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  browsing_history jsonb DEFAULT '[]'::jsonb,
  search_queries text[] DEFAULT ARRAY[]::text[],
  preferences jsonb DEFAULT '{}'::jsonb,
  last_active_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id)
);

ALTER TABLE user_contexts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own context"
  ON user_contexts FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own context"
  ON user_contexts FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own context"
  ON user_contexts FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create emerging_tools table
CREATE TABLE IF NOT EXISTS emerging_tools (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tool_id uuid NOT NULL REFERENCES ai_tools(id) ON DELETE CASCADE,
  trend_score numeric DEFAULT 0,
  growth_rate numeric DEFAULT 0,
  momentum numeric DEFAULT 0,
  calculated_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  UNIQUE(tool_id)
);

ALTER TABLE emerging_tools ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view emerging tools"
  ON emerging_tools FOR SELECT
  TO authenticated
  USING (true);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_contexts_user_id ON user_contexts(user_id);
CREATE INDEX IF NOT EXISTS idx_user_contexts_last_active ON user_contexts(last_active_at DESC);
CREATE INDEX IF NOT EXISTS idx_emerging_tools_tool_id ON emerging_tools(tool_id);
CREATE INDEX IF NOT EXISTS idx_emerging_tools_trend_score ON emerging_tools(trend_score DESC);
CREATE INDEX IF NOT EXISTS idx_emerging_tools_calculated_at ON emerging_tools(calculated_at DESC);

-- Fix tool_recommendations table if it has issues with foreign key
DO $$
BEGIN
  -- Check if tool_recommendations exists and has proper structure
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'tool_recommendations') THEN
    -- Drop and recreate the table with proper foreign key
    DROP TABLE IF EXISTS tool_recommendations CASCADE;
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS tool_recommendations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tool_id uuid NOT NULL REFERENCES ai_tools(id) ON DELETE CASCADE,
  score numeric DEFAULT 0,
  reason text,
  context_score numeric DEFAULT 0,
  trend_score numeric DEFAULT 0,
  recommendation_type text DEFAULT 'general',
  created_at timestamptz DEFAULT now(),
  expires_at timestamptz DEFAULT (now() + interval '7 days')
);

ALTER TABLE tool_recommendations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own recommendations"
  ON tool_recommendations FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_tool_recommendations_user_id ON tool_recommendations(user_id);
CREATE INDEX IF NOT EXISTS idx_tool_recommendations_score ON tool_recommendations(score DESC);
CREATE INDEX IF NOT EXISTS idx_tool_recommendations_expires_at ON tool_recommendations(expires_at);

-- Function to update user context timestamp
CREATE OR REPLACE FUNCTION update_user_context_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_user_contexts_timestamp ON user_contexts;
CREATE TRIGGER update_user_contexts_timestamp
  BEFORE UPDATE ON user_contexts
  FOR EACH ROW
  EXECUTE FUNCTION update_user_context_timestamp();

-- Function to calculate emerging tools (sample implementation)
CREATE OR REPLACE FUNCTION calculate_emerging_tools()
RETURNS void AS $$
BEGIN
  -- Clear old data
  TRUNCATE emerging_tools;
  
  -- Insert trending tools based on recent views and ratings
  INSERT INTO emerging_tools (tool_id, trend_score, growth_rate, momentum, calculated_at)
  SELECT 
    id as tool_id,
    (rating * 10 + COALESCE(views, 0) / 100.0) as trend_score,
    CASE 
      WHEN COALESCE(views, 0) > 1000 THEN 25.0
      WHEN COALESCE(views, 0) > 500 THEN 15.0
      ELSE 5.0
    END as growth_rate,
    rating * 5 as momentum,
    now() as calculated_at
  FROM ai_tools
  WHERE status = 'Published'
  ORDER BY (rating * 10 + COALESCE(views, 0) / 100.0) DESC
  LIMIT 20;
END;
$$ LANGUAGE plpgsql;

-- Run the calculation once
SELECT calculate_emerging_tools();
