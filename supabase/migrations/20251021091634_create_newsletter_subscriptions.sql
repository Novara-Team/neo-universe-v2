/*
  # Create Newsletter Subscriptions Table

  1. New Tables
    - `newsletter_subscriptions`
      - `id` (uuid, primary key)
      - `email` (text, unique, not null)
      - `subscribed_at` (timestamptz)
      - `is_active` (boolean, default true)
      - `source` (text, where they subscribed from)
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on newsletter_subscriptions
    - Allow anonymous inserts for new subscriptions
    - Only admins can view/update subscriptions

  3. Performance
    - Add index on email for fast lookups
    - Add index on is_active for filtering
*/

-- Create newsletter_subscriptions table
CREATE TABLE IF NOT EXISTS newsletter_subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  subscribed_at timestamptz DEFAULT now(),
  is_active boolean DEFAULT true,
  source text DEFAULT 'website',
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE newsletter_subscriptions ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Anyone can subscribe to newsletter" ON newsletter_subscriptions;
DROP POLICY IF EXISTS "Only service role can view subscriptions" ON newsletter_subscriptions;

-- Policies for newsletter_subscriptions
CREATE POLICY "Anyone can subscribe to newsletter"
  ON newsletter_subscriptions FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Only service role can view subscriptions"
  ON newsletter_subscriptions FOR SELECT
  TO authenticated
  USING (false);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_newsletter_subscriptions_email ON newsletter_subscriptions(email);
CREATE INDEX IF NOT EXISTS idx_newsletter_subscriptions_is_active ON newsletter_subscriptions(is_active);
CREATE INDEX IF NOT EXISTS idx_newsletter_subscriptions_created_at ON newsletter_subscriptions(created_at DESC);
