// POST /api/gmail/scan — trigger email scanning
import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { getServiceClient } from '@/lib/supabase/client';
import { scanEmails, getScanProgress } from '@/lib/gmail/scanner';

export async function POST() {
  const { userId: clerkId } = await auth();
  if (!clerkId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  // Get user's Supabase ID and Gmail credentials
  const supabase = getServiceClient();
  const { data: user } = await supabase
    .from('users')
    .select('id, gmail_connected, gmail_email, gmail_refresh_token_encrypted')
    .eq('clerk_id', clerkId)
    .single();

  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });
  if (!user.gmail_connected || !user.gmail_refresh_token_encrypted) {
    return NextResponse.json({ error: 'Gmail not connected' }, { status: 400 });
  }

  // Check if already scanning
  const existing = getScanProgress(user.id);
  if (existing && existing.stage !== 'done' && existing.stage !== 'error') {
    return NextResponse.json({
      status: 'already_scanning',
      progress: existing,
      success: false,
    });
  }

  // Trigger scan
  const result = await scanEmails(
    user.id,
    clerkId,
    user.gmail_email || '',
    user.gmail_refresh_token_encrypted,
  );

  return NextResponse.json({
    status: 'completed',
    stats: result,
    success: true,
  });
}
