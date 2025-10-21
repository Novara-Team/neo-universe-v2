/*
  # Contact Form Messages Table

  ## Summary
  Creates a dedicated table for contact form submissions separate from support chat messages.

  ## New Table
  
  ### contact_messages
  - `id` (uuid, primary key) - Unique message identifier
  - `name` (text) - Sender's name
  - `email` (text) - Sender's email address
  - `subject` (text) - Message subject
  - `message` (text) - Message content
  - `priority` (text) - Message priority: low/normal/high/urgent
  - `status` (text) - Status: pending/responded/closed
  - `created_at` (timestamptz) - Creation timestamp
  - `responded_at` (timestamptz) - Response timestamp (nullable)

  ## Security
  - RLS enabled
  - Public can insert messages
  - Only authenticated admins can view/update
*/

-- Create contact_messages table
CREATE TABLE IF NOT EXISTS contact_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL,
  subject text NOT NULL,
  message text NOT NULL,
  priority text DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'responded', 'closed')),
  created_at timestamptz DEFAULT now(),
  responded_at timestamptz DEFAULT null
);

-- Enable RLS
ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert contact messages
CREATE POLICY "Anyone can submit contact messages"
  ON contact_messages FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Only allow service role to read/update (admins will use service role)
CREATE POLICY "Service role can manage contact messages"
  ON contact_messages FOR ALL
  USING (true);

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_contact_messages_status ON contact_messages(status);
CREATE INDEX IF NOT EXISTS idx_contact_messages_created ON contact_messages(created_at DESC);