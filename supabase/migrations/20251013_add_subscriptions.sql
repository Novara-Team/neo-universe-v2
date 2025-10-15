/*
  # Add Subscription System

  1. New Tables
    - `user_profiles`
      - `id` (uuid, primary key, references auth.users)
      - `email` (text)
      - `full_name` (text, nullable)
      - `subscription_plan` (text, default 'free')
      - `stripe_customer_id` (text, nullable)
      - `stripe_subscription_id` (text, nullable)
      - `subscription_status` (text, default 'active')
      - `subscription_end_date` (timestamptz, nullable)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

    - `user_favorites`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references user_profiles)
      - `tool_id` (uuid, references tools)
      - `created_at` (timestamptz)

    - `subscription_plans`
      - `id` (uuid, primary key)
      - `name` (text)
      - `slug` (text, unique)
      - `price_monthly` (numeric)
      - `stripe_price_id` (text, nullable)
      - `features` (jsonb)
      - `limits` (jsonb)
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on all new tables
    - Add policies for users to read/update their own profiles
    - Add policies for favorites management
    - Add read-only access to subscription plans

  3. Important Notes
    - User profiles are created automatically via trigger when auth.users record is created
    - Free plan has limited features (100 tools, 3 favorites, top 5 news)
    - Plus plan ($7-9/month) unlocks most features
    - Pro plan ($19-29/month) unlocks everything including analytics
*/

-- Create user_profiles table
CREATE TABLE IF NOT EXISTS user_profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  full_name text,
  subscription_plan text DEFAULT 'free' CHECK (subscription_plan IN ('free', 'plus', 'pro')),
  stripe_customer_id text UNIQUE,
  stripe_subscription_id text,
  subscription_status text DEFAULT 'active' CHECK (subscription_status IN ('active', 'cancelled', 'past_due', 'trialing')),
  subscription_end_date timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create user_favorites table
CREATE TABLE IF NOT EXISTS user_favorites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  tool_id uuid NOT NULL REFERENCES tools(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, tool_id)
);

-- Create subscription_plans table
CREATE TABLE IF NOT EXISTS subscription_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  price_monthly numeric DEFAULT 0,
  stripe_price_id text,
  features jsonb DEFAULT '[]'::jsonb,
  limits jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

-- Insert default subscription plans
INSERT INTO subscription_plans (name, slug, price_monthly, features, limits) VALUES
(
  'Explorer',
  'free',
  0,
  '["Access up to 100 AI tools only", "Read reviews (but can''t write them)", "Save up to 3 favorite tools", "Monthly email updates", "Limited access to AI News (Top 5 only)"]'::jsonb,
  '{"max_tools": 100, "max_favorites": 3, "max_news": 5, "can_write_reviews": false, "can_compare": false, "can_submit": false}'::jsonb
),
(
  'Creator',
  'plus',
  7,
  '["Full access to all AI tools", "Use AI Tool Comparison page", "Add reviews & comments", "Unlimited favorites", "Full AI News + \"AI of the Week\"", "Create & share \"Collections\" of tools", "Weekly email updates", "Can submit new tools (pending admin review)", "\"Plus Member\" badge"]'::jsonb,
  '{"max_tools": null, "max_favorites": null, "max_news": null, "can_write_reviews": true, "can_compare": true, "can_submit": true}'::jsonb
),
(
  'Universe Master',
  'pro',
  19,
  '["Everything in Plus Plan", "Personal Analytics Dashboard", "Smart AI Recommendations", "Exclusive Weekly Newsletter", "Export reports (CSV / PDF)", "Priority support", "Exclusive discounts on premium AI tools", "\"PRO Member\" golden badge", "Access to Beta Tools before public"]'::jsonb,
  '{"max_tools": null, "max_favorites": null, "max_news": null, "can_write_reviews": true, "can_compare": true, "can_submit": true, "has_analytics": true, "has_recommendations": true, "priority_support": true}'::jsonb
)
ON CONFLICT (slug) DO NOTHING;

-- Enable RLS
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscription_plans ENABLE ROW LEVEL SECURITY;

-- Policies for user_profiles
CREATE POLICY "Users can view own profile"
  ON user_profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON user_profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Policies for user_favorites
CREATE POLICY "Users can view own favorites"
  ON user_favorites FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own favorites"
  ON user_favorites FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own favorites"
  ON user_favorites FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Policies for subscription_plans (read-only for everyone)
CREATE POLICY "Anyone can view subscription plans"
  ON subscription_plans FOR SELECT
  TO authenticated, anon
  USING (true);

-- Function to create user profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.user_profiles (id, email, full_name)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', '')
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for updated_at on user_profiles
DROP TRIGGER IF EXISTS on_user_profiles_updated ON user_profiles;
CREATE TRIGGER on_user_profiles_updated
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_profiles_stripe_customer ON user_profiles(stripe_customer_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_subscription_plan ON user_profiles(subscription_plan);
CREATE INDEX IF NOT EXISTS idx_user_favorites_user_id ON user_favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_user_favorites_tool_id ON user_favorites(tool_id);
