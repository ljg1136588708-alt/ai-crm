-- Payment Integration Migration (Lemon Squeezy)
-- Run this in Supabase SQL Editor → New Query → paste and Run

ALTER TABLE users ADD COLUMN IF NOT EXISTS is_pro BOOLEAN DEFAULT false;
ALTER TABLE users ADD COLUMN IF NOT EXISTS ls_order_id TEXT;

-- is_pro = true → unlimited generations (quota_remaining is ignored)
