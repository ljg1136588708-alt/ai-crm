// GET /api/image/history — get user's generation history (paginated)
// DELETE /api/image/history — delete a generation
import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { getServiceClient } from '@/lib/supabase/client';

export async function GET(req: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const supabase = getServiceClient();
  const url = new URL(req.url);
  const limit = parseInt(url.searchParams.get('limit') || '12');
  const offset = parseInt(url.searchParams.get('offset') || '0');

  const { data, error, count } = await supabase
    .from('generations')
    .select('*', { count: 'exact' })
    .eq('clerk_id', userId)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const { data: user } = await supabase.from('users').select('quota_remaining, quota_total').eq('clerk_id', userId).single();

  return NextResponse.json({
    success: true,
    items: data || [],
    total: count || 0,
    quota: user || { quota_remaining: 0, quota_total: 50 },
  });
}

export async function DELETE(req: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const supabase = getServiceClient();
  const url = new URL(req.url);
  const id = url.searchParams.get('id');

  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });

  // Verify ownership
  const { data: record } = await supabase
    .from('generations')
    .select('id, clerk_id, image_url')
    .eq('id', id)
    .single();

  if (!record || record.clerk_id !== userId) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  // Delete from storage
  try {
    const urlObj = new URL(record.image_url);
    const path = urlObj.pathname.replace('/storage/v1/object/public/generations/', '');
    await supabase.storage.from('generations').remove([path]);
  } catch { /* storage delete is best-effort */ }

  // Delete from database
  await supabase.from('generations').delete().eq('id', id);

  return NextResponse.json({ success: true });
}
