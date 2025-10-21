/*
  # Personal Analytics System for Universe Master Users

  1. New Tables
    - `user_analytics_events`
      - Tracks all user interactions (tool views, comparisons, collection actions, etc.)
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `event_type` (text) - e.g., 'tool_view', 'tool_compare', 'collection_create', 'favorite_add'
      - `event_data` (jsonb) - flexible data storage for event details
      - `created_at` (timestamptz)
    
    - `user_analytics_summary`
      - Aggregated daily/weekly/monthly stats
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `total_tool_views` (integer)
      - `total_comparisons` (integer)
      - `total_collections` (integer)
      - `total_favorites` (integer)
      - `top_categories` (jsonb)
      - `engagement_score` (integer)
      - `last_calculated_at` (timestamptz)
      - `created_at` (timestamptz)
    
    - `user_activity_streaks`
      - Track consecutive days of activity
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users, unique)
      - `current_streak` (integer)
      - `longest_streak` (integer)
      - `last_activity_date` (date)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on all tables
    - Users can only view their own analytics
    - Analytics events are created via function calls
*/

-- Create user_analytics_events table
CREATE TABLE IF NOT EXISTS user_analytics_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  event_type text NOT NULL,
  event_data jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_analytics_events_user_id ON user_analytics_events(user_id);
CREATE INDEX IF NOT EXISTS idx_analytics_events_created_at ON user_analytics_events(created_at);
CREATE INDEX IF NOT EXISTS idx_analytics_events_type ON user_analytics_events(event_type);

ALTER TABLE user_analytics_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own analytics events"
  ON user_analytics_events FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own analytics events"
  ON user_analytics_events FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Create user_analytics_summary table
CREATE TABLE IF NOT EXISTS user_analytics_summary (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  total_tool_views integer DEFAULT 0,
  total_comparisons integer DEFAULT 0,
  total_collections integer DEFAULT 0,
  total_favorites integer DEFAULT 0,
  top_categories jsonb DEFAULT '[]'::jsonb,
  engagement_score integer DEFAULT 0,
  last_calculated_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_analytics_summary_user_id ON user_analytics_summary(user_id);

ALTER TABLE user_analytics_summary ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own analytics summary"
  ON user_analytics_summary FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own analytics summary"
  ON user_analytics_summary FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own analytics summary"
  ON user_analytics_summary FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create user_activity_streaks table
CREATE TABLE IF NOT EXISTS user_activity_streaks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  current_streak integer DEFAULT 0,
  longest_streak integer DEFAULT 0,
  last_activity_date date DEFAULT CURRENT_DATE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_activity_streaks_user_id ON user_activity_streaks(user_id);

ALTER TABLE user_activity_streaks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own activity streaks"
  ON user_activity_streaks FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own activity streaks"
  ON user_activity_streaks FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own activity streaks"
  ON user_activity_streaks FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Function to update analytics summary
CREATE OR REPLACE FUNCTION update_user_analytics_summary(p_user_id uuid)
RETURNS void AS $$
BEGIN
  INSERT INTO user_analytics_summary (
    user_id,
    total_tool_views,
    total_comparisons,
    total_collections,
    total_favorites,
    engagement_score,
    last_calculated_at
  )
  SELECT
    p_user_id,
    COUNT(*) FILTER (WHERE event_type = 'tool_view'),
    COUNT(*) FILTER (WHERE event_type = 'tool_compare'),
    (SELECT COUNT(*) FROM tool_collections WHERE user_id = p_user_id),
    (SELECT COUNT(*) FROM user_favorites WHERE user_id = p_user_id),
    LEAST(1000, (
      COUNT(*) FILTER (WHERE event_type = 'tool_view') +
      COUNT(*) FILTER (WHERE event_type = 'tool_compare') * 2 +
      (SELECT COUNT(*) FROM tool_collections WHERE user_id = p_user_id) * 5 +
      (SELECT COUNT(*) FROM user_favorites WHERE user_id = p_user_id) * 3
    )),
    now()
  FROM user_analytics_events
  WHERE user_id = p_user_id
  ON CONFLICT (user_id) DO UPDATE SET
    total_tool_views = EXCLUDED.total_tool_views,
    total_comparisons = EXCLUDED.total_comparisons,
    total_collections = EXCLUDED.total_collections,
    total_favorites = EXCLUDED.total_favorites,
    engagement_score = EXCLUDED.engagement_score,
    last_calculated_at = EXCLUDED.last_calculated_at;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update activity streak
CREATE OR REPLACE FUNCTION update_user_activity_streak(p_user_id uuid)
RETURNS void AS $$
DECLARE
  v_last_date date;
  v_current_streak integer;
  v_longest_streak integer;
BEGIN
  SELECT last_activity_date, current_streak, longest_streak
  INTO v_last_date, v_current_streak, v_longest_streak
  FROM user_activity_streaks
  WHERE user_id = p_user_id;

  IF NOT FOUND THEN
    INSERT INTO user_activity_streaks (user_id, current_streak, longest_streak, last_activity_date)
    VALUES (p_user_id, 1, 1, CURRENT_DATE);
  ELSE
    IF v_last_date = CURRENT_DATE THEN
      RETURN;
    ELSIF v_last_date = CURRENT_DATE - INTERVAL '1 day' THEN
      v_current_streak := v_current_streak + 1;
      v_longest_streak := GREATEST(v_longest_streak, v_current_streak);
    ELSE
      v_current_streak := 1;
    END IF;

    UPDATE user_activity_streaks
    SET current_streak = v_current_streak,
        longest_streak = v_longest_streak,
        last_activity_date = CURRENT_DATE,
        updated_at = now()
    WHERE user_id = p_user_id;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;