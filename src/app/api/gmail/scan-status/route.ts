// GET /api/gmail/scan-status — check email scanning progress
import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { getServiceClient } from '@/lib/supabase/client';
import { getScanProgress } from '@/lib/gmail/scanner';

export async function GET() {
  const { userId: clerkId } = await auth();
  if (!clerkId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const supabase = getServiceClient();
  const { data: user } = await supabase
    .from('users')
    .select('id')
    .eq('clerk_id', clerkId)
    .single();

  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

  const progress = getScanProgress(user.id);

  if (!progress) {
    return NextResponse.json({
      status: 'idle',
      progress: null,
      success: true,
    });
  }

  return NextResponse.json({
    status: progress.stage,
    progress,
    success: true,
  });
}
