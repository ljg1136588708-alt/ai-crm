-- Stripe Payment Integration Migration
-- Run this in Supabase SQL Editor

-- Add Stripe + Pro columns to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_pro BOOLEAN DEFAULT false;
ALTER TABLE users ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS stripe_subscription_id TEXT;

-- Index on stripe_subscription_id for webhook lookups
CREATE INDEX IF NOT EXISTS idx_users_stripe_subscription ON users(stripe_subscription_id);

-- Note: is_pro = true means quota_remaining/total are ignored (unlimited)
