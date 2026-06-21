// Gmail scanner — fetches emails and pipes through AI extraction pipeline
import { listMessages, getMessage, parseHeaders, parseSender, isNoise } from '@/lib/gmail/client';
import { extractFromEmail } from '@/lib/ai/agents';
import { getServiceClient } from '@/lib/supabase/client';

interface ScanProgress {
  total: number;
  processed: number;
  contactsFound: number;
  dealsFound: number;
  stage: 'fetching' | 'extracting' | 'done' | 'error';
  error?: string;
}

// In-memory progress store (reset on cold start)
const scanProgress = new Map<string, ScanProgress>();

export function getScanProgress(userId: string): ScanProgress | undefined {
  return scanProgress.get(userId);
}

interface ScanResult {
  contactsFound: number;
  dealsFound: number;
  emailsScanned: number;
}

export async function scanEmails(
  userId: string,
  clerkId: string,
  gmailEmail: string,
  refreshTokenEncrypted: string,
): Promise<ScanResult> {
  // Decode the stored token
  const refreshToken = Buffer.from(refreshTokenEncrypted, 'base64').toString('utf-8');

  // Exchange refresh token for access token
  let accessToken: string;
  try {
    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: process.env.GOOGLE_CLIENT_ID!,
        client_secret: process.env.GOOGLE_CLIENT_SECRET!,
        refresh_token: refreshToken,
        grant_type: 'refresh_token',
      }),
    });
    if (!tokenRes.ok) throw new Error('Failed to refresh token');
    const tokens = await tokenRes.json();
    accessToken = tokens.access_token;
  } catch (err) {
    scanProgress.set(userId, { total: 0, processed: 0, contactsFound: 0, dealsFound: 0, stage: 'error', error: 'Token refresh failed' });
    throw err;
  }

  // Fetch recent messages (last 100)
  scanProgress.set(userId, { total: 0, processed: 0, contactsFound: 0, dealsFound: 0, stage: 'fetching' });

  let messages: Array<{ id: string; threadId: string }> = [];
  try {
    const res = await listMessages(accessToken, { maxResults: 100 });
    messages = res.messages || [];
  } catch (err) {
    scanProgress.set(userId, { total: 0, processed: 0, contactsFound: 0, dealsFound: 0, stage: 'error', error: 'Gmail fetch failed' });
    throw err;
  }

  scanProgress.set(userId, { total: messages.length, processed: 0, contactsFound: 0, dealsFound: 0, stage: 'extracting' });

  const supabase = getServiceClient();
  let contactsFound = 0;
  let dealsFound = 0;
  let processed = 0;

  for (const msg of messages) {
    try {
      const email = await getMessage(accessToken, msg.id);
      const headers = parseHeaders(email.payload.headers);

      // Skip noise
      if (isNoise(headers.from)) {
        processed++;
        continue;
      }

      // Skip already-processed emails
      const { data: existing } = await supabase
        .from('emails')
        .select('id')
        .eq('gmail_message_id', email.id)
        .limit(1);

      if (existing?.length) {
        processed++;
        continue;
      }

      const sender = parseSender(headers.from);
      const snippet = email.snippet || '';
      const subject = headers.subject;

      // Run AI extraction
      const result = await extractFromEmail(
        subject,
        snippet,
        sender.name,
        sender.email,
      );

      if (result) {
        // Upsert contact
        if (result.contact) {
          const { data: contact } = await supabase
            .from('contacts')
            .upsert({
              user_id: userId,
              email: result.contact.email,
              name: result.contact.name || undefined,
              company: result.contact.company || undefined,
              title: result.contact.title || undefined,
              last_contacted_at: new Date(headers.date || Date.now()).toISOString(),
              updated_at: new Date().toISOString(),
            }, { onConflict: 'user_id,email' })
            .select('id')
            .single();

          contactsFound++;

          // Upsert deal
          if (result.deal && contact) {
            await supabase
              .from('deals')
              .upsert({
                user_id: userId,
                contact_id: contact.id,
                title: result.deal.title,
                amount: result.deal.amount || undefined,
                stage: result.deal.stage,
                confidence: result.deal.confidence,
                last_activity_at: new Date(headers.date || Date.now()).toISOString(),
                updated_at: new Date().toISOString(),
              }, { onConflict: 'user_id,title' });

            dealsFound++;
          }

          // Store email metadata (with contact link)
          await supabase.from('emails').upsert({
            user_id: userId,
            contact_id: contact?.id || null,
            gmail_message_id: email.id,
            thread_id: email.threadId || undefined,
            subject,
            snippet: snippet.slice(0, 500),
            sender: headers.from,
            sender_email: sender.email,
            direction: sender.email === gmailEmail ? 'outbound' : 'inbound',
            sent_at: headers.date ? new Date(headers.date).toISOString() : new Date().toISOString(),
          }, { onConflict: 'user_id,gmail_message_id' });

          // Log AI activity
          await supabase.from('ai_activities').insert({
            user_id: userId,
            action_type: 'contact_extracted',
            input_summary: `Email from ${sender.name}`,
            output_summary: result.contact ? `Contact: ${result.contact.name}` : 'No contact',
          });
        }
      }

      processed++;
      scanProgress.set(userId, {
        total: messages.length,
        processed,
        contactsFound,
        dealsFound,
        stage: processed >= messages.length ? 'done' : 'extracting',
      });
    } catch (err) {
      // Log individual email errors but continue
      console.error(`Error processing email ${msg.id}:`, err);
      processed++;
    }
  }

  if (scanProgress.get(userId)?.stage !== 'error') {
    scanProgress.set(userId, { total: messages.length, processed, contactsFound, dealsFound, stage: 'done' });
  }

  return { contactsFound, dealsFound, emailsScanned: processed };
}
