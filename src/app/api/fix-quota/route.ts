// GET /api/fix-quota — repair corrupted quota for free users
import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { getServiceClient } from '@/lib/supabase/client';

export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const supabase = getServiceClient();
  const { data: user } = await supabase.from('users').select('quota_remaining, quota_total, is_pro').eq('clerk_id', userId).single();

  if (!user) {
    await supabase.from('users').insert({ clerk_id: userId, quota_remaining: 12, quota_total: 12 });
    return NextResponse.json({ fixed: true, previous: null, current: { remaining: 12, total: 12 } });
  }

  if (user.is_pro) {
    return NextResponse.json({ fixed: false, reason: 'pro user' });
  }

  // Fix if corrupted (total = 0 or undefined)
  if (user.quota_total <= 0) {
    await supabase.from('users').update({ quota_remaining: 12, quota_total: 12 }).eq('clerk_id', userId);
    return NextResponse.json({ fixed: true, previous: user, current: { remaining: 12, total: 12 } });
  }

  return NextResponse.json({ fixed: false, reason: 'ok', current: user });
}
