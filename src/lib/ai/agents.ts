import Anthropic from '@anthropic-ai/sdk';
import type { ExtractionResult } from '@/types';

// Use OpenRouter as Anthropic API proxy (region-accessible)
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
  baseURL: 'https://openrouter.ai/api/v1',
  defaultHeaders: {
    'HTTP-Referer': 'https://ai-crm-red-pi.vercel.app',
    'X-Title': 'AI CRM',
  },
});

const HAIKU = 'anthropic/claude-haiku-4.5';
const SONNET = 'anthropic/claude-sonnet-4.6';

// ─── Extractor: pull contacts + deals from email ─────

export async function extractFromEmail(
  emailSubject: string,
  emailSnippet: string,
  senderName: string,
  senderEmail: string,
): Promise<ExtractionResult | null> {
  const prompt = `You are an AI that extracts structured CRM data from business emails.

Given an email, extract:
- Contact: name, email, company, title (if present)
- Deal: a short title describing the business opportunity, stage, confidence (1-5), and amount if mentioned

Deal stage options: lead (initial contact), contacted (discussing), negotiation (talking terms/pricing), won (closed), lost (dead)

Return ONLY valid JSON, no other text:
{
  "contact": { "name": "...", "email": "...", "company": "..." | null, "title": "..." | null },
  "deal": { "title": "...", "stage": "lead"|"contacted"|"negotiation", "confidence": 1-5, "amount": number | null } | null
}

If the email is NOT business-related (newsletter, notification, spam, automated), return:
{ "contact": null, "deal": null }`;

  const msg = await anthropic.messages.create({
    model: HAIKU,
    max_tokens: 500,
    temperature: 0.1,
    system: prompt,
    messages: [{
      role: 'user',
      content: `SUBJECT: ${emailSubject}\nFROM: ${senderName} <${senderEmail}>\n\n${emailSnippet}`,
    }],
  });

  try {
    const text = (msg.content[0] as { text: string }).text;
    const json = JSON.parse(text);
    if (!json.contact && !json.deal) return null;
    return json as ExtractionResult;
  } catch {
    return null;
  }
}

// ─── Classifier: determine deal stage from thread context ────

export async function classifyDealStage(
  contactName: string,
  recentSubjects: string[],
  currentStage: string,
): Promise<{ stage: string; confidence: number; reason: string } | null> {
  const prompt = `You analyze email threads and determine the current deal stage.

Given a contact and recent email subjects, return:
- stage: lead | contacted | negotiation | won | lost
- confidence: 1-5 (how sure you are)
- reason: one sentence explaining

Current stage: ${currentStage}
Return ONLY JSON.`;

  const msg = await anthropic.messages.create({
    model: HAIKU,
    max_tokens: 200,
    temperature: 0,
    system: prompt,
    messages: [{
      role: 'user',
      content: `Contact: ${contactName}\nRecent emails:\n${recentSubjects.map(s => `- ${s}`).join('\n')}`,
    }],
  });

  try {
    const text = (msg.content[0] as { text: string }).text;
    return JSON.parse(text);
  } catch {
    return null;
  }
}

// ─── Drafter: write follow-up email ──────────────────

export async function draftFollowupEmail(
  contactName: string,
  contactCompany: string | null,
  dealStage: string,
  recentContext: string,
): Promise<{ subject: string; body: string }> {
  const prompt = `You are an AI that drafts professional, concise follow-up emails.

Write a follow-up email that:
- Is warm but brief (3-5 sentences)
- References the recent context naturally
- Has a clear next step or call to action
- Sounds human, not like corporate marketing
- Matches a solo founder / small business owner's voice

Return ONLY JSON:
{ "subject": "...", "body": "..." }`;

  const msg = await anthropic.messages.create({
    model: SONNET,
    max_tokens: 500,
    temperature: 0.7,
    system: prompt,
    messages: [{
      role: 'user',
      content: `Contact: ${contactName}${contactCompany ? ` at ${contactCompany}` : ''}\nDeal stage: ${dealStage}\nRecent context:\n${recentContext}`,
    }],
  });

  const text = (msg.content[0] as { text: string }).text;
  return JSON.parse(text);
}

// ─── Query Engine: natural language → SQL ────────────

export async function answerQuery(
  question: string,
  schemaContext: string,
): Promise<string> {
  const prompt = `You are a CRM query assistant. Given a user's question and their CRM data context, provide a clear, concise answer in natural language. Be conversational and helpful. If you cannot answer from the context, say so.

User's CRM data context:
${schemaContext}

Respond in plain English, max 3-4 sentences. Be specific with names and numbers.`;

  const msg = await anthropic.messages.create({
    model: SONNET,
    max_tokens: 400,
    temperature: 0.3,
    system: prompt,
    messages: [{ role: 'user', content: question }],
  });

  return (msg.content[0] as { text: string }).text;
}

// ─── Summary: build context for query engine ──────────

export async function buildQueryContext(userId: string): Promise<string> {
  // This would query Supabase - simplified for now
  return `(CRM data would be injected here from Supabase based on user ${userId})`;
}
