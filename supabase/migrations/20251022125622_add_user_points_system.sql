/*
  # Add User Points System
  
  This migration creates a points system for users to track rewards and credits.
  
  1. New Tables
    - `user_points`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users) - The user who owns the points
      - `total_points` (integer) - Total accumulated points
      - `available_points` (integer) - Points available to spend
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `points_transactions`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `amount` (integer) - Points added or removed (positive or negative)
      - `type` (text) - referral_bonus, signup_bonus, spent, reward_claim
      - `description` (text)
      - `reference_id` (uuid) - Reference to related record
      - `created_at` (timestamp)
  
  2. Security
    - Enable RLS on all tables
    - Users can read their own points
    - Only system can modify points through triggers
  
  3. Functions
    - Trigger to create user points entry on signup
    - Function to award points for referrals
    - Function to award signup bonus to new users
  
  4. Notes
    - New users get 100 welcome points
    - Referrers get 50 points per successful referral
    - Referred users get 25 bonus points
*/

-- Create user_points table
CREATE TABLE IF NOT EXISTS user_points (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  total_points integer DEFAULT 0,
  available_points integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE user_points ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own points"
  ON user_points FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Create points_transactions table
CREATE TABLE IF NOT EXISTS points_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  amount integer NOT NULL,
  type text NOT NULL,
  description text NOT NULL,
  reference_id uuid,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE points_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own transactions"
  ON points_transactions FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Function to create user points entry
CREATE OR REPLACE FUNCTION create_user_points_entry()
RETURNS TRIGGER AS $$
BEGIN
  BEGIN
    -- Create points entry with welcome bonus
    INSERT INTO user_points (user_id, total_points, available_points)
    VALUES (NEW.id, 100, 100);
    
    -- Record welcome bonus transaction
    INSERT INTO points_transactions (user_id, amount, type, description)
    VALUES (NEW.id, 100, 'signup_bonus', 'Welcome bonus for joining AI Universe!');
    
  EXCEPTION WHEN OTHERS THEN
    RAISE WARNING 'Failed to create points entry for user %: %', NEW.id, SQLERRM;
  END;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create points entry on user signup
DROP TRIGGER IF EXISTS create_points_on_signup ON auth.users;
CREATE TRIGGER create_points_on_signup
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION create_user_points_entry();

-- Update process_referral_rewards to award points
CREATE OR REPLACE FUNCTION process_referral_rewards()
RETURNS TRIGGER AS $$
DECLARE
  milestone_record RECORD;
  referrer_referrals integer;
  referred_user_email text;
BEGIN
  -- Get current referral count for referrer
  SELECT total_referrals INTO referrer_referrals
  FROM user_referrals
  WHERE user_id = NEW.referrer_id;
  
  -- Increment referral count
  UPDATE user_referrals
  SET total_referrals = total_referrals + 1,
      updated_at = now()
  WHERE user_id = NEW.referrer_id;
  
  referrer_referrals := referrer_referrals + 1;
  
  -- Award points to referrer (50 points per referral)
  UPDATE user_points
  SET total_points = total_points + 50,
      available_points = available_points + 50,
      updated_at = now()
  WHERE user_id = NEW.referrer_id;
  
  INSERT INTO points_transactions (user_id, amount, type, description, reference_id)
  VALUES (
    NEW.referrer_id,
    50,
    'referral_bonus',
    'Earned 50 points for referring a new user',
    NEW.id
  );
  
  -- Award bonus points to referred user (25 points)
  UPDATE user_points
  SET total_points = total_points + 25,
      available_points = available_points + 25,
      updated_at = now()
  WHERE user_id = NEW.referred_id;
  
  INSERT INTO points_transactions (user_id, amount, type, description, reference_id)
  VALUES (
    NEW.referred_id,
    25,
    'referral_bonus',
    'Bonus points for joining through a referral',
    NEW.id
  );
  
  -- Get referred user email for notification
  SELECT email INTO referred_user_email
  FROM auth.users
  WHERE id = NEW.referred_id;
  
  -- Create notification for referrer about new referral
  INSERT INTO notifications (user_id, type, title, message, link, read)
  VALUES (
    NEW.referrer_id,
    'referral',
    'New Referral! +50 Points',
    'Someone just signed up using your referral link! You now have ' || referrer_referrals || ' referral(s) and earned 50 points.',
    '/referrals',
    false
  );
  
  -- Create welcome notification for referred user
  INSERT INTO notifications (user_id, type, title, message, link, read)
  VALUES (
    NEW.referred_id,
    'welcome',
    'Welcome! +25 Bonus Points',
    'Thank you for joining through a referral! You received 25 bonus points. Explore our features and start discovering amazing AI tools.',
    '/explore',
    false
  );
  
  -- Check for milestone rewards
  FOR milestone_record IN 
    SELECT * FROM referral_milestones 
    WHERE referrals_count = referrer_referrals AND is_active = true
  LOOP
    -- Create reward entry
    INSERT INTO referral_rewards (
      user_id,
      reward_type,
      reward_name,
      reward_description,
      referrals_required,
      claimed
    ) VALUES (
      NEW.referrer_id,
      milestone_record.reward_type,
      milestone_record.reward_name,
      milestone_record.reward_description,
      milestone_record.referrals_count,
      false
    );
    
    -- Award milestone points if it's a points reward
    IF milestone_record.reward_type = 'points' THEN
      UPDATE user_points
      SET total_points = total_points + 500,
          available_points = available_points + 500,
          updated_at = now()
      WHERE user_id = NEW.referrer_id;
      
      INSERT INTO points_transactions (user_id, amount, type, description)
      VALUES (
        NEW.referrer_id,
        500,
        'reward_claim',
        'Milestone reward: ' || milestone_record.reward_name
      );
    END IF;
    
    -- Create milestone notification
    INSERT INTO notifications (user_id, type, title, message, link, read)
    VALUES (
      NEW.referrer_id,
      'reward',
      'Milestone Reached!',
      'Congratulations! You reached ' || milestone_record.referrals_count || ' referrals and unlocked: ' || milestone_record.reward_name,
      '/referrals',
      false
    );
    
    -- Auto-apply subscription upgrades
    IF milestone_record.reward_type = 'subscription_upgrade' THEN
      IF milestone_record.referrals_count = 3 THEN
        -- Upgrade to Plus
        UPDATE user_profiles
        SET subscription_plan = 'plus',
            subscription_status = 'active',
            updated_at = now()
        WHERE id = NEW.referrer_id;
      ELSIF milestone_record.referrals_count = 100 THEN
        -- Upgrade to Pro lifetime
        UPDATE user_profiles
        SET subscription_plan = 'pro',
            subscription_status = 'active',
            updated_at = now()
        WHERE id = NEW.referrer_id;
      END IF;
      
      -- Mark as claimed since it's auto-applied
      UPDATE referral_rewards
      SET claimed = true,
          claimed_at = now()
      WHERE user_id = NEW.referrer_id
        AND referrals_required = milestone_record.referrals_count;
    END IF;
  END LOOP;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_user_points_user ON user_points(user_id);
CREATE INDEX IF NOT EXISTS idx_points_transactions_user ON points_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_points_transactions_created ON points_transactions(created_at DESC);

-- Create points entries for existing users
INSERT INTO user_points (user_id, total_points, available_points)
SELECT 
  u.id,
  100,
  100
FROM auth.users u
LEFT JOIN user_points up ON u.id = up.user_id
WHERE up.id IS NULL
ON CONFLICT (user_id) DO NOTHING;