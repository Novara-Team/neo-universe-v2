/*
  # Fix User Referrals Insert Policy

  1. Changes
    - Add INSERT policy for user_referrals table
    - Allow authenticated users to create their own referral entry
  
  2. Security
    - Users can only insert their own referral data (user_id must match auth.uid())
*/

-- Add INSERT policy for user_referrals
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'user_referrals' 
    AND policyname = 'Users can insert own referral data'
  ) THEN
    CREATE POLICY "Users can insert own referral data"
      ON user_referrals FOR INSERT
      TO authenticated
      WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;
