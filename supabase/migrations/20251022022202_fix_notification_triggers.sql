/*
  # Fix Notification Triggers
  
  1. Issues Fixed
    - Remove reference to non-existent `submitted_by` field in ai_tools table
    - Fix reference to `content` field (should be `description`) in ai_news table
  
  2. Changes
    - Update `notify_users_new_tool` function to remove submitted_by check
    - Update `notify_users_new_news_article` function to use description field
*/

-- Fix the tool notification function
CREATE OR REPLACE FUNCTION notify_users_new_tool()
RETURNS TRIGGER AS $$
BEGIN
  -- Only trigger when a tool is newly published
  IF (TG_OP = 'INSERT' AND NEW.status = 'Published') OR 
     (TG_OP = 'UPDATE' AND OLD.status != 'Published' AND NEW.status = 'Published') THEN
    
    -- Insert notifications for all users
    INSERT INTO notifications (user_id, type, title, message, link, metadata)
    SELECT 
      id,
      'new_tool',
      '🚀 New AI Tool: ' || NEW.name,
      'Check out ' || NEW.name || ', a new ' || NEW.pricing_type || ' tool that was just added to our directory!',
      '/tool/' || NEW.slug,
      jsonb_build_object('tool_id', NEW.id, 'tool_name', NEW.name)
    FROM user_profiles;
    
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fix the news notification function
CREATE OR REPLACE FUNCTION notify_users_new_news_article()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert notifications for all users
  INSERT INTO notifications (user_id, type, title, message, link, metadata)
  SELECT 
    id,
    'new_news',
    '📰 Latest News: ' || NEW.title,
    LEFT(NEW.description, 150) || '...',
    '/news/' || NEW.id,
    jsonb_build_object('news_id', NEW.id, 'news_title', NEW.title)
  FROM user_profiles;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;