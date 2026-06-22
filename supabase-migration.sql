-- Run in Supabase SQL Editor

-- Add quota fields to users table (if table exists)
ALTER TABLE users ADD COLUMN IF NOT EXISTS quota_remaining INTEGER DEFAULT 50;
ALTER TABLE users ADD COLUMN IF NOT EXISTS quota_total INTEGER DEFAULT 50;

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

-- Atomic quota decrement: locks the row, checks balance, deducts 1.
-- Pro users are unlimited (returns remaining = -1, never deducted).
CREATE OR REPLACE FUNCTION decrement_quota(p_clerk_id TEXT)
RETURNS TABLE(allowed BOOLEAN, remaining INT, total INT, is_pro BOOLEAN)
LANGUAGE plpgsql AS $$
DECLARE
  u users%ROWTYPE;
BEGIN
  SELECT * INTO u FROM users WHERE clerk_id = p_clerk_id FOR UPDATE;
  IF NOT FOUND THEN
    RETURN QUERY SELECT false, 0, 0, false; RETURN;
  END IF;
  IF u.is_pro THEN
    RETURN QUERY SELECT true, -1, -1, true; RETURN;
  END IF;
  IF u.quota_remaining <= 0 THEN
    RETURN QUERY SELECT false, u.quota_remaining, u.quota_total, false; RETURN;
  END IF;
  UPDATE users SET quota_remaining = quota_remaining - 1
    WHERE clerk_id = p_clerk_id
    RETURNING quota_remaining, quota_total INTO u.quota_remaining, u.quota_total;
  RETURN QUERY SELECT true, u.quota_remaining, u.quota_total, false;
END;
$$;

-- Refund quota (used when a generation fails after deduction). No-op for pro users.
CREATE OR REPLACE FUNCTION add_quota(p_clerk_id TEXT, p_amount INT)
RETURNS VOID
LANGUAGE sql AS $$
  UPDATE users SET quota_remaining = quota_remaining + p_amount
  WHERE clerk_id = p_clerk_id AND NOT is_pro;
$$;

-- Storage bucket (create in Supabase Dashboard → Storage → New Bucket)
-- Bucket name: "generations"
-- Public bucket: yes
