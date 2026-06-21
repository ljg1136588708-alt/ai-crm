// POST /api/image/seed — create required tables/storage if missing
import { NextResponse } from 'next/server';
import { getServiceClient } from '@/lib/supabase/client';

export async function POST() {
  const supabase = getServiceClient();

  const results: string[] = [];

  // Create generations table
  const { error: tableErr } = await supabase.rpc('create_generations_table_if_needed').maybeSingle();
  if (tableErr) {
    results.push(`Table check: ${tableErr.message}`);
  } else {
    results.push('Table "generations" ready');
  }

  // Check storage bucket
  const { data: buckets } = await supabase.storage.listBuckets();
  const hasBucket = buckets?.some((b: any) => b.name === 'generations');
  if (!hasBucket) {
    const { error: bucketErr } = await supabase.storage.createBucket('generations', { public: true });
    results.push(bucketErr ? `Bucket error: ${bucketErr.message}` : 'Bucket "generations" created');
  } else {
    results.push('Bucket "generations" ready');
  }

  // Ensure users have quota columns
  const { error: userErr } = await supabase.from('users').select('quota_remaining').limit(1).maybeSingle();
  if (userErr) {
    results.push(`User quota check: ${userErr.message} (run supabase-migration.sql)`);
  } else {
    results.push('User quota columns ready');
  }

  return NextResponse.json({ results });
}
