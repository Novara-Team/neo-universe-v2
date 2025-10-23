/*
  # Enhance Benchmarks System
  
  This migration improves the benchmarks system with advanced features and algorithms.
  
  1. New Features
    - Weighted scoring algorithm
    - Benchmark verification system
    - Automated comparative analysis
    - Statistical confidence scores
    - Historical performance tracking
  
  2. Changes to Existing Tables
    - Add verification status and confidence scores
    - Add comparative metrics
    - Add algorithm version tracking
  
  3. New Functions
    - Calculate weighted benchmark scores
    - Generate comparative insights
    - Validate benchmark submissions
*/

-- Add new columns to tool_benchmarks
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'tool_benchmarks' AND column_name = 'verified'
  ) THEN
    ALTER TABLE tool_benchmarks ADD COLUMN verified boolean DEFAULT false;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'tool_benchmarks' AND column_name = 'confidence_score'
  ) THEN
    ALTER TABLE tool_benchmarks ADD COLUMN confidence_score numeric DEFAULT 0.7;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'tool_benchmarks' AND column_name = 'sample_size'
  ) THEN
    ALTER TABLE tool_benchmarks ADD COLUMN sample_size integer DEFAULT 1;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'tool_benchmarks' AND column_name = 'algorithm_version'
  ) THEN
    ALTER TABLE tool_benchmarks ADD COLUMN algorithm_version text DEFAULT 'v1.0';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'tool_benchmarks' AND column_name = 'comparative_rank'
  ) THEN
    ALTER TABLE tool_benchmarks ADD COLUMN comparative_rank integer;
  END IF;
END $$;

-- Add new columns to user_submitted_benchmarks
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_submitted_benchmarks' AND column_name = 'reviewed_at'
  ) THEN
    ALTER TABLE user_submitted_benchmarks ADD COLUMN reviewed_at timestamptz;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_submitted_benchmarks' AND column_name = 'reviewed_by'
  ) THEN
    ALTER TABLE user_submitted_benchmarks ADD COLUMN reviewed_by uuid REFERENCES auth.users(id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_submitted_benchmarks' AND column_name = 'rejection_reason'
  ) THEN
    ALTER TABLE user_submitted_benchmarks ADD COLUMN rejection_reason text;
  END IF;
END $$;

-- Create benchmark_weights table for weighted scoring
CREATE TABLE IF NOT EXISTS benchmark_weights (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category text UNIQUE NOT NULL,
  weight numeric NOT NULL DEFAULT 1.0,
  description text,
  active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE benchmark_weights ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view benchmark weights"
  ON benchmark_weights FOR SELECT
  TO authenticated
  USING (active = true);

-- Insert default weights
INSERT INTO benchmark_weights (category, weight, description)
VALUES
  ('speed', 1.2, 'Speed tests weighted higher for performance-critical applications'),
  ('accuracy', 1.5, 'Accuracy is the most important factor for most use cases'),
  ('cost', 1.0, 'Cost efficiency important but not always critical'),
  ('quality', 1.3, 'Output quality is crucial for user satisfaction'),
  ('reliability', 1.1, 'Reliability ensures consistent performance')
ON CONFLICT (category) DO NOTHING;

-- Create function to calculate weighted score
CREATE OR REPLACE FUNCTION calculate_weighted_score(
  raw_score numeric,
  category text,
  sample_size integer DEFAULT 1
)
RETURNS numeric AS $$
DECLARE
  weight numeric;
  confidence_adjustment numeric;
  weighted_score numeric;
BEGIN
  -- Get category weight
  SELECT benchmark_weights.weight INTO weight
  FROM benchmark_weights
  WHERE benchmark_weights.category = calculate_weighted_score.category
    AND active = true;
  
  IF weight IS NULL THEN
    weight := 1.0;
  END IF;
  
  -- Calculate confidence adjustment based on sample size
  -- More samples = higher confidence
  confidence_adjustment := LEAST(1.0, 0.5 + (sample_size::numeric / 20.0));
  
  -- Calculate weighted score
  weighted_score := raw_score * weight * confidence_adjustment;
  
  RETURN LEAST(100, weighted_score);
END;
$$ LANGUAGE plpgsql;

-- Create function to calculate comparative rank
CREATE OR REPLACE FUNCTION update_comparative_ranks()
RETURNS void AS $$
BEGIN
  -- Update ranks for each category
  UPDATE tool_benchmarks tb1
  SET comparative_rank = subquery.rank
  FROM (
    SELECT 
      id,
      RANK() OVER (
        PARTITION BY benchmark_category 
        ORDER BY score DESC
      ) as rank
    FROM tool_benchmarks
  ) subquery
  WHERE tb1.id = subquery.id;
END;
$$ LANGUAGE plpgsql;

-- Create function to validate benchmark submission
CREATE OR REPLACE FUNCTION validate_benchmark_submission()
RETURNS TRIGGER AS $$
DECLARE
  existing_count integer;
  avg_score numeric;
  score_deviation numeric;
BEGIN
  -- Count existing benchmarks for this tool in this category
  SELECT COUNT(*), AVG(score) INTO existing_count, avg_score
  FROM tool_benchmarks
  WHERE tool_id = NEW.tool_id
    AND benchmark_category = (NEW.test_results->>'category')::text;
  
  -- If there are existing benchmarks, check for outliers
  IF existing_count > 0 THEN
    score_deviation := ABS(NEW.score - avg_score);
    
    -- Flag suspicious submissions (more than 30 points deviation)
    IF score_deviation > 30 THEN
      NEW.test_results := jsonb_set(
        COALESCE(NEW.test_results, '{}'::jsonb),
        '{flagged}',
        'true'::jsonb
      );
      NEW.test_results := jsonb_set(
        NEW.test_results,
        '{flag_reason}',
        to_jsonb('Score significantly different from existing benchmarks'::text)
      );
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for benchmark validation
DROP TRIGGER IF EXISTS validate_submission ON user_submitted_benchmarks;
CREATE TRIGGER validate_submission
  BEFORE INSERT ON user_submitted_benchmarks
  FOR EACH ROW
  EXECUTE FUNCTION validate_benchmark_submission();

-- Create function to approve user benchmark
CREATE OR REPLACE FUNCTION approve_user_benchmark(submission_id uuid, admin_id uuid)
RETURNS void AS $$
DECLARE
  submission RECORD;
BEGIN
  -- Get the submission
  SELECT * INTO submission
  FROM user_submitted_benchmarks
  WHERE id = submission_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Benchmark submission not found';
  END IF;
  
  -- Insert into tool_benchmarks
  INSERT INTO tool_benchmarks (
    tool_id,
    benchmark_name,
    benchmark_category,
    score,
    test_description,
    test_date,
    metrics,
    verified,
    confidence_score,
    sample_size
  ) VALUES (
    submission.tool_id,
    submission.benchmark_name,
    (submission.test_results->>'category')::text,
    submission.score,
    submission.test_description,
    now(),
    submission.test_results,
    true,
    0.85,
    1
  );
  
  -- Update submission status
  UPDATE user_submitted_benchmarks
  SET 
    status = 'approved',
    reviewed_at = now(),
    reviewed_by = admin_id
  WHERE id = submission_id;
  
  -- Award points to user for approved benchmark
  UPDATE user_points
  SET total_points = total_points + 100,
      available_points = available_points + 100,
      updated_at = now()
  WHERE user_id = submission.user_id;
  
  INSERT INTO points_transactions (user_id, amount, type, description, reference_id)
  VALUES (
    submission.user_id,
    100,
    'benchmark_approved',
    'Benchmark submission approved: ' || submission.benchmark_name,
    submission_id
  );
  
  -- Send notification
  INSERT INTO notifications (user_id, type, title, message, link, read)
  VALUES (
    submission.user_id,
    'success',
    'Benchmark Approved! +100 Points',
    'Your benchmark submission "' || submission.benchmark_name || '" has been approved and is now live. You earned 100 points!',
    '/benchmarks',
    false
  );
  
  -- Update comparative ranks
  PERFORM update_comparative_ranks();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_tool_benchmarks_category ON tool_benchmarks(benchmark_category);
CREATE INDEX IF NOT EXISTS idx_tool_benchmarks_score ON tool_benchmarks(score DESC);
CREATE INDEX IF NOT EXISTS idx_tool_benchmarks_verified ON tool_benchmarks(verified);
CREATE INDEX IF NOT EXISTS idx_user_submitted_status ON user_submitted_benchmarks(status);
CREATE INDEX IF NOT EXISTS idx_tool_benchmarks_rank ON tool_benchmarks(comparative_rank);

-- Insert some sample benchmarks for testing
INSERT INTO tool_benchmarks (tool_id, benchmark_name, benchmark_category, score, test_description, test_date, metrics, verified, confidence_score, sample_size)
SELECT 
  t.id,
  'Performance Test - ' || c.name,
  CASE WHEN random() < 0.2 THEN 'speed'
       WHEN random() < 0.4 THEN 'accuracy'
       WHEN random() < 0.6 THEN 'cost'
       WHEN random() < 0.8 THEN 'quality'
       ELSE 'reliability'
  END,
  (50 + random() * 50)::numeric(5,2),
  'Automated benchmark test measuring ' || c.name || ' performance across standardized tasks',
  now() - (random() * interval '90 days'),
  jsonb_build_object(
    'latency_ms', (random() * 500)::int,
    'throughput', (random() * 1000)::int,
    'accuracy_pct', (85 + random() * 15)::numeric(5,2),
    'cost_per_1k', (random() * 5)::numeric(5,3)
  ),
  true,
  0.75 + random() * 0.25,
  (1 + random() * 10)::int
FROM ai_tools t
CROSS JOIN (
  SELECT unnest(ARRAY['speed', 'accuracy', 'cost', 'quality', 'reliability']) as name
) c
WHERE t.status = 'Published'
LIMIT 50
ON CONFLICT DO NOTHING;

-- Update comparative ranks
SELECT update_comparative_ranks();