import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { getUserByClerkId } from '@/lib/supabase/users';
import { supabase } from '@/lib/supabase/client';
import { answerQuery } from '@/lib/ai/agents';

export async function POST(req: Request) {
  const { userId: clerkId } = await auth();
  if (!clerkId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const user = await getUserByClerkId(clerkId);
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

  const { query } = await req.json();
  if (!query || typeof query !== 'string') {
    return NextResponse.json({ error: 'Query is required' }, { status: 400 });
  }

  // Build context from user's CRM data
  const { data: contacts } = await supabase.from('contacts').select('name, email, company, last_contacted_at').eq('user_id', user.id);
  const { data: deals } = await supabase.from('deals').select('title, stage, amount, last_activity_at').eq('user_id', user.id);
  const { data: followups } = await supabase.from('followup_reminders').select('reason, is_dismissed').eq('user_id', user.id).eq('is_dismissed', false);

  const contextParts: string[] = [];
  if (contacts?.length) {
    contextParts.push(`Contacts (${contacts.length}): ${JSON.stringify(contacts.slice(0, 20))}`);
  }
  if (deals?.length) {
    contextParts.push(`Deals (${deals.length}): ${JSON.stringify(deals.slice(0, 20))}`);
  }
  if (followups?.length) {
    contextParts.push(`Pending follow-ups: ${followups.length}`);
  }

  const schemaContext = contextParts.join('\n') || 'No CRM data yet.';

  const response = await answerQuery(query, schemaContext);

  // Log the query
  await supabase.from('queries').insert({
    user_id: user.id,
    query_text: query,
    response_text: response,
  });

  return NextResponse.json({ data: { answer: response }, success: true });
}
