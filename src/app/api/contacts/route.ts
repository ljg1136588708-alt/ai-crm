import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { getUserByClerkId } from '@/lib/supabase/users';
import { getContacts } from '@/lib/supabase/queries';

export async function GET(req: Request) {
  const { userId: clerkId } = await auth();
  if (!clerkId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const user = await getUserByClerkId(clerkId);
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

  const { searchParams } = new URL(req.url);
  const search = searchParams.get('q') || undefined;

  const contacts = await getContacts(user.id, search);
  return NextResponse.json({ data: contacts, success: true });
}
