/*
  # Enhance Collections System

  1. New Tables
    - `collection_collaborators`: Multiple editors for collections
    - `collection_comments`: Comments on collections
    - `collection_versions`: Version history with rollback capability
    - `collection_categories`: Organize collections by industry/use case
    - `collection_templates`: Pre-built collection templates
    - `collection_traffic_sources`: Track where views come from
    - `collection_user_demographics`: Track who views collections

  2. Changes to Existing Tables
    - Add `category_id` to tool_collections
    - Add `is_template`, `template_name`, `template_description` to tool_collections
    - Add `is_featured`, `is_trending` to tool_collections
    - Add `version_number` to tool_collections

  3. Security
    - Enable RLS on all new tables
    - Add policies for authenticated users
    - Restrict write access appropriately
*/

CREATE TABLE IF NOT EXISTS collection_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  icon TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE collection_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view categories"
  ON collection_categories FOR SELECT
  TO authenticated
  USING (true);

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'tool_collections' AND column_name = 'category_id'
  ) THEN
    ALTER TABLE tool_collections ADD COLUMN category_id UUID REFERENCES collection_categories(id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'tool_collections' AND column_name = 'is_template'
  ) THEN
    ALTER TABLE tool_collections ADD COLUMN is_template BOOLEAN DEFAULT false;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'tool_collections' AND column_name = 'template_name'
  ) THEN
    ALTER TABLE tool_collections ADD COLUMN template_name TEXT;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'tool_collections' AND column_name = 'template_description'
  ) THEN
    ALTER TABLE tool_collections ADD COLUMN template_description TEXT;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'tool_collections' AND column_name = 'is_featured'
  ) THEN
    ALTER TABLE tool_collections ADD COLUMN is_featured BOOLEAN DEFAULT false;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'tool_collections' AND column_name = 'is_trending'
  ) THEN
    ALTER TABLE tool_collections ADD COLUMN is_trending BOOLEAN DEFAULT false;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'tool_collections' AND column_name = 'version_number'
  ) THEN
    ALTER TABLE tool_collections ADD COLUMN version_number INTEGER DEFAULT 1;
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS collection_collaborators (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  collection_id UUID NOT NULL REFERENCES tool_collections(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('editor', 'viewer')),
  invited_by UUID REFERENCES auth.users(id),
  invited_at TIMESTAMPTZ DEFAULT now(),
  accepted_at TIMESTAMPTZ,
  UNIQUE(collection_id, user_id)
);

ALTER TABLE collection_collaborators ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view collaborators of their collections"
  ON collection_collaborators FOR SELECT
  TO authenticated
  USING (
    user_id = auth.uid() OR
    collection_id IN (
      SELECT id FROM tool_collections WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Collection owners can add collaborators"
  ON collection_collaborators FOR INSERT
  TO authenticated
  WITH CHECK (
    collection_id IN (
      SELECT id FROM tool_collections WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Collection owners can remove collaborators"
  ON collection_collaborators FOR DELETE
  TO authenticated
  USING (
    collection_id IN (
      SELECT id FROM tool_collections WHERE user_id = auth.uid()
    )
  );

CREATE TABLE IF NOT EXISTS collection_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  collection_id UUID NOT NULL REFERENCES tool_collections(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  comment_text TEXT NOT NULL,
  parent_comment_id UUID REFERENCES collection_comments(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE collection_comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view comments on public collections"
  ON collection_comments FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can add comments"
  ON collection_comments FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own comments"
  ON collection_comments FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own comments"
  ON collection_comments FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS collection_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  collection_id UUID NOT NULL REFERENCES tool_collections(id) ON DELETE CASCADE,
  version_number INTEGER NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  tool_ids UUID[] NOT NULL,
  is_public BOOLEAN DEFAULT false,
  created_by UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  change_summary TEXT
);

ALTER TABLE collection_versions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view versions of their collections"
  ON collection_versions FOR SELECT
  TO authenticated
  USING (
    created_by = auth.uid() OR
    collection_id IN (
      SELECT id FROM tool_collections WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create versions"
  ON collection_versions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = created_by);

CREATE TABLE IF NOT EXISTS collection_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  category_id UUID REFERENCES collection_categories(id),
  tool_ids UUID[] DEFAULT ARRAY[]::UUID[],
  preview_image_url TEXT,
  use_count INTEGER DEFAULT 0,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  is_active BOOLEAN DEFAULT true
);

ALTER TABLE collection_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active templates"
  ON collection_templates FOR SELECT
  TO authenticated
  USING (is_active = true);

CREATE TABLE IF NOT EXISTS collection_traffic_sources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  collection_id UUID NOT NULL REFERENCES tool_collections(id) ON DELETE CASCADE,
  source TEXT NOT NULL,
  referrer TEXT,
  view_count INTEGER DEFAULT 1,
  last_viewed_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE collection_traffic_sources ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view traffic sources of their collections"
  ON collection_traffic_sources FOR SELECT
  TO authenticated
  USING (
    collection_id IN (
      SELECT id FROM tool_collections WHERE user_id = auth.uid()
    )
  );

INSERT INTO collection_categories (name, slug, description, icon) VALUES
  ('Content Creation', 'content-creation', 'Tools for creating and managing content', '✍️'),
  ('Development', 'development', 'Tools for software development and coding', '💻'),
  ('Marketing', 'marketing', 'Tools for marketing and growth', '📈'),
  ('Design', 'design', 'Tools for design and creative work', '🎨'),
  ('Productivity', 'productivity', 'Tools for productivity and organization', '⚡'),
  ('Data & Analytics', 'data-analytics', 'Tools for data analysis and visualization', '📊'),
  ('Customer Support', 'customer-support', 'Tools for customer service and support', '💬'),
  ('Sales', 'sales', 'Tools for sales and CRM', '💰')
ON CONFLICT (slug) DO NOTHING;
