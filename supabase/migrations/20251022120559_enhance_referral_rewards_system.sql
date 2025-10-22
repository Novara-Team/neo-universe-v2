/*
  # Enhance Referral Rewards System

  1. Changes
    - Add instant rewards for both referrer and referee
    - Add more milestone rewards at different levels
    - Create function to grant instant rewards to both parties
    - Update referral tracking to handle referee rewards
    - Add notification creation for referral rewards

  2. New Rewards Structure
    - Instant rewards when someone uses your code (both parties benefit)
    - More milestones at 2, 7, 20, 35, 60, 80, 150, 200 referrals
    - Better reward progression

  3. Security
    - Maintains existing RLS policies
    - Uses SECURITY DEFINER for automated reward processing
*/

-- Add more milestones
INSERT INTO referral_milestones (referrals_count, reward_type, reward_name, reward_description, is_active)
VALUES
  (2, 'points', 'Early Adopter', 'Receive 100 bonus points for your second successful referral!', true),
  (7, 'badge', 'Growth Leader', 'You are spreading the word! Keep growing your network.', true),
  (20, 'feature_unlock', 'Advanced Analytics', 'Unlock advanced analytics dashboard for your dedication.', true),
  (35, 'points', 'Power Referrer', 'Receive 1000 bonus points! Your network is impressive.', true),
  (60, 'badge', 'Elite Ambassador', 'You are an elite ambassador! Your influence is outstanding.', true),
  (80, 'feature_unlock', 'Custom Branding', 'Unlock custom branding features for your profile.', true),
  (150, 'subscription_upgrade', 'Premium Pro', 'Upgrade to Premium Pro with all features unlocked!', true),
  (200, 'badge', 'Legend Status', 'You are a legend! Thank you for building this amazing community.', true)
ON CONFLICT (referrals_count) DO NOTHING;

-- Function to create notification for user
CREATE OR REPLACE FUNCTION create_referral_reward_notification(
  p_user_id uuid,
  p_reward_name text,
  p_reward_description text
)
RETURNS void AS $$
BEGIN
  INSERT INTO notifications (user_id, type, title, message, link)
  VALUES (
    p_user_id,
    'reward',
    '🎉 New Reward Unlocked!',
    'You earned: ' || p_reward_name || ' - ' || p_reward_description,
    '/referrals'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to grant instant rewards
CREATE OR REPLACE FUNCTION grant_instant_referral_rewards()
RETURNS TRIGGER AS $$
BEGIN
  -- Grant reward to referrer (person who shared the link)
  INSERT INTO referral_rewards (
    user_id,
    reward_type,
    reward_name,
    reward_description,
    referrals_required,
    claimed,
    claimed_at
  ) VALUES (
    NEW.referrer_id,
    'points',
    'Referral Bonus',
    'Thank you for sharing! You earned 50 points.',
    0,
    true,
    now()
  );
  
  -- Create notification for referrer
  PERFORM create_referral_reward_notification(
    NEW.referrer_id,
    'Referral Bonus',
    'Thank you for sharing! You earned 50 points.'
  );
  
  -- Grant reward to referee (person who used the link)
  INSERT INTO referral_rewards (
    user_id,
    reward_type,
    reward_name,
    reward_description,
    referrals_required,
    claimed,
    claimed_at
  ) VALUES (
    NEW.referred_id,
    'points',
    'Welcome Bonus',
    'Welcome! You earned 25 points for joining through a referral.',
    0,
    true,
    now()
  );
  
  -- Create notification for referee
  PERFORM create_referral_reward_notification(
    NEW.referred_id,
    'Welcome Bonus',
    'Welcome! You earned 25 points for joining through a referral.'
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for instant rewards
DROP TRIGGER IF EXISTS grant_instant_rewards_on_referral ON referral_tracking;
CREATE TRIGGER grant_instant_rewards_on_referral
  AFTER INSERT ON referral_tracking
  FOR EACH ROW
  WHEN (NEW.status = 'completed')
  EXECUTE FUNCTION grant_instant_referral_rewards();

-- Update the process_referral_rewards function to add notifications
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
    
    -- Create notification for milestone reward
    PERFORM create_referral_reward_notification(
      NEW.referrer_id,
      milestone_record.reward_name,
      milestone_record.reward_description
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
      ELSIF milestone_record.referrals_count = 150 THEN
        -- Upgrade to Premium Pro
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
