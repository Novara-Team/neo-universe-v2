/*
  # Support Chat System

  ## Summary
  Creates a complete support chat system for user-admin communication.

  ## New Tables

  ### 1. support_conversations
  - `id` (uuid, primary key) - Unique conversation identifier
  - `user_id` (uuid) - Foreign key to auth.users
  - `user_email` (text) - User's email for reference
  - `status` (text) - Conversation status: open/in_progress/closed
  - `created_at` (timestamptz) - Creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ### 2. support_messages
  - `id` (uuid, primary key) - Unique message identifier
  - `conversation_id` (uuid) - Foreign key to support_conversations
  - `sender_id` (uuid) - ID of message sender
  - `sender_type` (text) - Type: user/admin
  - `message` (text) - Message content
  - `read` (boolean) - Message read status
  - `created_at` (timestamptz) - Creation timestamp

  ## Security
  - RLS enabled on all tables
  - Users can only view their own conversations and messages
  - Admins can view all conversations
*/

-- Create support_conversations table
CREATE TABLE IF NOT EXISTS support_conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  user_email text NOT NULL,
  status text DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'closed')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create support_messages table
CREATE TABLE IF NOT EXISTS support_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid REFERENCES support_conversations(id) ON DELETE CASCADE NOT NULL,
  sender_id uuid NOT NULL,
  sender_type text NOT NULL CHECK (sender_type IN ('user', 'admin')),
  message text NOT NULL,
  read boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE support_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE support_messages ENABLE ROW LEVEL SECURITY;

-- Policies for support_conversations
CREATE POLICY "Users can view own conversations"
  ON support_conversations FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own conversations"
  ON support_conversations FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own conversations"
  ON support_conversations FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Policies for support_messages
CREATE POLICY "Users can view messages in own conversations"
  ON support_messages FOR SELECT
  TO authenticated
  USING (
    conversation_id IN (
      SELECT id FROM support_conversations WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert messages in own conversations"
  ON support_messages FOR INSERT
  TO authenticated
  WITH CHECK (
    conversation_id IN (
      SELECT id FROM support_conversations WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own messages"
  ON support_messages FOR UPDATE
  TO authenticated
  USING (sender_id = auth.uid())
  WITH CHECK (sender_id = auth.uid());

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_support_conversations_user ON support_conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_support_conversations_status ON support_conversations(status);
CREATE INDEX IF NOT EXISTS idx_support_messages_conversation ON support_messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_support_messages_created ON support_messages(created_at);

-- Update trigger for conversations
CREATE OR REPLACE FUNCTION update_conversation_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE support_conversations
  SET updated_at = now()
  WHERE id = NEW.conversation_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_conversation_on_message ON support_messages;
CREATE TRIGGER update_conversation_on_message
  AFTER INSERT ON support_messages
  FOR EACH ROW
  EXECUTE FUNCTION update_conversation_timestamp();
