/*
  # Add Custom Badge System

  1. Changes
    - Add `custom_badge` column to user_profiles table to store special badges like Owner/CEO, Team, etc.
    - The badge will override the default Pro/Plus badge display
    - Badge types: 'owner', 'team', null (default shows Pro/Plus if applicable)

  2. Security
    - No RLS changes needed as existing policies cover this column
    - Only admins should be able to modify custom_badge field (enforce in application logic)
*/

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'user_profiles' AND column_name = 'custom_badge'
  ) THEN
    ALTER TABLE user_profiles ADD COLUMN custom_badge TEXT CHECK (custom_badge IN ('owner', 'team'));
  END IF;
END $$;
