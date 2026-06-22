// GET /api/admin/reset — clear all data
import { NextResponse } from 'next/server';
import { getServiceClient } from '@/lib/supabase/client';

export async function GET() {
  const supabase = getServiceClient();

  // Clear tables
  const { error: e1 } = await supabase.from('generations').delete().neq('id', 0);
  const { error: e2 } = await supabase.from('users').delete().neq('clerk_id', '');

  // Verify
  const { data: users } = await supabase.from('users').select('count');
  const { data: gens } = await supabase.from('generations').select('count');

  return NextResponse.json({
    success: true,
    remainingUsers: users?.length || 0,
    remainingGenerations: gens?.length || 0,
    errors: { users: e2?.message || null, generations: e1?.message || null },
  });
}
