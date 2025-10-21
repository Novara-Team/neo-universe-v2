/*
  # Add Demo Status to AI Tools

  1. Changes
    - Update status CHECK constraint to include 'Demo' status
    - Demo tools are only visible to Pro plan users
    - Update RLS policies to restrict demo tool access

  2. Security
    - Update RLS policy to check user subscription plan
    - Demo tools only visible to pro users

  3. Important Notes
    - Demo status allows admins to create tools visible only to Pro users
    - Free and Plus users cannot see Demo tools
*/

-- Drop existing constraint and add new one with Demo status
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.constraint_column_usage
    WHERE table_name = 'ai_tools' AND constraint_name = 'ai_tools_status_check'
  ) THEN
    ALTER TABLE ai_tools DROP CONSTRAINT ai_tools_status_check;
  END IF;
END $$;

ALTER TABLE ai_tools ADD CONSTRAINT ai_tools_status_check 
  CHECK (status IN ('Published', 'Draft', 'Pending', 'Demo'));

-- Drop existing policy
DROP POLICY IF EXISTS "Anyone can view published tools" ON ai_tools;

-- Create new policy that allows viewing published tools and demo tools for pro users
CREATE POLICY "Anyone can view published tools"
  ON ai_tools FOR SELECT
  TO anon, authenticated
  USING (
    status = 'Published' 
    OR (
      status = 'Demo' 
      AND EXISTS (
        SELECT 1 FROM user_profiles 
        WHERE id = auth.uid() 
        AND subscription_plan = 'pro'
      )
    )
  );
