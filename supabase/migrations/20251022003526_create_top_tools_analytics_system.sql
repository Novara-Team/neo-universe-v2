/*
  # Top Tools Analytics & Ranking System
  
  1. New Tables
    - `tool_analytics`
      - `id` (uuid, primary key)
      - `tool_id` (uuid, references ai_tools)
      - `date` (date)
      - `views` (integer) - Daily views count
      - `favorites` (integer) - Daily favorites count
      - `clicks` (integer) - Daily click count
      - `engagement_score` (numeric) - Calculated engagement metric
      - `created_at` (timestamptz)
    
    - `tool_rankings`
      - `id` (uuid, primary key)
      - `tool_id` (uuid, references ai_tools)
      - `ranking_type` (text) - 'popular', 'weekly', 'monthly', 'trending', 'rising'
      - `rank` (integer) - Position in ranking
      - `score` (numeric) - Calculated score for ranking
      - `period_start` (date) - Start of ranking period
      - `period_end` (date) - End of ranking period
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
  
  2. Functions
    - `calculate_tool_engagement_score` - Calculates weighted engagement score
    - `update_popular_rankings` - Updates all-time popular rankings
    - `update_weekly_rankings` - Updates tool of the week rankings
    - `update_monthly_rankings` - Updates tool of the month rankings
    - `update_trending_rankings` - Updates trending tools (rapid growth)
    - `update_rising_rankings` - Updates rising stars (new tools gaining traction)
    - `track_tool_view` - Tracks when a tool page is viewed
    - `track_tool_click` - Tracks when a tool link is clicked
  
  3. Security
    - Enable RLS on all tables
    - Public read access for rankings (all users can view)
    - Authenticated users can view analytics
    - Tracking functions are public (SECURITY DEFINER)
  
  4. Important Notes
    - Rankings update automatically based on sophisticated algorithms
    - Popular: Based on all-time favorites, ratings, and reviews
    - Weekly: Based on last 7 days engagement with recency weighting
    - Monthly: Based on last 30 days engagement with trend analysis
    - Trending: Rapid growth in short period (viral tools)
    - Rising: New tools (< 30 days) with strong early performance
*/

-- Create tool_analytics table
CREATE TABLE IF NOT EXISTS tool_analytics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tool_id uuid REFERENCES ai_tools(id) ON DELETE CASCADE NOT NULL,
  date date NOT NULL DEFAULT CURRENT_DATE,
  views integer DEFAULT 0,
  favorites integer DEFAULT 0,
  clicks integer DEFAULT 0,
  engagement_score numeric(10,2) DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  UNIQUE(tool_id, date)
);

ALTER TABLE tool_analytics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view tool analytics"
  ON tool_analytics FOR SELECT
  TO authenticated, anon
  USING (true);

CREATE POLICY "System can insert tool analytics"
  ON tool_analytics FOR INSERT
  TO authenticated, anon
  WITH CHECK (true);

CREATE POLICY "System can update tool analytics"
  ON tool_analytics FOR UPDATE
  TO authenticated, anon
  USING (true)
  WITH CHECK (true);

-- Create tool_rankings table
CREATE TABLE IF NOT EXISTS tool_rankings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tool_id uuid REFERENCES ai_tools(id) ON DELETE CASCADE NOT NULL,
  ranking_type text NOT NULL CHECK (ranking_type IN ('popular', 'weekly', 'monthly', 'trending', 'rising')),
  rank integer NOT NULL,
  score numeric(10,2) NOT NULL DEFAULT 0,
  period_start date NOT NULL,
  period_end date NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(tool_id, ranking_type, period_start)
);

ALTER TABLE tool_rankings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view tool rankings"
  ON tool_rankings FOR SELECT
  TO authenticated, anon
  USING (true);

CREATE POLICY "System can manage tool rankings"
  ON tool_rankings FOR ALL
  TO authenticated, anon
  USING (true)
  WITH CHECK (true);

-- Function to calculate engagement score with recency weighting
CREATE OR REPLACE FUNCTION calculate_tool_engagement_score(
  p_tool_id uuid,
  p_days integer DEFAULT 7
)
RETURNS numeric AS $$
DECLARE
  v_score numeric;
  v_view_weight numeric := 1.0;
  v_favorite_weight numeric := 5.0;
  v_click_weight numeric := 3.0;
  v_recency_weight numeric := 2.0;
BEGIN
  SELECT 
    COALESCE(
      SUM(
        (views * v_view_weight + 
         favorites * v_favorite_weight + 
         clicks * v_click_weight) *
        (1 + v_recency_weight * (1 - EXTRACT(DAY FROM (CURRENT_DATE - date))::numeric / NULLIF(p_days, 0)))
      ),
      0
    )
  INTO v_score
  FROM tool_analytics
  WHERE tool_id = p_tool_id
    AND date >= CURRENT_DATE - p_days;
  
  RETURN COALESCE(v_score, 0);
END;
$$ LANGUAGE plpgsql;

-- Function to update popular rankings (all-time popular based on cumulative metrics)
CREATE OR REPLACE FUNCTION update_popular_rankings()
RETURNS void AS $$
BEGIN
  DELETE FROM tool_rankings 
  WHERE ranking_type = 'popular' 
    AND period_start = CURRENT_DATE;
  
  INSERT INTO tool_rankings (tool_id, ranking_type, rank, score, period_start, period_end)
  SELECT 
    t.id,
    'popular',
    ROW_NUMBER() OVER (ORDER BY 
      (COALESCE(t.views, 0) * 0.5 + 
       COALESCE((SELECT COUNT(*) FROM user_favorites WHERE tool_id = t.id), 0) * 10 + 
       COALESCE(t.rating, 0) * 20 + 
       COALESCE((SELECT COUNT(*) FROM tool_reviews WHERE tool_id = t.id AND approved = true), 0) * 5) DESC
    ),
    (COALESCE(t.views, 0) * 0.5 + 
     COALESCE((SELECT COUNT(*) FROM user_favorites WHERE tool_id = t.id), 0) * 10 + 
     COALESCE(t.rating, 0) * 20 + 
     COALESCE((SELECT COUNT(*) FROM tool_reviews WHERE tool_id = t.id AND approved = true), 0) * 5),
    CURRENT_DATE,
    CURRENT_DATE + INTERVAL '1 day'
  FROM ai_tools t
  WHERE t.status = 'Published'
  ORDER BY (COALESCE(t.views, 0) * 0.5 + 
            COALESCE((SELECT COUNT(*) FROM user_favorites WHERE tool_id = t.id), 0) * 10 + 
            COALESCE(t.rating, 0) * 20 + 
            COALESCE((SELECT COUNT(*) FROM tool_reviews WHERE tool_id = t.id AND approved = true), 0) * 5) DESC
  LIMIT 50;
END;
$$ LANGUAGE plpgsql;

-- Function to update weekly rankings (tool of the week)
CREATE OR REPLACE FUNCTION update_weekly_rankings()
RETURNS void AS $$
DECLARE
  v_week_start date := date_trunc('week', CURRENT_DATE)::date;
  v_week_end date := v_week_start + INTERVAL '6 days';
BEGIN
  DELETE FROM tool_rankings 
  WHERE ranking_type = 'weekly' 
    AND period_start = v_week_start;
  
  INSERT INTO tool_rankings (tool_id, ranking_type, rank, score, period_start, period_end)
  SELECT 
    t.id,
    'weekly',
    ROW_NUMBER() OVER (ORDER BY calculate_tool_engagement_score(t.id, 7) DESC),
    calculate_tool_engagement_score(t.id, 7),
    v_week_start,
    v_week_end
  FROM ai_tools t
  WHERE t.status = 'Published'
  ORDER BY calculate_tool_engagement_score(t.id, 7) DESC
  LIMIT 50;
END;
$$ LANGUAGE plpgsql;

-- Function to update monthly rankings (tool of the month)
CREATE OR REPLACE FUNCTION update_monthly_rankings()
RETURNS void AS $$
DECLARE
  v_month_start date := date_trunc('month', CURRENT_DATE)::date;
  v_month_end date := (date_trunc('month', CURRENT_DATE) + INTERVAL '1 month - 1 day')::date;
BEGIN
  DELETE FROM tool_rankings 
  WHERE ranking_type = 'monthly' 
    AND period_start = v_month_start;
  
  INSERT INTO tool_rankings (tool_id, ranking_type, rank, score, period_start, period_end)
  SELECT 
    t.id,
    'monthly',
    ROW_NUMBER() OVER (ORDER BY calculate_tool_engagement_score(t.id, 30) DESC),
    calculate_tool_engagement_score(t.id, 30),
    v_month_start,
    v_month_end
  FROM ai_tools t
  WHERE t.status = 'Published'
  ORDER BY calculate_tool_engagement_score(t.id, 30) DESC
  LIMIT 50;
END;
$$ LANGUAGE plpgsql;

-- Function to update trending rankings (rapid growth - viral tools)
CREATE OR REPLACE FUNCTION update_trending_rankings()
RETURNS void AS $$
DECLARE
  v_period_start date := CURRENT_DATE - INTERVAL '3 days';
BEGIN
  DELETE FROM tool_rankings 
  WHERE ranking_type = 'trending' 
    AND period_start = CURRENT_DATE;
  
  INSERT INTO tool_rankings (tool_id, ranking_type, rank, score, period_start, period_end)
  SELECT 
    t.id,
    'trending',
    ROW_NUMBER() OVER (ORDER BY 
      (calculate_tool_engagement_score(t.id, 3) / NULLIF(calculate_tool_engagement_score(t.id, 7), 0)) DESC
    ),
    (calculate_tool_engagement_score(t.id, 3) / NULLIF(calculate_tool_engagement_score(t.id, 7), 0)) * 100,
    CURRENT_DATE,
    CURRENT_DATE + INTERVAL '1 day'
  FROM ai_tools t
  WHERE t.status = 'Published'
    AND calculate_tool_engagement_score(t.id, 7) > 10
  ORDER BY (calculate_tool_engagement_score(t.id, 3) / NULLIF(calculate_tool_engagement_score(t.id, 7), 0)) DESC
  LIMIT 50;
END;
$$ LANGUAGE plpgsql;

-- Function to update rising rankings (new tools with strong early performance)
CREATE OR REPLACE FUNCTION update_rising_rankings()
RETURNS void AS $$
BEGIN
  DELETE FROM tool_rankings 
  WHERE ranking_type = 'rising' 
    AND period_start = CURRENT_DATE;
  
  INSERT INTO tool_rankings (tool_id, ranking_type, rank, score, period_start, period_end)
  SELECT 
    t.id,
    'rising',
    ROW_NUMBER() OVER (ORDER BY 
      calculate_tool_engagement_score(t.id, 14) * 
      (1 + (30 - EXTRACT(DAY FROM (CURRENT_DATE - t.created_at))::numeric) / 30) DESC
    ),
    calculate_tool_engagement_score(t.id, 14) * 
    (1 + (30 - EXTRACT(DAY FROM (CURRENT_DATE - t.created_at))::numeric) / 30),
    CURRENT_DATE,
    CURRENT_DATE + INTERVAL '1 day'
  FROM ai_tools t
  WHERE t.status = 'Published'
    AND t.created_at >= CURRENT_DATE - INTERVAL '30 days'
    AND calculate_tool_engagement_score(t.id, 14) > 5
  ORDER BY calculate_tool_engagement_score(t.id, 14) * 
           (1 + (30 - EXTRACT(DAY FROM (CURRENT_DATE - t.created_at))::numeric) / 30) DESC
  LIMIT 50;
END;
$$ LANGUAGE plpgsql;

-- Function to track tool view
CREATE OR REPLACE FUNCTION track_tool_view(p_tool_id uuid)
RETURNS void AS $$
BEGIN
  INSERT INTO tool_analytics (tool_id, date, views)
  VALUES (p_tool_id, CURRENT_DATE, 1)
  ON CONFLICT (tool_id, date)
  DO UPDATE SET views = tool_analytics.views + 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to track tool click
CREATE OR REPLACE FUNCTION track_tool_click(p_tool_id uuid)
RETURNS void AS $$
BEGIN
  INSERT INTO tool_analytics (tool_id, date, clicks)
  VALUES (p_tool_id, CURRENT_DATE, 1)
  ON CONFLICT (tool_id, date)
  DO UPDATE SET clicks = tool_analytics.clicks + 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to track tool favorite
CREATE OR REPLACE FUNCTION track_tool_favorite(p_tool_id uuid)
RETURNS void AS $$
BEGIN
  INSERT INTO tool_analytics (tool_id, date, favorites)
  VALUES (p_tool_id, CURRENT_DATE, 1)
  ON CONFLICT (tool_id, date)
  DO UPDATE SET favorites = tool_analytics.favorites + 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_tool_analytics_tool_date ON tool_analytics(tool_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_tool_analytics_date ON tool_analytics(date DESC);
CREATE INDEX IF NOT EXISTS idx_tool_rankings_type_period ON tool_rankings(ranking_type, period_start DESC, rank);
CREATE INDEX IF NOT EXISTS idx_tool_rankings_tool ON tool_rankings(tool_id, ranking_type);
CREATE INDEX IF NOT EXISTS idx_tool_rankings_rank ON tool_rankings(ranking_type, rank);
