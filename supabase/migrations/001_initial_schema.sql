-- 001_initial_schema.sql
-- AI CRM MVP — Core Schema

-- Enable pgcrypto for gen_random_uuid()
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Users (Clerk manages auth, Supabase stores app data)
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clerk_id TEXT UNIQUE NOT NULL,
  email TEXT NOT NULL,
  name TEXT,
  avatar_url TEXT,
  gmail_connected BOOLEAN DEFAULT false,
  gmail_email TEXT,
  gmail_refresh_token_encrypted TEXT,
  plan TEXT DEFAULT 'trial',
  trial_ends_at TIMESTAMPTZ DEFAULT (now() + INTERVAL '14 days'),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Contacts extracted from email
CREATE TABLE contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  name TEXT,
  email TEXT,
  company TEXT,
  title TEXT,
  avatar_url TEXT,
  source TEXT DEFAULT 'gmail',
  last_contacted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Deals (sales pipeline)
CREATE TABLE deals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  contact_id UUID REFERENCES contacts(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  amount DECIMAL(10,2),
  currency TEXT DEFAULT 'USD',
  stage TEXT DEFAULT 'lead' CHECK (stage IN ('lead','contacted','negotiation','won','lost')),
  confidence INTEGER CHECK (confidence BETWEEN 1 AND 5),
  next_step TEXT,
  last_activity_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Email records (metadata only, no body stored)
CREATE TABLE emails (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  contact_id UUID REFERENCES contacts(id) ON DELETE SET NULL,
  deal_id UUID REFERENCES deals(id) ON DELETE SET NULL,
  gmail_message_id TEXT NOT NULL,
  thread_id TEXT,
  subject TEXT,
  snippet TEXT,
  sender TEXT,
  sender_email TEXT,
  recipient TEXT,
  direction TEXT DEFAULT 'inbound' CHECK (direction IN ('inbound','outbound')),
  sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- AI activity log
CREATE TABLE ai_activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  action_type TEXT NOT NULL CHECK (action_type IN ('contact_extracted','deal_created','deal_updated','followup_drafted','query_answered')),
  input_summary TEXT,
  output_summary TEXT,
  tokens_used INTEGER,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Follow-up reminders
CREATE TABLE followup_reminders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  contact_id UUID REFERENCES contacts(id) ON DELETE SET NULL,
  deal_id UUID REFERENCES deals(id) ON DELETE SET NULL,
  reason TEXT NOT NULL,
  draft_email_subject TEXT,
  draft_email_body TEXT,
  is_dismissed BOOLEAN DEFAULT false,
  is_sent BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Natural language query history
CREATE TABLE queries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  query_text TEXT NOT NULL,
  response_text TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes
CREATE INDEX idx_contacts_user ON contacts(user_id);
CREATE INDEX idx_contacts_email ON contacts(user_id, email);
CREATE INDEX idx_deals_user ON deals(user_id);
CREATE INDEX idx_deals_stage ON deals(user_id, stage);
CREATE INDEX idx_emails_user ON emails(user_id);
CREATE INDEX idx_emails_contact ON emails(contact_id);
CREATE INDEX idx_emails_thread ON emails(thread_id);
CREATE INDEX idx_followups_user ON followup_reminders(user_id, is_dismissed);
CREATE INDEX idx_ai_activities_user ON ai_activities(user_id, created_at DESC);

-- RLS Policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE deals ENABLE ROW LEVEL SECURITY;
ALTER TABLE emails ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE followup_reminders ENABLE ROW LEVEL SECURITY;
ALTER TABLE queries ENABLE ROW LEVEL SECURITY;

-- Each user can only see their own data
CREATE POLICY "users_self" ON users FOR ALL USING (clerk_id = current_setting('request.jwt.claims', true)::json->>'sub');
CREATE POLICY "contacts_self" ON contacts FOR ALL USING (user_id IN (SELECT id FROM users WHERE clerk_id = current_setting('request.jwt.claims', true)::json->>'sub'));
CREATE POLICY "deals_self" ON deals FOR ALL USING (user_id IN (SELECT id FROM users WHERE clerk_id = current_setting('request.jwt.claims', true)::json->>'sub'));
CREATE POLICY "emails_self" ON emails FOR ALL USING (user_id IN (SELECT id FROM users WHERE clerk_id = current_setting('request.jwt.claims', true)::json->>'sub'));
CREATE POLICY "ai_activities_self" ON ai_activities FOR ALL USING (user_id IN (SELECT id FROM users WHERE clerk_id = current_setting('request.jwt.claims', true)::json->>'sub'));
CREATE POLICY "followups_self" ON followup_reminders FOR ALL USING (user_id IN (SELECT id FROM users WHERE clerk_id = current_setting('request.jwt.claims', true)::json->>'sub'));
CREATE POLICY "queries_self" ON queries FOR ALL USING (user_id IN (SELECT id FROM users WHERE clerk_id = current_setting('request.jwt.claims', true)::json->>'sub'));
