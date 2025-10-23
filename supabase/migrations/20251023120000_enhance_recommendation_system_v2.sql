/*
  # Enhanced AI Recommendation System v2.0

  1. New Tables
    - `user_contexts` - Stores user context for recommendations (current projects, industry, team)
    - `tool_bundles` - Predefined tool bundles for specific use cases
    - `emerging_tools` - Tracks trending and emerging tools

  2. Changes
    - Add context-awareness fields to recommendations
    - Add industry-specific recommendations
    - Add team-based recommendation support
    - Add trend analysis capabilities

  3. Security
    - Enable RLS on all new tables
    - Add policies for authenticated users
*/

CREATE TABLE IF NOT EXISTS user_contexts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  industry text,
  company_size text,
  role text,
  current_tools text[],
  use_cases text[],
  budget_range text,
  team_size integer DEFAULT 1,
  technical_level text DEFAULT 'intermediate',
  preferences jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
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

CREATE TABLE IF NOT EXISTS tool_bundles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text NOT NULL,
  industry text,
  use_case text NOT NULL,
  tool_ids uuid[] NOT NULL,
  estimated_cost text,
  difficulty_level text DEFAULT 'intermediate',
  setup_time text,
  benefits text[],
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE tool_bundles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view tool bundles"
  ON tool_bundles FOR SELECT
  TO authenticated
  USING (true);

CREATE TABLE IF NOT EXISTS emerging_tools (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tool_id uuid REFERENCES ai_tools(id) ON DELETE CASCADE NOT NULL,
  trend_score integer DEFAULT 0,
  growth_rate numeric(10, 2) DEFAULT 0,
  weekly_views integer DEFAULT 0,
  monthly_views integer DEFAULT 0,
  last_calculated timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  UNIQUE(tool_id)
);

ALTER TABLE emerging_tools ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view emerging tools"
  ON emerging_tools FOR SELECT
  TO authenticated
  USING (true);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'tool_recommendations' AND column_name = 'context_score'
  ) THEN
    ALTER TABLE tool_recommendations ADD COLUMN context_score integer DEFAULT 0;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'tool_recommendations' AND column_name = 'trend_score'
  ) THEN
    ALTER TABLE tool_recommendations ADD COLUMN trend_score integer DEFAULT 0;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'tool_recommendations' AND column_name = 'bundle_id'
  ) THEN
    ALTER TABLE tool_recommendations ADD COLUMN bundle_id uuid REFERENCES tool_bundles(id) ON DELETE SET NULL;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'tool_recommendations' AND column_name = 'recommendation_type'
  ) THEN
    ALTER TABLE tool_recommendations ADD COLUMN recommendation_type text DEFAULT 'general';
  END IF;
END $$;

CREATE OR REPLACE FUNCTION calculate_emerging_tools()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO emerging_tools (tool_id, trend_score, growth_rate, weekly_views, monthly_views, last_calculated)
  SELECT
    t.id,
    LEAST(100, GREATEST(0,
      (t.views::numeric / NULLIF((SELECT AVG(views) FROM ai_tools WHERE status = 'Published'), 0) * 50) +
      (t.rating * 10)
    ))::integer as trend_score,
    CASE
      WHEN t.created_at > now() - interval '30 days' THEN 100
      WHEN t.created_at > now() - interval '60 days' THEN 75
      WHEN t.created_at > now() - interval '90 days' THEN 50
      ELSE 25
    END as growth_rate,
    CASE
      WHEN t.created_at > now() - interval '7 days' THEN t.views
      ELSE (t.views * 0.1)::integer
    END as weekly_views,
    t.views as monthly_views,
    now()
  FROM ai_tools t
  WHERE t.status = 'Published'
  ON CONFLICT (tool_id)
  DO UPDATE SET
    trend_score = EXCLUDED.trend_score,
    growth_rate = EXCLUDED.growth_rate,
    weekly_views = EXCLUDED.weekly_views,
    monthly_views = EXCLUDED.monthly_views,
    last_calculated = EXCLUDED.last_calculated;
END;
$$;

CREATE OR REPLACE FUNCTION generate_enhanced_recommendations(p_user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_context record;
  v_tool record;
  v_base_score numeric;
  v_context_score integer;
  v_trend_score integer;
BEGIN
  DELETE FROM tool_recommendations WHERE user_id = p_user_id;

  SELECT * INTO v_user_context FROM user_contexts WHERE user_id = p_user_id LIMIT 1;

  FOR v_tool IN
    SELECT t.*,
           COALESCE(et.trend_score, 0) as trend_score,
           COALESCE(et.growth_rate, 0) as growth_rate
    FROM ai_tools t
    LEFT JOIN emerging_tools et ON et.tool_id = t.id
    WHERE t.status = 'Published'
    ORDER BY t.rating DESC, t.views DESC
    LIMIT 100
  LOOP
    v_base_score := (
      SELECT COALESCE(
        (SELECT COUNT(*) * 15 FROM tool_interactions
         WHERE user_id = p_user_id
         AND tool_id IN (
           SELECT id FROM ai_tools
           WHERE category_id = v_tool.category_id
         )
        ), 0
      ) +
      (v_tool.rating * 10) +
      (LEAST(log(v_tool.views + 1) * 2, 20))
    );

    v_context_score := 0;
    IF v_user_context IS NOT NULL THEN
      IF v_user_context.industry IS NOT NULL THEN
        v_context_score := v_context_score + 10;
      END IF;

      IF v_user_context.budget_range = 'free' AND v_tool.pricing_type = 'Free' THEN
        v_context_score := v_context_score + 15;
      END IF;
    END IF;

    v_trend_score := v_tool.trend_score;

    IF (v_base_score + v_context_score + v_trend_score) >= 30 THEN
      INSERT INTO tool_recommendations (
        user_id,
        tool_id,
        score,
        context_score,
        trend_score,
        reason,
        recommendation_type,
        created_at
      ) VALUES (
        p_user_id,
        v_tool.id,
        v_base_score + v_context_score + v_trend_score,
        v_context_score,
        v_trend_score,
        CASE
          WHEN v_trend_score > 70 THEN 'Trending tool with high growth potential'
          WHEN v_context_score > 20 THEN 'Matches your industry and requirements'
          WHEN v_base_score > 50 THEN 'Highly rated and popular in your interest area'
          ELSE 'Recommended based on your activity'
        END,
        CASE
          WHEN v_trend_score > 70 THEN 'emerging'
          WHEN v_context_score > 20 THEN 'context-based'
          ELSE 'general'
        END,
        now()
      );
    END IF;
  END LOOP;
END;
$$;

CREATE INDEX IF NOT EXISTS idx_user_contexts_user_id ON user_contexts(user_id);
CREATE INDEX IF NOT EXISTS idx_emerging_tools_tool_id ON emerging_tools(tool_id);
CREATE INDEX IF NOT EXISTS idx_emerging_tools_trend_score ON emerging_tools(trend_score DESC);
CREATE INDEX IF NOT EXISTS idx_tool_recommendations_type ON tool_recommendations(recommendation_type);
