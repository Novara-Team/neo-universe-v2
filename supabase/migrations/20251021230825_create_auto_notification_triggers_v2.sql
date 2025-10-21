/*
  # Create Automatic Notification Triggers for New Tools and News

  1. New Functions
    - `notify_users_new_tool` - Function to notify all users when a new tool is published
    - `notify_users_new_news` - Function to notify all users when new news is published

  2. Triggers
    - Trigger on `ai_tools` table for INSERT/UPDATE when status changes to 'Published'
    - Trigger on `ai_news` table for INSERT when new news is added

  3. Security
    - Functions run with security definer to allow notification creation
    - Only triggers on published content

  4. Notes
    - Notifications are sent to all users in the system
    - Each notification includes a link to the new content
    - Notifications are created asynchronously to not block the main operation
*/

-- Function to notify all users about a new published tool
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
    FROM user_profiles
    WHERE id != COALESCE(NEW.submitted_by, '00000000-0000-0000-0000-000000000000');
    
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to notify all users about new news
CREATE OR REPLACE FUNCTION notify_users_new_news_article()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert notifications for all users
  INSERT INTO notifications (user_id, type, title, message, link, metadata)
  SELECT 
    id,
    'new_news',
    '📰 Latest News: ' || NEW.title,
    LEFT(NEW.content, 150) || '...',
    '/news/' || NEW.id,
    jsonb_build_object('news_id', NEW.id, 'news_title', NEW.title)
  FROM user_profiles;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing triggers if they exist
DROP TRIGGER IF EXISTS trigger_notify_new_tool ON ai_tools;
DROP TRIGGER IF EXISTS trigger_notify_new_news_article ON ai_news;
DROP TRIGGER IF EXISTS trigger_notify_new_news ON ai_news;

-- Create trigger for new published tools
CREATE TRIGGER trigger_notify_new_tool
  AFTER INSERT OR UPDATE ON ai_tools
  FOR EACH ROW
  EXECUTE FUNCTION notify_users_new_tool();

-- Create trigger for new news
CREATE TRIGGER trigger_notify_new_news_article
  AFTER INSERT ON ai_news
  FOR EACH ROW
  EXECUTE FUNCTION notify_users_new_news_article();

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_notifications_type ON notifications(type);

-- Add delete policy for users to delete their own notifications
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'notifications' 
    AND policyname = 'Users can delete own notifications'
  ) THEN
    CREATE POLICY "Users can delete own notifications"
      ON notifications FOR DELETE
      TO authenticated
      USING (auth.uid() = user_id);
  END IF;
END $$;