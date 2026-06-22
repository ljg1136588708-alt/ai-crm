-- Payment Integration Migration (Gumroad)
-- Run this in Supabase SQL Editor if not already done
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_pro BOOLEAN DEFAULT false;
ALTER TABLE users ADD COLUMN IF NOT EXISTS ls_order_id TEXT;
