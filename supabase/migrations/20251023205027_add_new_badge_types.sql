/*
  # Add New Badge Types to User Profiles
  
  1. Changes
    - Expand custom_badge column to include new badge types:
      - 'noob' - For new users
      - 'friend' - For friend referrals/special connections
      - 'contributor' - For active contributors
      - 'expert' - For expert users
      - 'verified' - For verified users
    - Existing badges: 'owner', 'team'
  
  2. Security
    - No RLS changes needed as existing policies cover this column
    - Only admins should modify custom_badge field (enforced in application)
*/

DO $$ 
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'user_profiles' AND column_name = 'custom_badge'
  ) THEN
    ALTER TABLE user_profiles 
    DROP CONSTRAINT IF EXISTS user_profiles_custom_badge_check;
    
    ALTER TABLE user_profiles 
    ADD CONSTRAINT user_profiles_custom_badge_check 
    CHECK (custom_badge IN ('owner', 'team', 'noob', 'friend', 'contributor', 'expert', 'verified'));
  END IF;
END $$;