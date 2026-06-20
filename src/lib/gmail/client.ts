// Gmail API client
// Uses Google OAuth access token to read/send emails

const GMAIL_API_BASE = 'https://gmail.googleapis.com/gmail/v1/users/me';

interface GmailMessage {
  id: string;
  threadId: string;
  labelIds: string[];
  snippet: string;
  payload: {
    headers: Array<{ name: string; value: string }>;
    mimeType: string;
    body?: { data?: string };
    parts?: Array<{
      mimeType: string;
      body?: { data?: string };
    }>;
  };
  internalDate: string;
}

interface GmailListResponse {
  messages: Array<{ id: string; threadId: string }>;
  nextPageToken?: string;
  resultSizeEstimate: number;
}

// Parse email headers to get from/to/subject
export function parseHeaders(headers: Array<{ name: string; value: string }>) {
  const result: Record<string, string> = {};
  for (const h of headers) {
    result[h.name.toLowerCase()] = h.value;
  }
  return {
    subject: result['subject'] || '',
    from: result['from'] || '',
    to: result['to'] || '',
    date: result['date'] || '',
    messageId: result['message-id'] || '',
  };
}

// Extract sender name and email from "Name <email>" format
export function parseSender(from: string): { name: string; email: string } {
  const match = from.match(/^(.+?)\s*<(.+@.+?)>$/);
  if (match) {
    return { name: match[1].trim(), email: match[2].trim() };
  }
  return { name: from, email: from };
}

// List recent messages
export async function listMessages(
  accessToken: string,
  options: { maxResults?: number; pageToken?: string; q?: string } = {}
): Promise<GmailListResponse> {
  const params = new URLSearchParams();
  if (options.maxResults) params.set('maxResults', String(options.maxResults));
  if (options.pageToken) params.set('pageToken', options.pageToken);
  if (options.q) params.set('q', options.q);
  // Exclude CATEGORY_PROMOTIONS and CATEGORY_SOCIAL to reduce noise
  const query = options.q || '-category:promotions -category:social -category:forums';

  const res = await fetch(
    `${GMAIL_API_BASE}/messages?${params.toString()}&q=${encodeURIComponent(query)}`,
    { headers: { Authorization: `Bearer ${accessToken}` } }
  );

  if (!res.ok) throw new Error(`Gmail API error: ${res.status}`);
  return res.json();
}

// Get a single message
export async function getMessage(accessToken: string, messageId: string): Promise<GmailMessage> {
  const res = await fetch(`${GMAIL_API_BASE}/messages/${messageId}?format=full`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) throw new Error(`Gmail API error: ${res.status}`);
  return res.json();
}

// Send email
export async function sendEmail(
  accessToken: string,
  to: string,
  subject: string,
  body: string,
): Promise<{ id: string }> {
  const raw = [
    `To: ${to}`,
    `Subject: ${subject}`,
    'Content-Type: text/plain; charset=UTF-8',
    '',
    body,
  ].join('\n');

  const encoded = Buffer.from(raw).toString('base64url');

  const res = await fetch(`${GMAIL_API_BASE}/messages/send`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ raw: encoded }),
  });

  if (!res.ok) throw new Error(`Gmail send error: ${res.status}`);
  return res.json();
}

// Get user profile (email address)
export async function getProfile(accessToken: string): Promise<{ emailAddress: string }> {
  const res = await fetch(`${GMAIL_API_BASE}/profile`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) throw new Error(`Gmail profile error: ${res.status}`);
  return res.json();
}

// Noise filter — skip automated emails
const NOISE_DOMAINS = [
  'noreply', 'no-reply', 'notifications', 'notification',
  'newsletter', 'marketing', 'hello@intercom', 'mailer-daemon',
  'bounce', 'postmaster', 'admin@',
];

export function isNoise(from: string): boolean {
  const lower = from.toLowerCase();
  return NOISE_DOMAINS.some(d => lower.includes(d));
}
