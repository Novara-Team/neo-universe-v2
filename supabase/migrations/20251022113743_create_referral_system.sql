/*
  # Create Referral System

  1. New Tables
    - `user_referrals`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users) - The user who owns the referral code
      - `referral_code` (text, unique) - Unique referral code for each user
      - `total_referrals` (integer) - Total number of successful referrals
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `referral_tracking`
      - `id` (uuid, primary key)
      - `referrer_id` (uuid, references auth.users) - User who referred
      - `referred_id` (uuid, references auth.users) - User who was referred
      - `referral_code` (text) - Code used for referral
      - `status` (text) - pending, completed
      - `created_at` (timestamp)
    
    - `referral_rewards`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `reward_type` (text) - badge, feature_unlock, subscription_upgrade, points
      - `reward_name` (text)
      - `reward_description` (text)
      - `referrals_required` (integer) - Number of referrals needed
      - `claimed` (boolean)
      - `claimed_at` (timestamp)
      - `created_at` (timestamp)
    
    - `referral_milestones`
      - `id` (uuid, primary key)
      - `referrals_count` (integer, unique) - Number of referrals for this milestone
      - `reward_type` (text)
      - `reward_name` (text)
      - `reward_description` (text)
      - `is_active` (boolean)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Users can read their own referral data
    - Users can create referral tracking entries
    - Users can read all active milestones
    - Users can read their own rewards
    
  3. Functions
    - Function to generate unique referral codes
    - Trigger to create user referral entry on signup
    - Function to process referral rewards
    
  4. Notes
    - Referral codes are automatically generated for each user
    - Users get rewards at 1, 3, 5, 10, 25, 50, 100 referrals
    - At 3 referrals, users automatically get Plus plan
    - System tracks both pending and completed referrals
*/

-- Create user_referrals table
CREATE TABLE IF NOT EXISTS user_referrals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  referral_code text UNIQUE NOT NULL,
  total_referrals integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE user_referrals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own referral data"
  ON user_referrals FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own referral data"
  ON user_referrals FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create referral_tracking table
CREATE TABLE IF NOT EXISTS referral_tracking (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  referred_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  referral_code text NOT NULL,
  status text DEFAULT 'completed',
  created_at timestamptz DEFAULT now(),
  UNIQUE(referred_id)
);

ALTER TABLE referral_tracking ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their referral tracking"
  ON referral_tracking FOR SELECT
  TO authenticated
  USING (auth.uid() = referrer_id OR auth.uid() = referred_id);

CREATE POLICY "Anyone can insert referral tracking"
  ON referral_tracking FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Create referral_rewards table
CREATE TABLE IF NOT EXISTS referral_rewards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  reward_type text NOT NULL,
  reward_name text NOT NULL,
  reward_description text NOT NULL,
  referrals_required integer NOT NULL,
  claimed boolean DEFAULT false,
  claimed_at timestamptz,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE referral_rewards ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own rewards"
  ON referral_rewards FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Create referral_milestones table
CREATE TABLE IF NOT EXISTS referral_milestones (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  referrals_count integer UNIQUE NOT NULL,
  reward_type text NOT NULL,
  reward_name text NOT NULL,
  reward_description text NOT NULL,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE referral_milestones ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active milestones"
  ON referral_milestones FOR SELECT
  TO authenticated
  USING (is_active = true);

-- Insert default milestones
INSERT INTO referral_milestones (referrals_count, reward_type, reward_name, reward_description, is_active)
VALUES
  (1, 'badge', 'First Referral', 'You made your first referral! Welcome to the community builder club.', true),
  (3, 'subscription_upgrade', 'Plus Plan Access', 'Unlock Plus plan with unlimited features! You are now a valued contributor.', true),
  (5, 'badge', 'Community Champion', 'You are building an amazing community! Keep up the great work.', true),
  (10, 'feature_unlock', 'Priority Support', 'Get priority support and faster response times for your dedication.', true),
  (15, 'points', 'Bonus Points', 'Receive 500 bonus points to use in our rewards store.', true),
  (25, 'badge', 'Super Referrer', 'You are a referral superstar! Your network is growing impressively.', true),
  (50, 'feature_unlock', 'Pro Features', 'Unlock exclusive Pro features including advanced analytics and custom collections.', true),
  (75, 'badge', 'Referral Master', 'You have mastered the art of referrals! Your influence is remarkable.', true),
  (100, 'subscription_upgrade', 'Lifetime Pro', 'Congratulations! Enjoy lifetime Pro access for your outstanding contribution.', true)
ON CONFLICT (referrals_count) DO NOTHING;

-- Function to generate unique referral code
CREATE OR REPLACE FUNCTION generate_referral_code()
RETURNS text AS $$
DECLARE
  code text;
  exists boolean;
BEGIN
  LOOP
    code := upper(substring(md5(random()::text) from 1 for 8));
    
    SELECT EXISTS(SELECT 1 FROM user_referrals WHERE referral_code = code) INTO exists;
    
    IF NOT exists THEN
      RETURN code;
    END IF;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Function to create user referral entry
CREATE OR REPLACE FUNCTION create_user_referral_entry()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO user_referrals (user_id, referral_code)
  VALUES (NEW.id, generate_referral_code());
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create referral entry on user signup
DROP TRIGGER IF EXISTS create_referral_on_signup ON auth.users;
CREATE TRIGGER create_referral_on_signup
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION create_user_referral_entry();

-- Function to process referral rewards
CREATE OR REPLACE FUNCTION process_referral_rewards()
RETURNS TRIGGER AS $$
DECLARE
  milestone_record RECORD;
  referrer_referrals integer;
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
    
    -- Auto-apply subscription upgrades
    IF milestone_record.reward_type = 'subscription_upgrade' THEN
      IF milestone_record.referrals_count = 3 THEN
        -- Upgrade to Plus
        UPDATE user_subscriptions
        SET plan = 'plus',
            status = 'active',
            updated_at = now()
        WHERE user_id = NEW.referrer_id;
      ELSIF milestone_record.referrals_count = 100 THEN
        -- Upgrade to Pro lifetime
        UPDATE user_subscriptions
        SET plan = 'pro',
            status = 'active',
            updated_at = now()
        WHERE user_id = NEW.referrer_id;
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

-- Trigger to process rewards when referral is completed
DROP TRIGGER IF EXISTS process_rewards_on_referral ON referral_tracking;
CREATE TRIGGER process_rewards_on_referral
  AFTER INSERT ON referral_tracking
  FOR EACH ROW
  WHEN (NEW.status = 'completed')
  EXECUTE FUNCTION process_referral_rewards();

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_user_referrals_code ON user_referrals(referral_code);
CREATE INDEX IF NOT EXISTS idx_referral_tracking_referrer ON referral_tracking(referrer_id);
CREATE INDEX IF NOT EXISTS idx_referral_tracking_referred ON referral_tracking(referred_id);
CREATE INDEX IF NOT EXISTS idx_referral_rewards_user ON referral_rewards(user_id);
