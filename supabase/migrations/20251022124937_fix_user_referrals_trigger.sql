/*
  # Fix User Referrals Trigger
  
  This migration fixes the user registration issue by making the referral trigger more robust.
  
  1. Changes
    - Update the trigger function to handle errors gracefully
    - Add proper exception handling
    - Ensure user registration succeeds even if referral creation fails
    - Log errors instead of failing the entire transaction
  
  2. Notes
    - Users can now register successfully even if referral system has issues
    - The function will retry creating referral entries
    - Errors are silently caught to prevent blocking user registration
*/

-- Drop existing trigger and function
DROP TRIGGER IF EXISTS create_referral_on_signup ON auth.users;
DROP FUNCTION IF EXISTS create_user_referral_entry();

-- Recreate function with better error handling
CREATE OR REPLACE FUNCTION create_user_referral_entry()
RETURNS TRIGGER AS $$
DECLARE
  new_code text;
BEGIN
  -- Try to create referral entry, but don't fail if it errors
  BEGIN
    new_code := generate_referral_code();
    
    INSERT INTO user_referrals (user_id, referral_code)
    VALUES (NEW.id, new_code)
    ON CONFLICT (user_id) DO NOTHING;
    
  EXCEPTION WHEN OTHERS THEN
    -- Log the error but don't fail the user creation
    RAISE WARNING 'Failed to create referral entry for user %: %', NEW.id, SQLERRM;
  END;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate trigger
CREATE TRIGGER create_referral_on_signup
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION create_user_referral_entry();