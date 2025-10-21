/*
  # Create Notification System

  1. New Tables
    - `notifications`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references user_profiles)
      - `type` (text) - notification type (tool_update, system, admin_message, etc.)
      - `title` (text) - notification title
      - `message` (text) - notification content
      - `link` (text) - optional link to relevant page
      - `read` (boolean) - whether notification has been read
      - `metadata` (jsonb) - additional data (tool_id, submission_id, etc.)
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on `notifications` table
    - Add policies for users to read their own notifications
    - Add policies for users to update their own notifications (mark as read)
    - Add policy for authenticated users to create notifications (will be restricted client-side for admins only)
*/

-- Create notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES user_profiles(id) ON DELETE CASCADE NOT NULL,
  type text NOT NULL DEFAULT 'system',
  title text NOT NULL,
  message text NOT NULL,
  link text,
  read boolean DEFAULT false,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Users can read their own notifications
CREATE POLICY "Users can view own notifications"
  ON notifications FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Users can update their own notifications (mark as read)
CREATE POLICY "Users can update own notifications"
  ON notifications FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Authenticated users can create notifications
CREATE POLICY "Authenticated users can create notifications"
  ON notifications FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);
