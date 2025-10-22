/*
  # Add Referral Notifications
  
  This migration enhances the referral system to send notifications.
  
  1. Changes
    - Update process_referral_rewards function to create notifications
    - Send notification to referrer when they get a new referral
    - Send notification for milestone rewards
    - Send welcome notification to referred user
  
  2. Notifications Created
    - "New Referral" notification for referrer
    - "Milestone Reached" notification for reward achievements
    - "Welcome Bonus" notification for referred user
*/

-- Update the process_referral_rewards function to include notifications
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
  
  -- Get referred user email for notification
  SELECT email INTO referred_user_email
  FROM auth.users
  WHERE id = NEW.referred_id;
  
  -- Create notification for referrer about new referral
  INSERT INTO notifications (user_id, type, title, message, link, read)
  VALUES (
    NEW.referrer_id,
    'referral',
    'New Referral!',
    'Someone just signed up using your referral link! You now have ' || referrer_referrals || ' referral(s).',
    '/referrals',
    false
  );
  
  -- Create welcome notification for referred user
  INSERT INTO notifications (user_id, type, title, message, link, read)
  VALUES (
    NEW.referred_id,
    'welcome',
    'Welcome to AI Universe!',
    'Thank you for joining through a referral! Explore our features and start discovering amazing AI tools.',
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