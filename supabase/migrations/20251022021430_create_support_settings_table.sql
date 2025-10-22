/*
  # Create Support Settings Table
  
  1. New Tables
    - `support_settings`
      - `id` (uuid, primary key)
      - `is_online` (boolean) - Support chat online/offline status
      - `custom_message` (text) - Custom status message
      - `updated_at` (timestamptz) - Last update timestamp
      - `updated_by` (uuid) - Admin who last updated
  
  2. Security
    - Enable RLS on `support_settings` table
    - Add policy for public read access
    - Add policy for admins to manage settings
  
  3. Data
    - Insert default settings row
*/

CREATE TABLE IF NOT EXISTS support_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  is_online boolean DEFAULT true,
  custom_message text DEFAULT 'Online - We''ll respond soon',
  updated_at timestamptz DEFAULT now(),
  updated_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE support_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view support settings"
  ON support_settings
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Admins can update support settings"
  ON support_settings
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.raw_user_meta_data->>'role' = 'admin'
    )
  );

CREATE POLICY "Admins can insert support settings"
  ON support_settings
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.raw_user_meta_data->>'role' = 'admin'
    )
  );

-- Insert default settings
INSERT INTO support_settings (is_online, custom_message)
VALUES (true, 'Online - We''ll respond soon')
ON CONFLICT DO NOTHING;