// GET /api/debug/draft — test followup drafting for a single contact
import { NextResponse } from 'next/server';

const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions';

export async function GET() {
  if (process.env.NODE_ENV === 'production' && !process.env.ENABLE_DEBUG) {
    return NextResponse.json({ error: 'Debug disabled in production' }, { status: 403 });
  }

  const result: Record<string, any> = {};

  // 1. Raw fetch test
  try {
    const res = await fetch(OPENROUTER_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.ANTHROPIC_API_KEY || ''}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://ai-crm-red-pi.vercel.app',
        'X-Title': 'AI CRM',
      },
      body: JSON.stringify({
        model: 'anthropic/claude-sonnet-4.6',
        max_tokens: 200,
        temperature: 0.7,
        messages: [
          {
            role: 'system',
            content: 'You draft professional follow-up emails. Return ONLY JSON: {"subject":"...","body":"..."}',
          },
          {
            role: 'user',
            content: 'Contact: Alice at TechVentures\nDeal stage: negotiation\nRecent context: Discussing API pricing and integration timeline. Alice mentioned budget approval needed.',
          },
        ],
      }),
    });

    result.http_status = res.status;
    if (res.ok) {
      const data = await res.json();
      result.model = data.model;
      result.raw_response = data.choices?.[0]?.message?.content;
      try {
        result.parsed = JSON.parse(result.raw_response || '');
      } catch {
        result.parse_error = 'Response was not valid JSON';
      }
    } else {
      result.error = await res.text();
    }
  } catch (err: any) {
    result.fetch_error = err.message || String(err);
  }

  // 2. Test the actual agents.ts function
  try {
    const { draftFollowupEmail } = await import('@/lib/ai/agents');
    const draft = await draftFollowupEmail(
      'Alice',
      'TechVentures',
      'negotiation',
      'Discussing API pricing and integration timeline.',
    );
    result.function_test = draft;
  } catch (err: any) {
    result.function_error = err.message || String(err);
  }

  return NextResponse.json({ result, success: true });
}
