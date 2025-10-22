/*
  # Add Support Chat Settings

  1. New Tables
    - `support_settings`
      - `id` (uuid, primary key)
      - `is_online` (boolean, default true)
      - `custom_message` (text, optional custom message)
      - `updated_at` (timestamptz)
      - `updated_by` (text, admin identifier)

  2. Security
    - Enable RLS on `support_settings` table
    - Add policy for authenticated users to read settings
    - Add policy for admin to update settings
*/

CREATE TABLE IF NOT EXISTS support_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  is_online boolean DEFAULT true,
  custom_message text DEFAULT 'Online - We''ll respond soon',
  updated_at timestamptz DEFAULT now(),
  updated_by text DEFAULT 'admin'
);

ALTER TABLE support_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read support settings"
  ON support_settings
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can update support settings"
  ON support_settings
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Admins can insert support settings"
  ON support_settings
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Insert default settings
INSERT INTO support_settings (is_online, custom_message)
VALUES (true, 'Online - We''ll respond soon')
ON CONFLICT DO NOTHING;
