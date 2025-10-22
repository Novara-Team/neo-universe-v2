/*
  # AI Tool Benchmarks System

  1. New Tables
    - `tool_benchmarks`
      - `id` (uuid, primary key)
      - `tool_id` (uuid, foreign key to ai_tools)
      - `benchmark_name` (text) - Name of the benchmark test
      - `benchmark_category` (text) - Category: speed, accuracy, cost, quality
      - `score` (numeric) - Score out of 100
      - `test_description` (text) - Description of the test
      - `test_date` (timestamptz) - When the test was performed
      - `metrics` (jsonb) - Additional metrics data
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

    - `user_submitted_benchmarks`
      - `id` (uuid, primary key)
      - `tool_id` (uuid, foreign key to ai_tools)
      - `user_id` (uuid, foreign key to user_profiles)
      - `benchmark_name` (text)
      - `score` (numeric)
      - `test_description` (text)
      - `test_results` (jsonb)
      - `status` (text) - pending, approved, rejected
      - `created_at` (timestamptz)

    - `benchmark_reports`
      - `id` (uuid, primary key)
      - `tool_id` (uuid, foreign key to ai_tools)
      - `user_id` (uuid, foreign key to user_profiles)
      - `report_type` (text) - comparison, performance, historical
      - `report_data` (jsonb)
      - `generated_at` (timestamptz)

  2. Security
    - Enable RLS on all tables
    - Public can read approved benchmarks
    - Authenticated users can submit benchmarks
    - Only Pro users can generate reports
*/

CREATE TABLE IF NOT EXISTS tool_benchmarks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tool_id uuid REFERENCES ai_tools(id) ON DELETE CASCADE,
  benchmark_name text NOT NULL,
  benchmark_category text NOT NULL CHECK (benchmark_category IN ('speed', 'accuracy', 'cost', 'quality', 'reliability')),
  score numeric(5,2) NOT NULL CHECK (score >= 0 AND score <= 100),
  test_description text NOT NULL,
  test_date timestamptz DEFAULT now(),
  metrics jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS user_submitted_benchmarks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tool_id uuid REFERENCES ai_tools(id) ON DELETE CASCADE,
  user_id uuid REFERENCES user_profiles(id) ON DELETE CASCADE,
  benchmark_name text NOT NULL,
  score numeric(5,2) NOT NULL CHECK (score >= 0 AND score <= 100),
  test_description text NOT NULL,
  test_results jsonb DEFAULT '{}',
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS benchmark_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tool_id uuid REFERENCES ai_tools(id) ON DELETE CASCADE,
  user_id uuid REFERENCES user_profiles(id) ON DELETE CASCADE,
  report_type text NOT NULL CHECK (report_type IN ('comparison', 'performance', 'historical')),
  report_data jsonb DEFAULT '{}',
  generated_at timestamptz DEFAULT now()
);

ALTER TABLE tool_benchmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_submitted_benchmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE benchmark_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read tool benchmarks"
  ON tool_benchmarks FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Anyone can read approved user benchmarks"
  ON user_submitted_benchmarks FOR SELECT
  TO public
  USING (status = 'approved');

CREATE POLICY "Authenticated users can submit benchmarks"
  ON user_submitted_benchmarks FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can read their own benchmark submissions"
  ON user_submitted_benchmarks FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id OR status = 'approved');

CREATE POLICY "Plus and Pro users can read benchmark reports"
  ON benchmark_reports FOR SELECT
  TO authenticated
  USING (
    auth.uid() = user_id OR
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.subscription_plan IN ('plus', 'pro')
    )
  );

CREATE POLICY "Pro users can generate benchmark reports"
  ON benchmark_reports FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = user_id AND
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.subscription_plan IN ('plus', 'pro')
    )
  );

CREATE INDEX IF NOT EXISTS idx_tool_benchmarks_tool_id ON tool_benchmarks(tool_id);
CREATE INDEX IF NOT EXISTS idx_tool_benchmarks_category ON tool_benchmarks(benchmark_category);
CREATE INDEX IF NOT EXISTS idx_user_benchmarks_status ON user_submitted_benchmarks(status);
CREATE INDEX IF NOT EXISTS idx_user_benchmarks_tool_id ON user_submitted_benchmarks(tool_id);
CREATE INDEX IF NOT EXISTS idx_benchmark_reports_user_id ON benchmark_reports(user_id);
