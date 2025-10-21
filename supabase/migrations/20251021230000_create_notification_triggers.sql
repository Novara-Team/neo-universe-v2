/*
  # Create Notification Triggers

  1. Trigger Functions
    - Function to notify all users when a new tool is published
    - Function to notify all users when new news is published

  2. Triggers
    - Trigger on ai_tools INSERT/UPDATE for status change to 'Published'
    - Trigger on news_articles INSERT for new articles

  3. Notes
    - Notifications are sent to all active users
    - System automatically creates notifications when content is published
*/

-- Function to notify users about new tools
CREATE OR REPLACE FUNCTION notify_new_tool()
RETURNS trigger AS $$
BEGIN
  -- Only send notification if the tool is newly published
  IF (TG_OP = 'INSERT' AND NEW.status = 'Published') OR
     (TG_OP = 'UPDATE' AND OLD.status != 'Published' AND NEW.status = 'Published') THEN

    -- Insert notification for all users
    INSERT INTO notifications (user_id, type, title, message, link, metadata)
    SELECT
      id,
      'new_tool',
      'New AI Tool Added!',
      'Check out ' || NEW.name || ' - ' || LEFT(NEW.description, 100) || '...',
      '/tools/' || NEW.id,
      jsonb_build_object('tool_id', NEW.id, 'tool_name', NEW.name)
    FROM user_profiles;

  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to notify users about new news articles
CREATE OR REPLACE FUNCTION notify_new_news()
RETURNS trigger AS $$
BEGIN
  -- Insert notification for all users when a new article is added
  INSERT INTO notifications (user_id, type, title, message, link, metadata)
  SELECT
    id,
    'new_news',
    'New Article Published!',
    NEW.title,
    '/news/' || NEW.id,
    jsonb_build_object('news_id', NEW.id, 'title', NEW.title)
  FROM user_profiles;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop existing triggers if they exist
DROP TRIGGER IF EXISTS trigger_notify_new_tool ON ai_tools;
DROP TRIGGER IF EXISTS trigger_notify_new_news ON ai_news;

-- Create trigger for new tools
CREATE TRIGGER trigger_notify_new_tool
  AFTER INSERT OR UPDATE OF status ON ai_tools
  FOR EACH ROW
  EXECUTE FUNCTION notify_new_tool();

-- Create trigger for new news
CREATE TRIGGER trigger_notify_new_news
  AFTER INSERT ON ai_news
  FOR EACH ROW
  EXECUTE FUNCTION notify_new_news();
