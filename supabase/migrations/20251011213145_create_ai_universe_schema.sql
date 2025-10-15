/*
  # AI Universe Database Schema
  
  ## Overview
  Complete database schema for the AI Universe platform including tools, categories, news, reviews, and analytics.
  
  ## New Tables
  
  ### 1. categories
  - `id` (uuid, primary key) - Unique category identifier
  - `name` (text) - Category name (e.g., "Writing", "Image")
  - `slug` (text) - URL-friendly version
  - `icon` (text) - Lucide icon name
  - `description` (text) - Category description
  - `created_at` (timestamptz) - Creation timestamp
  
  ### 2. ai_tools
  - `id` (uuid, primary key) - Unique tool identifier
  - `name` (text) - Tool name
  - `slug` (text) - URL-friendly version
  - `description` (text) - Short description
  - `long_description` (text) - Detailed description
  - `logo_url` (text) - Tool logo/thumbnail URL
  - `website_url` (text) - Official website
  - `category_id` (uuid) - Foreign key to categories
  - `pricing_type` (text) - Free/Paid/Freemium/Trial
  - `rating` (numeric) - Average rating (0-5)
  - `views` (integer) - Number of views
  - `launch_date` (date) - Tool launch date
  - `featured` (boolean) - Is featured on homepage
  - `status` (text) - Published/Draft/Pending
  - `tags` (text[]) - Array of tags
  - `features` (text[]) - Key features list
  - `created_at` (timestamptz) - Creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp
  
  ### 3. ai_news
  - `id` (uuid, primary key) - Unique news identifier
  - `title` (text) - News headline
  - `description` (text) - Short description
  - `source_url` (text) - Link to original article
  - `source_name` (text) - News source name
  - `publication_date` (timestamptz) - When published
  - `featured` (boolean) - Show on homepage
  - `created_at` (timestamptz) - Creation timestamp
  
  ### 4. tool_reviews
  - `id` (uuid, primary key) - Unique review identifier
  - `tool_id` (uuid) - Foreign key to ai_tools
  - `user_name` (text) - Reviewer name
  - `user_email` (text) - Reviewer email
  - `rating` (integer) - Rating (1-5)
  - `comment` (text) - Review text
  - `approved` (boolean) - Admin approval status
  - `created_at` (timestamptz) - Creation timestamp
  
  ### 5. tool_submissions
  - `id` (uuid, primary key) - Unique submission identifier
  - `name` (text) - Tool name
  - `category` (text) - Category name
  - `description` (text) - Tool description
  - `website_url` (text) - Official website
  - `logo_url` (text) - Logo URL
  - `pricing_type` (text) - Pricing model
  - `submitter_email` (text) - Submitter contact
  - `status` (text) - Pending/Approved/Rejected
  - `created_at` (timestamptz) - Submission timestamp
  
  ### 6. site_analytics
  - `id` (uuid, primary key) - Unique record identifier
  - `date` (date) - Analytics date
  - `total_visits` (integer) - Daily visits
  - `tool_id` (uuid) - Tool viewed (nullable)
  - `country` (text) - Visitor country
  - `created_at` (timestamptz) - Creation timestamp
  
  ### 7. admin_users
  - `id` (uuid, primary key) - Unique admin identifier
  - `username` (text) - Admin username
  - `password_hash` (text) - Hashed password
  - `created_at` (timestamptz) - Creation timestamp
  
  ## Security
  - RLS enabled on all tables
  - Public read access for published content
  - Admin-only write access
  - Separate policies for submissions and reviews
*/

-- Create categories table
CREATE TABLE IF NOT EXISTS categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  icon text NOT NULL,
  description text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

-- Create ai_tools table
CREATE TABLE IF NOT EXISTS ai_tools (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  description text NOT NULL,
  long_description text DEFAULT '',
  logo_url text DEFAULT '',
  website_url text NOT NULL,
  category_id uuid REFERENCES categories(id) ON DELETE SET NULL,
  pricing_type text DEFAULT 'Free' CHECK (pricing_type IN ('Free', 'Paid', 'Freemium', 'Trial')),
  rating numeric DEFAULT 0 CHECK (rating >= 0 AND rating <= 5),
  views integer DEFAULT 0,
  launch_date date DEFAULT CURRENT_DATE,
  featured boolean DEFAULT false,
  status text DEFAULT 'Published' CHECK (status IN ('Published', 'Draft', 'Pending')),
  tags text[] DEFAULT '{}',
  features text[] DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create ai_news table
CREATE TABLE IF NOT EXISTS ai_news (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL,
  source_url text NOT NULL,
  source_name text DEFAULT '',
  publication_date timestamptz DEFAULT now(),
  featured boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Create tool_reviews table
CREATE TABLE IF NOT EXISTS tool_reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tool_id uuid REFERENCES ai_tools(id) ON DELETE CASCADE,
  user_name text NOT NULL,
  user_email text NOT NULL,
  rating integer CHECK (rating >= 1 AND rating <= 5),
  comment text DEFAULT '',
  approved boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Create tool_submissions table
CREATE TABLE IF NOT EXISTS tool_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  category text NOT NULL,
  description text NOT NULL,
  website_url text NOT NULL,
  logo_url text DEFAULT '',
  pricing_type text DEFAULT 'Free',
  submitter_email text DEFAULT '',
  status text DEFAULT 'Pending' CHECK (status IN ('Pending', 'Approved', 'Rejected')),
  created_at timestamptz DEFAULT now()
);

-- Create site_analytics table
CREATE TABLE IF NOT EXISTS site_analytics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  date date DEFAULT CURRENT_DATE,
  total_visits integer DEFAULT 0,
  tool_id uuid REFERENCES ai_tools(id) ON DELETE SET NULL,
  country text DEFAULT 'Unknown',
  created_at timestamptz DEFAULT now()
);

-- Create admin_users table
CREATE TABLE IF NOT EXISTS admin_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  username text UNIQUE NOT NULL,
  password_hash text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_tools ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_news ENABLE ROW LEVEL SECURITY;
ALTER TABLE tool_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE tool_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- RLS Policies for categories (public read)
CREATE POLICY "Anyone can view categories"
  ON categories FOR SELECT
  TO anon, authenticated
  USING (true);

-- RLS Policies for ai_tools (public read for published)
CREATE POLICY "Anyone can view published tools"
  ON ai_tools FOR SELECT
  TO anon, authenticated
  USING (status = 'Published');

-- RLS Policies for ai_news (public read)
CREATE POLICY "Anyone can view news"
  ON ai_news FOR SELECT
  TO anon, authenticated
  USING (true);

-- RLS Policies for tool_reviews (public read for approved)
CREATE POLICY "Anyone can view approved reviews"
  ON tool_reviews FOR SELECT
  TO anon, authenticated
  USING (approved = true);

CREATE POLICY "Anyone can submit reviews"
  ON tool_reviews FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- RLS Policies for tool_submissions (public insert)
CREATE POLICY "Anyone can submit tools"
  ON tool_submissions FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Anyone can view their submissions"
  ON tool_submissions FOR SELECT
  TO anon, authenticated
  USING (true);

-- RLS Policies for site_analytics (public read)
CREATE POLICY "Anyone can view analytics"
  ON site_analytics FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Anyone can log visits"
  ON site_analytics FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- RLS Policies for admin_users (restricted)
CREATE POLICY "Only admins can view admin_users"
  ON admin_users FOR SELECT
  TO authenticated
  USING (true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_ai_tools_category ON ai_tools(category_id);
CREATE INDEX IF NOT EXISTS idx_ai_tools_status ON ai_tools(status);
CREATE INDEX IF NOT EXISTS idx_ai_tools_featured ON ai_tools(featured);
CREATE INDEX IF NOT EXISTS idx_ai_tools_slug ON ai_tools(slug);
CREATE INDEX IF NOT EXISTS idx_tool_reviews_tool ON tool_reviews(tool_id);
CREATE INDEX IF NOT EXISTS idx_tool_reviews_approved ON tool_reviews(approved);
CREATE INDEX IF NOT EXISTS idx_analytics_date ON site_analytics(date);
CREATE INDEX IF NOT EXISTS idx_analytics_tool ON site_analytics(tool_id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for ai_tools
DROP TRIGGER IF EXISTS update_ai_tools_updated_at ON ai_tools;
CREATE TRIGGER update_ai_tools_updated_at
  BEFORE UPDATE ON ai_tools
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();