/*
  # Create Tool Recommendation System

  1. New Tables
    - `tool_interactions`
      - `id` (uuid, primary key) - Unique interaction identifier
      - `user_id` (uuid) - References user_profiles
      - `tool_id` (uuid) - References ai_tools
      - `interaction_type` (text) - Type: view, favorite, share
      - `interaction_count` (integer) - How many times this action occurred
      - `created_at` (timestamptz) - Creation timestamp
      - `updated_at` (timestamptz) - Last update timestamp

    - `tool_recommendations`
      - `id` (uuid, primary key) - Unique recommendation identifier
      - `user_id` (uuid) - References user_profiles
      - `tool_id` (uuid) - References ai_tools
      - `score` (numeric) - Recommendation score (0-100)
      - `reason` (text) - Why this tool is recommended
      - `created_at` (timestamptz) - Creation timestamp

  2. Security
    - Enable RLS on all tables
    - Users can only view/modify their own interactions
    - Users can only view their own recommendations
    - Public can log tool views (for anonymous users)

  3. Important Notes
    - Track user views, favorites, and shares
    - Generate recommendations based on user behavior
    - Score calculation considers multiple factors
*/

-- Create tool_interactions table
CREATE TABLE IF NOT EXISTS tool_interactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES user_profiles(id) ON DELETE CASCADE,
  tool_id uuid NOT NULL REFERENCES ai_tools(id) ON DELETE CASCADE,
  interaction_type text NOT NULL CHECK (interaction_type IN ('view', 'favorite', 'share')),
  interaction_count integer DEFAULT 1,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, tool_id, interaction_type)
);

-- Create tool_recommendations table
CREATE TABLE IF NOT EXISTS tool_recommendations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  tool_id uuid NOT NULL REFERENCES ai_tools(id) ON DELETE CASCADE,
  score numeric DEFAULT 0 CHECK (score >= 0 AND score <= 100),
  reason text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, tool_id)
);

-- Enable RLS
ALTER TABLE tool_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE tool_recommendations ENABLE ROW LEVEL SECURITY;

-- Policies for tool_interactions
CREATE POLICY "Users can view own interactions"
  ON tool_interactions FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own interactions"
  ON tool_interactions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own interactions"
  ON tool_interactions FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Anonymous can log tool views"
  ON tool_interactions FOR INSERT
  TO anon
  WITH CHECK (interaction_type = 'view');

-- Policies for tool_recommendations
CREATE POLICY "Users can view own recommendations"
  ON tool_recommendations FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Function to update interaction count
CREATE OR REPLACE FUNCTION public.upsert_tool_interaction(
  p_user_id uuid,
  p_tool_id uuid,
  p_interaction_type text
)
RETURNS void AS $$
BEGIN
  INSERT INTO tool_interactions (user_id, tool_id, interaction_type, interaction_count)
  VALUES (p_user_id, p_tool_id, p_interaction_type, 1)
  ON CONFLICT (user_id, tool_id, interaction_type)
  DO UPDATE SET
    interaction_count = tool_interactions.interaction_count + 1,
    updated_at = now();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to generate recommendations for a user
CREATE OR REPLACE FUNCTION public.generate_tool_recommendations(p_user_id uuid)
RETURNS void AS $$
DECLARE
  v_tool record;
  v_score numeric;
  v_reason text;
BEGIN
  -- Delete old recommendations
  DELETE FROM tool_recommendations WHERE user_id = p_user_id;

  -- Generate recommendations based on user interactions
  FOR v_tool IN
    SELECT 
      t.id as tool_id,
      t.name,
      t.category_id,
      t.tags,
      t.rating,
      t.views
    FROM ai_tools t
    WHERE t.status = 'Published'
    AND t.id NOT IN (
      SELECT tool_id FROM tool_interactions 
      WHERE user_id = p_user_id AND interaction_type = 'view'
    )
    ORDER BY t.rating DESC, t.views DESC
    LIMIT 100
  LOOP
    v_score := 0;
    v_reason := '';

    -- Score based on category similarity
    IF EXISTS (
      SELECT 1 FROM tool_interactions ti
      JOIN ai_tools t ON ti.tool_id = t.id
      WHERE ti.user_id = p_user_id 
      AND t.category_id = v_tool.category_id
    ) THEN
      v_score := v_score + 30;
      v_reason := v_reason || 'Similar category to your interests. ';
    END IF;

    -- Score based on tag similarity
    IF EXISTS (
      SELECT 1 FROM tool_interactions ti
      JOIN ai_tools t ON ti.tool_id = t.id
      WHERE ti.user_id = p_user_id 
      AND t.tags && v_tool.tags
    ) THEN
      v_score := v_score + 20;
      v_reason := v_reason || 'Related topics. ';
    END IF;

    -- Score based on rating
    v_score := v_score + (v_tool.rating * 5);
    
    -- Score based on popularity
    v_score := v_score + LEAST(v_tool.views / 100.0, 15);

    -- Score based on favorites by other users
    v_score := v_score + (
      SELECT COUNT(*) * 10 
      FROM tool_interactions 
      WHERE tool_id = v_tool.tool_id 
      AND interaction_type = 'favorite'
      LIMIT 1
    );

    IF v_score > 20 THEN
      v_reason := COALESCE(NULLIF(v_reason, ''), 'Popular and highly rated tool.');
      
      INSERT INTO tool_recommendations (user_id, tool_id, score, reason)
      VALUES (p_user_id, v_tool.tool_id, LEAST(v_score, 100), v_reason);
    END IF;
  END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update updated_at timestamp for interactions
CREATE OR REPLACE FUNCTION update_interaction_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for updated_at on tool_interactions
DROP TRIGGER IF EXISTS update_tool_interactions_updated_at ON tool_interactions;
CREATE TRIGGER update_tool_interactions_updated_at
  BEFORE UPDATE ON tool_interactions
  FOR EACH ROW
  EXECUTE FUNCTION update_interaction_updated_at();

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_tool_interactions_user_id ON tool_interactions(user_id);
CREATE INDEX IF NOT EXISTS idx_tool_interactions_tool_id ON tool_interactions(tool_id);
CREATE INDEX IF NOT EXISTS idx_tool_interactions_type ON tool_interactions(interaction_type);
CREATE INDEX IF NOT EXISTS idx_tool_recommendations_user_id ON tool_recommendations(user_id);
CREATE INDEX IF NOT EXISTS idx_tool_recommendations_score ON tool_recommendations(score DESC);
