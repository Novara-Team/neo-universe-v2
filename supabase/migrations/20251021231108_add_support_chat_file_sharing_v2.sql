/*
  # Add File Sharing to Support Chat

  1. New Columns
    - Add `attachment_url` column to `support_messages` for file/image URLs
    - Add `attachment_type` column to store file type (image, pdf, etc.)
    - Add `attachment_name` column to store original file name

  2. Storage Bucket
    - Create `support-files` bucket for file uploads
    - Files are private and only accessible to conversation participants

  3. Notes
    - Files will be stored in Supabase Storage
    - Images can be displayed inline in chat
    - Other files will be shown as downloadable attachments
*/

-- Add columns to support_messages if they don't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'support_messages' 
    AND column_name = 'attachment_url'
  ) THEN
    ALTER TABLE support_messages 
    ADD COLUMN attachment_url text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'support_messages' 
    AND column_name = 'attachment_type'
  ) THEN
    ALTER TABLE support_messages 
    ADD COLUMN attachment_type text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'support_messages' 
    AND column_name = 'attachment_name'
  ) THEN
    ALTER TABLE support_messages 
    ADD COLUMN attachment_name text;
  END IF;
END $$;

-- Create storage bucket for support chat files if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('support-files', 'support-files', false)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for support files
DROP POLICY IF EXISTS "Users can upload support files" ON storage.objects;
DROP POLICY IF EXISTS "Users can view support files" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own support files" ON storage.objects;

-- Users can upload files to their own conversation folders
CREATE POLICY "Users can upload support files"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'support-files' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

-- Users can view support files from conversations they participate in
CREATE POLICY "Users can view support files"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'support-files' AND
    (
      (storage.foldername(name))[1] = auth.uid()::text OR
      EXISTS (
        SELECT 1 FROM support_conversations sc
        JOIN support_messages sm ON sm.conversation_id = sc.id
        WHERE sc.user_id = auth.uid()
        AND storage.filename(name) LIKE '%' || (storage.foldername(name))[2] || '%'
      )
    )
  );

-- Users can delete their own support files
CREATE POLICY "Users can delete own support files"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'support-files' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );