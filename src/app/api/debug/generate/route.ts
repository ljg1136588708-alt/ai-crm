// GET /api/debug/generate?secret=demo — NO-AUTH test of draftFollowupEmail
import { NextResponse } from 'next/server';
import { draftFollowupEmail } from '@/lib/ai/agents';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  if (searchParams.get('secret') !== 'demo') {
    return NextResponse.json({ error: 'need ?secret=demo' }, { status: 401 });
  }
  const result: Record<string, any> = {
    env_has_key: !!process.env.ANTHROPIC_API_KEY,
    key_len: process.env.ANTHROPIC_API_KEY?.length ?? 0,
  };

  // Test draftFollowupEmail directly
  const t0 = Date.now();
  try {
    const draft = await draftFollowupEmail(
      'Alice',
      'TechVentures',
      'negotiation',
      'No previous emails. Active deal: Enterprise Platform Migration (negotiation), Q4 Maintenance Renewal (won)',
    );
    result.draft = draft;
    result.draft_success = true;
  } catch (err: any) {
    result.draft_success = false;
    result.draft_error = err?.message || String(err);
  }
  result.latency_ms = Date.now() - t0;

  return NextResponse.json({ result, success: true });
}
