// GET /api/image/history — get user's generation history
import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { getServiceClient } from '@/lib/supabase/client';

export async function GET(req: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const supabase = getServiceClient();
  const url = new URL(req.url);
  const limit = parseInt(url.searchParams.get('limit') || '20');
  const offset = parseInt(url.searchParams.get('offset') || '0');

  const { data, error } = await supabase
    .from('generations')
    .select('*')
    .eq('clerk_id', userId)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Also get quota
  const { data: user } = await supabase.from('users').select('quota_remaining, quota_total').eq('clerk_id', userId).single();

  return NextResponse.json({
    success: true,
    items: data || [],
    quota: user || { quota_remaining: 0, quota_total: 50 },
    total: data?.length || 0,
  });
}
