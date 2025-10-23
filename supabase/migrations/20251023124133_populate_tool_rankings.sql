/*
  # Populate Tool Rankings

  1. Changes
    - Creates ranking data for weekly, monthly, trending, and rising categories
    - Calculates scores based on views, ratings, and recent activity
    - Sets up period_start and period_end for current rankings

  2. Notes
    - Runs calculations to populate rankings for all types
    - Uses current date for active period
*/

-- Function to calculate and populate tool rankings
CREATE OR REPLACE FUNCTION populate_tool_rankings()
RETURNS void AS $$
DECLARE
  current_date_start date := CURRENT_DATE;
  week_end date := CURRENT_DATE + interval '7 days';
  month_end date := CURRENT_DATE + interval '30 days';
  rank_counter integer;
BEGIN
  -- Clear existing rankings
  DELETE FROM tool_rankings WHERE period_end >= CURRENT_DATE;
  
  -- Weekly rankings (based on recent views and rating)
  rank_counter := 1;
  INSERT INTO tool_rankings (tool_id, ranking_type, rank, score, period_start, period_end)
  SELECT 
    id,
    'weekly',
    rank_counter + ROW_NUMBER() OVER (ORDER BY (rating * 20 + COALESCE(views, 0) / 50.0) DESC) - 1,
    (rating * 20 + COALESCE(views, 0) / 50.0),
    current_date_start,
    week_end
  FROM ai_tools
  WHERE status = 'Published' AND rating > 0
  LIMIT 50;
  
  -- Monthly rankings
  rank_counter := 1;
  INSERT INTO tool_rankings (tool_id, ranking_type, rank, score, period_start, period_end)
  SELECT 
    id,
    'monthly',
    rank_counter + ROW_NUMBER() OVER (ORDER BY (rating * 15 + COALESCE(views, 0) / 30.0) DESC) - 1,
    (rating * 15 + COALESCE(views, 0) / 30.0),
    current_date_start,
    month_end
  FROM ai_tools
  WHERE status = 'Published' AND rating >= 4.0
  LIMIT 50;
  
  -- Trending rankings (highest growth)
  rank_counter := 1;
  INSERT INTO tool_rankings (tool_id, ranking_type, rank, score, period_start, period_end)
  SELECT 
    id,
    'trending',
    rank_counter + ROW_NUMBER() OVER (ORDER BY (rating * 25 + COALESCE(views, 0) / 100.0 + CASE WHEN featured THEN 50 ELSE 0 END) DESC) - 1,
    (rating * 25 + COALESCE(views, 0) / 100.0 + CASE WHEN featured THEN 50 ELSE 0 END),
    current_date_start,
    week_end
  FROM ai_tools
  WHERE status = 'Published' AND rating > 0
  LIMIT 50;
  
  -- Rising stars (newer tools with good traction)
  rank_counter := 1;
  INSERT INTO tool_rankings (tool_id, ranking_type, rank, score, period_start, period_end)
  SELECT 
    id,
    'rising',
    rank_counter + ROW_NUMBER() OVER (ORDER BY (rating * 30 + COALESCE(views, 0) / 20.0) DESC) - 1,
    (rating * 30 + COALESCE(views, 0) / 20.0),
    current_date_start,
    month_end
  FROM ai_tools
  WHERE status = 'Published' 
    AND rating >= 4.0
    AND created_at >= CURRENT_DATE - interval '90 days'
  LIMIT 50;
  
  -- If not enough rising stars, fill with highly rated tools
  IF (SELECT COUNT(*) FROM tool_rankings WHERE ranking_type = 'rising') < 10 THEN
    DELETE FROM tool_rankings WHERE ranking_type = 'rising';
    
    INSERT INTO tool_rankings (tool_id, ranking_type, rank, score, period_start, period_end)
    SELECT 
      id,
      'rising',
      ROW_NUMBER() OVER (ORDER BY rating DESC, views DESC),
      (rating * 20 + COALESCE(views, 0) / 30.0),
      current_date_start,
      month_end
    FROM ai_tools
    WHERE status = 'Published' AND rating >= 4.0
    LIMIT 50;
  END IF;
  
END;
$$ LANGUAGE plpgsql;

-- Run the population function
SELECT populate_tool_rankings();
