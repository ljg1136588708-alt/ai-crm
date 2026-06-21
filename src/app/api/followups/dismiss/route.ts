// POST /api/followups/dismiss — dismiss a followup reminder
import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { getServiceClient } from '@/lib/supabase/client';

export async function POST(req: Request) {
  const { userId: clerkId } = await auth();
  if (!clerkId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { followupId } = await req.json();
  if (!followupId) return NextResponse.json({ error: 'Missing followupId' }, { status: 400 });

  const supabase = getServiceClient();
  const { data: user } = await supabase
    .from('users')
    .select('id')
    .eq('clerk_id', clerkId)
    .single();

  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

  await supabase
    .from('followup_reminders')
    .update({ is_dismissed: true })
    .eq('id', followupId)
    .eq('user_id', user.id);

  return NextResponse.json({ success: true });
}
