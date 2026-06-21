// GET /api/debug/ai — test OpenRouter Claude connectivity (gated)
import { NextResponse } from 'next/server';

export async function GET() {
  // Only available in development or with explicit opt-in
  if (process.env.NODE_ENV === 'production' && !process.env.ENABLE_DEBUG) {
    return NextResponse.json({ error: 'Debug disabled in production' }, { status: 403 });
  }

  const results: Record<string, any> = {};

  // Check env
  results.has_api_key = !!process.env.ANTHROPIC_API_KEY;
  results.key_prefix = process.env.ANTHROPIC_API_KEY?.slice(0, 10) + '...';

  // Test OpenRouter call
  try {
    const start = Date.now();
    const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.ANTHROPIC_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'anthropic/claude-haiku-4.5',
        max_tokens: 50,
        messages: [{ role: 'user', content: 'Reply with just the word "pong"' }],
      }),
    });
    results.http_status = res.status;
    results.latency_ms = Date.now() - start;

    const text = await res.text();
    if (res.ok) {
      const data = JSON.parse(text);
      results.model = data.model;
      results.response = data.choices?.[0]?.message?.content?.trim();
    } else {
      results.error = text.slice(0, 500);
    }
  } catch (err: any) {
    results.error = err.message || String(err);
  }

  return NextResponse.json({ results, success: true });
}
