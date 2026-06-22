// GET /api/admin/reset — clear all data
import { NextResponse } from 'next/server';
import { getServiceClient } from '@/lib/supabase/client';

export async function GET() {
  const supabase = getServiceClient();

  // Delete all rows
  const { data: allGens } = await supabase.from('generations').select('id');
  for (const row of allGens || []) {
    await supabase.from('generations').delete().eq('id', row.id);
  }

  const { data: allUsers } = await supabase.from('users').select('clerk_id');
  for (const row of allUsers || []) {
    await supabase.from('users').delete().eq('clerk_id', row.clerk_id);
  }

  // Verify
  const { data: users } = await supabase.from('users').select('*');
  const { data: gens } = await supabase.from('generations').select('*');

  return NextResponse.json({
    success: true,
    remainingUsers: users?.length || 0,
    remainingGenerations: gens?.length || 0,
  });
}
