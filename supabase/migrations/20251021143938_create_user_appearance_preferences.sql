/*
  # Create User Appearance Preferences

  1. New Tables
    - `user_appearance_preferences`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users)
      - `theme` (text) - light, dark, or auto
      - `primary_color` (text) - hex color code
      - `accent_color` (text) - hex color code
      - `font_size` (text) - small, medium, or large
      - `reduced_motion` (boolean) - accessibility setting
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on `user_appearance_preferences` table
    - Add policies for authenticated users to manage their own preferences
*/

CREATE TABLE IF NOT EXISTS user_appearance_preferences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  theme text NOT NULL DEFAULT 'light' CHECK (theme IN ('light', 'dark', 'auto')),
  primary_color text NOT NULL DEFAULT '#3b82f6',
  accent_color text NOT NULL DEFAULT '#06b6d4',
  font_size text NOT NULL DEFAULT 'medium' CHECK (font_size IN ('small', 'medium', 'large')),
  reduced_motion boolean NOT NULL DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id)
);

ALTER TABLE user_appearance_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own appearance preferences"
  ON user_appearance_preferences
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own appearance preferences"
  ON user_appearance_preferences
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own appearance preferences"
  ON user_appearance_preferences
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own appearance preferences"
  ON user_appearance_preferences
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION update_appearance_preferences_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_appearance_preferences_updated_at_trigger
  BEFORE UPDATE ON user_appearance_preferences
  FOR EACH ROW
  EXECUTE FUNCTION update_appearance_preferences_updated_at();
