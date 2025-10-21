/*
  # Add User ID to Tool Submissions

  1. Changes
    - Add `user_id` column to `tool_submissions` table to track submitters
    - This enables sending notifications to users when their submissions are updated

  2. Security
    - No RLS changes needed as existing policies cover this column
*/

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'tool_submissions' AND column_name = 'user_id'
  ) THEN
    ALTER TABLE tool_submissions ADD COLUMN user_id uuid REFERENCES user_profiles(id) ON DELETE SET NULL;
  END IF;
END $$;

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_tool_submissions_user_id ON tool_submissions(user_id);
