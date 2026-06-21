-- Run in Supabase SQL Editor

-- Add quota fields to users table (if table exists)
ALTER TABLE users ADD COLUMN IF NOT EXISTS quota_remaining INTEGER DEFAULT 5;
ALTER TABLE users ADD COLUMN IF NOT EXISTS quota_total INTEGER DEFAULT 5;

-- Create generations table
CREATE TABLE IF NOT EXISTS generations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  clerk_id TEXT NOT NULL,
  image_url TEXT NOT NULL,
  prompt TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Index for user queries
CREATE INDEX IF NOT EXISTS idx_generations_clerk_id ON generations(clerk_id);
CREATE INDEX IF NOT EXISTS idx_generations_created_at ON generations(created_at DESC);

-- Storage bucket (create in Supabase Dashboard → Storage → New Bucket)
-- Bucket name: "generations"
-- Public bucket: yes
