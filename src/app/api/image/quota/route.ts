// GET /api/image/quota — check remaining quota + pro status + subscription info
import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { getServiceClient } from '@/lib/supabase/client';

const FREE_QUOTA = 12;

export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const supabase = getServiceClient();
  let { data: user } = await supabase
    .from('users')
    .select('quota_remaining, quota_total, is_pro, pro_since, pro_until, pro_interval')
    .eq('clerk_id', userId)
    .single();

  if (!user) {
    const { data: created } = await supabase.from('users').insert({
      clerk_id: userId,
      quota_remaining: FREE_QUOTA,
      quota_total: FREE_QUOTA,
    }).select('quota_remaining, quota_total, is_pro, pro_since, pro_until, pro_interval').single();
    user = created;
  }

  return NextResponse.json({
    remaining: user?.quota_remaining ?? FREE_QUOTA,
    total: user?.quota_total ?? FREE_QUOTA,
    isPro: user?.is_pro ?? false,
    proSince: user?.pro_since || null,
    proUntil: user?.pro_until || null,
    proInterval: user?.pro_interval || null,
  });
}
