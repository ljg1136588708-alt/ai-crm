import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { getUserByClerkId } from '@/lib/supabase/users';
import { getFollowups } from '@/lib/supabase/queries';

export async function GET() {
  const { userId: clerkId } = await auth();
  if (!clerkId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const user = await getUserByClerkId(clerkId);
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

  const followups = await getFollowups(user.id);
  return NextResponse.json({ data: followups, success: true });
}
