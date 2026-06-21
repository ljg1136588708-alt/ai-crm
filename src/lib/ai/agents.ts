// AI agents — Claude via OpenRouter with native fetch

const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions';
const MODEL = 'anthropic/claude-haiku-4.5';

function getHeaders(): Record<string, string> {
  return {
    'Authorization': `Bearer ${process.env.ANTHROPIC_API_KEY || ''}`,
    'Content-Type': 'application/json',
    'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL || 'https://ai-crm-red-pi.vercel.app',
    'X-Title': 'AI CRM',
  };
}

async function claude(model: string, system: string, userMessage: string, maxTokens = 500, temperature = 0): Promise<string> {
  const res = await fetch(OPENROUTER_URL, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({
      model,
      max_tokens: maxTokens,
      temperature,
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: userMessage },
      ],
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`OpenRouter error ${res.status}: ${errText.slice(0, 300)}`);
  }

  const data = await res.json();
  return data.choices?.[0]?.message?.content || '';
}

// ─── Extractor: pull contacts + deals from email ─────

import type { ExtractionResult } from '@/types';

export async function extractFromEmail(
  emailSubject: string,
  emailSnippet: string,
  senderName: string,
  senderEmail: string,
): Promise<ExtractionResult | null> {
  const prompt = `You are an AI that extracts structured CRM data from business emails.

Given an email, extract:
- Contact: name, email, company, title (if present)
- Deal: a short title describing the business discussed, the stage (lead/contacted/negotiation/won/lost), a confidence score 1-5, and amount if mentioned

Return ONLY valid JSON:
{
  "contact": { "name": "...", "email": "...", "company": "...", "title": "..." },
  "deal": { "title": "...", "stage": "lead|contacted|negotiation|won|lost", "confidence": 1-5, "amount": null or number }
}

If there's no business deal or contact to extract, return { "contact": null, "deal": null }`;

  const text = await claude(
    MODEL,
    prompt,
    `Subject: ${emailSubject}\nFrom: ${senderName} <${senderEmail}>\n\n${emailSnippet}`,
    300,
    0,
  );

  try {
    const result = JSON.parse(text);
    if (!result.contact) return null;
    return result as ExtractionResult;
  } catch {
    return null;
  }
}

// ─── Classifier: judge deal stage ─────────────────────

export async function classifyDealStage(
  dealTitle: string,
  context: string,
): Promise<{ stage: string; confidence: number; reason: string }> {
  const text = await claude(
    MODEL,
    `You classify sales deal stages. Return ONLY JSON: { "stage": "lead|contacted|negotiation|won|lost", "confidence": 0-1, "reason": "brief explanation" }`,
    `Deal: "${dealTitle}"\n\nContext:\n${context}`,
    200,
    0,
  );

  return JSON.parse(text);
}

// ─── Drafter: follow-up email ─────────────────────────

export async function draftFollowupEmail(
  contactName: string,
  contactCompany: string | null,
  dealStage: string,
  recentContext: string,
): Promise<{ subject: string; body: string }> {
  const text = await claude(
    MODEL,
    `You are an AI that drafts professional, concise follow-up emails.

Write a follow-up email that:
- Is warm but brief (3-5 sentences)
- References the recent context naturally
- Has a clear next step or call to action
- Sounds human, not like corporate marketing
- Matches a solo founder / small business owner's voice

Return ONLY JSON:
{ "subject": "...", "body": "..." }`,
    `Contact: ${contactName}${contactCompany ? ` at ${contactCompany}` : ''}\nDeal stage: ${dealStage}\nRecent context:\n${recentContext}`,
    500,
    0.7,
  );

  return JSON.parse(text);
}

// ─── Query Engine: natural language → answer ──────────

export async function answerQuery(
  question: string,
  schemaContext: string,
): Promise<string> {
  const text = await claude(
    MODEL,
    `You are a CRM query assistant. Given a user's question and their CRM data context, provide a clear, concise answer in natural language. Be conversational and helpful. If you cannot answer from the context, say so. Keep it under 3 sentences.`,
    `Question: ${question}\n\nCRM Data:\n${schemaContext}`,
    300,
    0,
  );

  return text;
}

// ─── Context Builder ──────────────────────────────────

import { getServiceClient } from '@/lib/supabase/client';

export async function buildQueryContext(userId: string): Promise<string> {
  const supabase = getServiceClient();
  const { data: contacts } = await supabase.from('contacts').select('name, email, company, last_contacted_at').eq('user_id', userId);
  const { data: deals } = await supabase.from('deals').select('title, stage, amount').eq('user_id', userId);
  const { data: followups } = await supabase.from('followup_reminders').select('reason, is_dismissed').eq('user_id', userId).eq('is_dismissed', false);

  const parts: string[] = [];
  if (contacts?.length) parts.push(`Contacts (${contacts.length}): ${JSON.stringify(contacts.slice(0, 20))}`);
  if (deals?.length) parts.push(`Deals (${deals.length}): ${JSON.stringify(deals.slice(0, 20))}`);
  if (followups?.length) parts.push(`Pending follow-ups: ${followups.length}`);
  return parts.join('\n') || 'No CRM data yet.';
}
