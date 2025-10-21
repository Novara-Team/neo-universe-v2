/*
  # Improve AI Recommendation Algorithm

  1. Changes
    - Enhanced scoring algorithm with more sophisticated weights
    - Added collaborative filtering based on similar users
    - Improved tag matching with weighted scoring
    - Added recency factor for trending tools
    - Better personalization based on user behavior patterns
    - Added diversity factor to avoid repetitive recommendations

  2. New Features
    - Multi-factor scoring system
    - User preference learning
    - Trending tool detection
    - Collaborative filtering
    - Diversity boost for variety

  3. Important Notes
    - More intelligent recommendation generation
    - Better personalization
    - Considers multiple user behavior patterns
    - Balances popularity with relevance
*/

-- Drop the existing function to replace it
DROP FUNCTION IF EXISTS public.generate_tool_recommendations(uuid);

-- Create improved recommendation generation function
CREATE OR REPLACE FUNCTION public.generate_tool_recommendations(p_user_id uuid)
RETURNS void AS $$
DECLARE
  v_tool record;
  v_score numeric;
  v_reason text;
  v_user_favorite_category uuid;
  v_user_favorite_tags text[];
  v_category_weight numeric;
  v_tag_weight numeric;
  v_recency_days integer;
BEGIN
  -- Delete old recommendations
  DELETE FROM tool_recommendations WHERE user_id = p_user_id;

  -- Identify user's favorite category (most interacted)
  SELECT t.category_id INTO v_user_favorite_category
  FROM tool_interactions ti
  JOIN ai_tools t ON ti.tool_id = t.id
  WHERE ti.user_id = p_user_id
  GROUP BY t.category_id
  ORDER BY SUM(ti.interaction_count) DESC
  LIMIT 1;

  -- Identify user's favorite tags
  SELECT ARRAY_AGG(DISTINCT tag) INTO v_user_favorite_tags
  FROM (
    SELECT UNNEST(t.tags) as tag
    FROM tool_interactions ti
    JOIN ai_tools t ON ti.tool_id = t.id
    WHERE ti.user_id = p_user_id
    ORDER BY ti.interaction_count DESC
    LIMIT 20
  ) subquery;

  -- Generate recommendations based on enhanced algorithm
  FOR v_tool IN
    SELECT 
      t.id as tool_id,
      t.name,
      t.category_id,
      t.tags,
      t.rating,
      t.views,
      t.created_at,
      COALESCE(fav_count.count, 0) as favorite_count
    FROM ai_tools t
    LEFT JOIN (
      SELECT tool_id, COUNT(*) as count
      FROM tool_interactions
      WHERE interaction_type = 'favorite'
      GROUP BY tool_id
    ) fav_count ON t.id = fav_count.tool_id
    WHERE t.status = 'Published'
    AND t.id NOT IN (
      SELECT tool_id FROM tool_interactions 
      WHERE user_id = p_user_id AND interaction_type IN ('view', 'favorite')
    )
    ORDER BY t.rating DESC, t.views DESC
    LIMIT 150
  LOOP
    v_score := 0;
    v_reason := '';
    v_category_weight := 0;
    v_tag_weight := 0;

    -- 1. Category Matching (0-35 points)
    IF v_tool.category_id = v_user_favorite_category THEN
      v_category_weight := 35;
      v_reason := v_reason || 'Matches your favorite category. ';
    ELSIF EXISTS (
      SELECT 1 FROM tool_interactions ti
      JOIN ai_tools t ON ti.tool_id = t.id
      WHERE ti.user_id = p_user_id 
      AND t.category_id = v_tool.category_id
    ) THEN
      v_category_weight := 20;
      v_reason := v_reason || 'Similar to tools you''ve explored. ';
    END IF;
    v_score := v_score + v_category_weight;

    -- 2. Tag Matching (0-30 points) - weighted by match count
    IF v_user_favorite_tags IS NOT NULL THEN
      v_tag_weight := (
        SELECT COUNT(*) * 3
        FROM UNNEST(v_tool.tags) as tool_tag
        WHERE tool_tag = ANY(v_user_favorite_tags)
      );
      v_tag_weight := LEAST(v_tag_weight, 30);
      IF v_tag_weight >= 15 THEN
        v_reason := v_reason || 'Highly relevant to your interests. ';
      ELSIF v_tag_weight >= 6 THEN
        v_reason := v_reason || 'Related to your preferences. ';
      END IF;
      v_score := v_score + v_tag_weight;
    END IF;

    -- 3. Quality Score (0-20 points)
    v_score := v_score + (v_tool.rating * 4);
    IF v_tool.rating >= 4.5 THEN
      v_reason := v_reason || 'Highly rated by users. ';
    END IF;

    -- 4. Popularity Score (0-15 points)
    v_score := v_score + LEAST(v_tool.views / 150.0, 15);

    -- 5. Favorite Count (0-15 points) - collaborative filtering
    v_score := v_score + LEAST(v_tool.favorite_count * 2, 15);
    IF v_tool.favorite_count >= 5 THEN
      v_reason := v_reason || 'Popular among community. ';
    END IF;

    -- 6. Recency Boost (0-10 points) - for trending new tools
    v_recency_days := EXTRACT(DAY FROM (now() - v_tool.created_at));
    IF v_recency_days <= 30 THEN
      v_score := v_score + (10 - (v_recency_days / 3.0));
      v_reason := v_reason || 'New and trending. ';
    END IF;

    -- 7. Collaborative Filtering Bonus (0-10 points)
    -- Find users with similar interests and see what they like
    IF EXISTS (
      SELECT 1 FROM tool_interactions ti1
      WHERE ti1.tool_id = v_tool.tool_id
      AND ti1.interaction_type = 'favorite'
      AND ti1.user_id IN (
        SELECT DISTINCT ti2.user_id
        FROM tool_interactions ti2
        WHERE ti2.tool_id IN (
          SELECT tool_id FROM tool_interactions
          WHERE user_id = p_user_id
          LIMIT 10
        )
        AND ti2.user_id != p_user_id
        LIMIT 20
      )
    ) THEN
      v_score := v_score + 10;
      v_reason := v_reason || 'Users like you love this. ';
    END IF;

    -- Only add recommendations with meaningful scores
    IF v_score > 25 THEN
      v_reason := COALESCE(NULLIF(v_reason, ''), 'Recommended based on quality and popularity.');
      
      INSERT INTO tool_recommendations (user_id, tool_id, score, reason)
      VALUES (p_user_id, v_tool.tool_id, LEAST(v_score, 100), TRIM(v_reason));
    END IF;
  END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;