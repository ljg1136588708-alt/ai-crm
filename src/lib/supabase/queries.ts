import { supabase } from './client';
import type { Contact, Deal, EmailRecord, FollowupReminder, PipelineStats } from '@/types';

// ─── Contacts ───────────────────────────────────────

export async function getContacts(userId: string, search?: string) {
  let query = supabase
    .from('contacts')
    .select('*')
    .eq('user_id', userId)
    .order('last_contacted_at', { ascending: false, nullsFirst: false });

  if (search) {
    query = query.or(`name.ilike.%${search}%,email.ilike.%${search}%,company.ilike.%${search}%`);
  }

  const { data } = await query;
  return data || [];
}

export async function getContact(userId: string, contactId: string) {
  const { data } = await supabase
    .from('contacts')
    .select('*')
    .eq('user_id', userId)
    .eq('id', contactId)
    .single();
  return data;
}

export async function upsertContact(userId: string, contact: { name?: string; email?: string; company?: string; title?: string }) {
  if (contact.email) {
    const { data: existing } = await supabase
      .from('contacts')
      .select('id')
      .eq('user_id', userId)
      .eq('email', contact.email)
      .single();

    if (existing) {
      const { data } = await supabase
        .from('contacts')
        .update({ ...contact, updated_at: new Date().toISOString() })
        .eq('id', existing.id)
        .select('*')
        .single();
      return data;
    }
  }

  const { data } = await supabase
    .from('contacts')
    .insert({ user_id: userId, ...contact, source: 'gmail' })
    .select('*')
    .single();
  return data;
}

// ─── Deals ──────────────────────────────────────────

export async function getDeals(userId: string, stage?: string) {
  let query = supabase
    .from('deals')
    .select('*, contacts(name, email, company)')
    .eq('user_id', userId)
    .order('updated_at', { ascending: false });

  if (stage) {
    query = query.eq('stage', stage);
  }

  const { data } = await query;
  return (data || []).map((d: Record<string, unknown>) => ({
    ...d,
    contactName: (d.contacts as Record<string, string> | null)?.name,
    contactEmail: (d.contacts as Record<string, string> | null)?.email,
    contactCompany: (d.contacts as Record<string, string> | null)?.company,
  }));
}

export async function getDeal(userId: string, dealId: string) {
  const { data } = await supabase
    .from('deals')
    .select('*, contacts(name, email, company)')
    .eq('user_id', userId)
    .eq('id', dealId)
    .single();
  return data;
}

export async function upsertDeal(userId: string, deal: {
  contactId?: string;
  title: string;
  amount?: number;
  stage?: string;
  confidence?: number;
}) {
  const { data } = await supabase
    .from('deals')
    .insert({
      user_id: userId,
      contact_id: deal.contactId,
      title: deal.title,
      amount: deal.amount,
      stage: deal.stage || 'lead',
      confidence: deal.confidence,
      last_activity_at: new Date().toISOString(),
    })
    .select('*')
    .single();
  return data;
}

export async function updateDealStage(userId: string, dealId: string, stage: string) {
  return supabase
    .from('deals')
    .update({ stage, updated_at: new Date().toISOString() })
    .eq('user_id', userId)
    .eq('id', dealId);
}

// ─── Emails ─────────────────────────────────────────

export async function getEmailsForContact(userId: string, contactId: string) {
  const { data } = await supabase
    .from('emails')
    .select('*')
    .eq('user_id', userId)
    .eq('contact_id', contactId)
    .order('sent_at', { ascending: false })
    .limit(50);
  return data || [];
}

export async function insertEmail(userId: string, email: {
  gmailMessageId: string;
  threadId?: string;
  subject?: string;
  snippet?: string;
  sender?: string;
  senderEmail?: string;
  recipient?: string;
  direction: 'inbound' | 'outbound';
  sentAt?: string;
  contactId?: string;
  dealId?: string;
}) {
  return supabase.from('emails').insert({ user_id: userId, ...email });
}

// ─── Follow-ups ─────────────────────────────────────

export async function getFollowups(userId: string) {
  const { data } = await supabase
    .from('followup_reminders')
    .select('*, contacts(name, email, company), deals(title)')
    .eq('user_id', userId)
    .eq('is_dismissed', false)
    .order('created_at', { ascending: false });
  return (data || []).map((f: Record<string, unknown>) => ({
    ...f,
    contactName: (f.contacts as Record<string, string> | null)?.name,
    contactEmail: (f.contacts as Record<string, string> | null)?.email,
    contactCompany: (f.contacts as Record<string, string> | null)?.company,
    dealTitle: (f.deals as Record<string, string> | null)?.title,
  }));
}

// ─── Pipeline Stats ─────────────────────────────────

export async function getPipelineStats(userId: string): Promise<PipelineStats> {
  const { data: deals } = await supabase
    .from('deals')
    .select('stage, amount')
    .eq('user_id', userId);

  const { count: followupCount } = await supabase
    .from('followup_reminders')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('is_dismissed', false);

  const stageCounts: PipelineStats['stageCounts'] = {
    lead: 0, contacted: 0, negotiation: 0, won: 0, lost: 0,
  };
  let totalValue = 0;

  (deals || []).forEach((d: { stage: string; amount: number | null }) => {
    if (d.stage && stageCounts.hasOwnProperty(d.stage)) {
      stageCounts[d.stage as keyof typeof stageCounts]++;
    }
    totalValue += d.amount || 0;
  });

  return {
    totalDeals: (deals || []).filter(d => d.stage !== 'won' && d.stage !== 'lost').length,
    totalValue,
    stageCounts,
    followupCount: followupCount || 0,
  };
}
