// POST /api/followups/generate — AI generates follow-up reminders + email drafts
import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { getServiceClient } from '@/lib/supabase/client';
import { draftFollowupEmail } from '@/lib/ai/agents';

export async function POST() {
  const { userId: clerkId } = await auth();
  if (!clerkId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const supabase = getServiceClient();
  const { data: user } = await supabase
    .from('users')
    .select('id')
    .eq('clerk_id', clerkId)
    .single();

  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

  // Find contacts with stale last_contacted_at (> 5 days)
  const fiveDaysAgo = new Date(Date.now() - 5 * 86400000).toISOString();
  const { data: staleContacts } = await supabase
    .from('contacts')
    .select('id, name, email, company, last_contacted_at')
    .eq('user_id', user.id)
    .or(`last_contacted_at.is.null,last_contacted_at.lt.${fiveDaysAgo}`)
    .order('last_contacted_at', { ascending: true, nullsFirst: true })
    .limit(10);

  if (!staleContacts?.length) {
    return NextResponse.json({
      message: 'All contacts have been contacted recently. No reminders needed.',
      generated: 0,
      success: true,
    });
  }

  let generated = 0;
  const errors: string[] = [];

  for (const contact of staleContacts) {
    // Check if already has an active reminder
    const { data: existing } = await supabase
      .from('followup_reminders')
      .select('id')
      .eq('user_id', user.id)
      .eq('contact_id', contact.id)
      .eq('is_dismissed', false)
      .limit(1);

    if (existing?.length) continue; // skip if already reminded

    // Get recent emails for context
    const { data: recentEmails } = await supabase
      .from('emails')
      .select('subject, snippet, direction, sender, sent_at')
      .eq('user_id', user.id)
      .eq('contact_id', contact.id)
      .order('sent_at', { ascending: false })
      .limit(5);

    // Get related deals
    const { data: relatedDeals } = await supabase
      .from('deals')
      .select('id, title, stage')
      .eq('user_id', user.id)
      .eq('contact_id', contact.id);

    // AI drafts followup email
    let draftSubject: string | null = null;
    let draftBody: string | null = null;
    let reason = `Haven't contacted ${contact.name || contact.email} recently.`;

    try {
      const emailContext = (recentEmails || [])
        .map((e: any) => `${e.direction === 'inbound' ? 'From' : 'To'} ${e.sender}: ${e.subject} — ${e.snippet?.slice(0, 100)}`)
        .join('\n');

      const dealContext = (relatedDeals || [])
        .map((d: any) => `${d.title} (${d.stage})`)
        .join(', ');

      const dealStage = relatedDeals?.[0]?.stage || 'lead';
      const fullContext = `Recent emails:\n${emailContext || 'No previous emails.'}\n\nActive deals: ${dealContext || 'None'}`;

      const draft = await draftFollowupEmail(
        contact.name || contact.email || 'Unknown',
        contact.company || '',
        dealStage,
        fullContext,
      );

      reason = `Follow up with ${contact.name || contact.email} — ${dealStage === 'lead' ? 'initial outreach' : dealContext || 'check in'}`;
      draftSubject = draft.subject;
      draftBody = draft.body;
    } catch (err: any) {
      const msg = err?.message || String(err);
      errors.push(`${contact.name || contact.email}: ${msg}`);
      console.error(`Failed to draft followup for ${contact.email}:`, msg);
      // Log the error
      await supabase.from('ai_activities').insert({
        user_id: user.id,
        action_type: 'followup_drafted',
        input_summary: `Contact: ${contact.name || contact.email}`,
        output_summary: `ERROR: ${msg.slice(0, 200)}`,
      });
      // Continue without AI draft — still generate a basic reminder
    }

    await supabase.from('followup_reminders').insert({
      user_id: user.id,
      contact_id: contact.id,
      deal_id: relatedDeals?.[0]?.id || null,
      reason,
      draft_email_subject: draftSubject,
      draft_email_body: draftBody,
      is_dismissed: false,
      is_sent: false,
    });

    generated++;

    // Log AI activity
    if (draftBody) {
      await supabase.from('ai_activities').insert({
        user_id: user.id,
        action_type: 'followup_drafted',
        input_summary: `Contact: ${contact.name || contact.email}`,
        output_summary: reason,
      });
    }
  }

  return NextResponse.json({
    message: `Generated ${generated} follow-up reminder${generated !== 1 ? 's' : ''}.`,
    generated,
    errors: errors.length > 0 ? errors : undefined,
    success: true,
  });
}
