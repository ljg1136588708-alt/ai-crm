// POST /api/admin/reset — clear all user data
import { NextResponse } from 'next/server';
import { getServiceClient } from '@/lib/supabase/client';

export async function POST() {
  const supabase = getServiceClient();

  await supabase.from('generations').delete().neq('id', 0);
  await supabase.from('users').delete().neq('clerk_id', '');

  return NextResponse.json({ success: true, cleared: { generations: true, users: true } });
}
