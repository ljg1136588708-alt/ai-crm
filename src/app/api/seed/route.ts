// POST /api/seed — populate demo pipeline data for testing
import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { getServiceClient } from '@/lib/supabase/client';

const DEMO_CONTACTS = [
  { name: 'Alice Chen', email: 'alice@techventures.io', company: 'TechVentures', title: 'VP of Engineering' },
  { name: 'Bob Martinez', email: 'bob@scaleup.com', company: 'ScaleUp Inc', title: 'CTO' },
  { name: 'Carol Wu', email: 'carol@datapulse.co', company: 'DataPulse', title: 'Head of Product' },
  { name: 'David Kim', email: 'david@cloudship.dev', company: 'Cloudship', title: 'CEO' },
  { name: 'Eva Johansson', email: 'eva@nordcap.io', company: 'Nordcap', title: 'Investment Manager' },
  { name: 'Frank Li', email: 'frank@apex.ai', company: 'Apex AI', title: 'Director of Sales' },
  { name: 'Grace Park', email: 'grace@meridian.io', company: 'Meridian Labs', title: 'COO' },
];

const DEMO_DEALS = [
  { contactIdx: 0, title: 'Enterprise Platform Migration', stage: 'negotiation', amount: 48000, confidence: 4 },
  { contactIdx: 0, title: 'Q4 Maintenance Renewal', stage: 'won', amount: 12000, confidence: 5 },
  { contactIdx: 1, title: 'API Integration Pilot', stage: 'contacted', amount: 35000, confidence: 3 },
  { contactIdx: 2, title: 'Data Pipeline MVP', stage: 'lead', amount: 20000, confidence: 2 },
  { contactIdx: 2, title: 'Analytics Dashboard', stage: 'negotiation', amount: 65000, confidence: 4 },
  { contactIdx: 3, title: 'Cloud Migration Phase 1', stage: 'lead', amount: 90000, confidence: 2 },
  { contactIdx: 4, title: 'Seed Round Advisory', stage: 'negotiation', amount: 150000, confidence: 4 },
  { contactIdx: 5, title: 'Sales Team Onboarding', stage: 'contacted', amount: 28000, confidence: 3 },
  { contactIdx: 5, title: 'AI Model Licensing', stage: 'won', amount: 72000, confidence: 5 },
  { contactIdx: 6, title: 'Workspace Expansion Deal', stage: 'lead', amount: 45000, confidence: 2 },
];

export async function POST() {
  const { userId: clerkId } = await auth();
  if (!clerkId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const supabase = getServiceClient();

  // Get user
  const { data: user } = await supabase
    .from('users')
    .select('id')
    .eq('clerk_id', clerkId)
    .single();

  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

  // Clear existing demo data for this user
  await supabase.from('emails').delete().eq('user_id', user.id);
  await supabase.from('followup_reminders').delete().eq('user_id', user.id);
  await supabase.from('deals').delete().eq('user_id', user.id);
  await supabase.from('contacts').delete().eq('user_id', user.id);

  // Insert contacts
  const contacts: Array<{ id: string; email: string; name: string }> = [];
  for (const c of DEMO_CONTACTS) {
    const { data } = await supabase.from('contacts').insert({
      user_id: user.id,
      email: c.email,
      name: c.name,
      company: c.company,
      title: c.title,
      source: 'demo',
      last_contacted_at: new Date(Date.now() - Math.random() * 30 * 86400000).toISOString(),
    }).select('id').single();
    if (data) contacts.push({ ...c, id: data.id });
  }

  // Insert deals
  for (const d of DEMO_DEALS) {
    const contact = contacts[d.contactIdx];
    if (!contact) continue;
    await supabase.from('deals').insert({
      user_id: user.id,
      contact_id: contact.id,
      title: d.title,
      stage: d.stage,
      amount: d.amount,
      confidence: d.confidence,
      last_activity_at: new Date(Date.now() - Math.random() * 14 * 86400000).toISOString(),
    });
  }

  return NextResponse.json({
    success: true,
    stats: {
      contacts: contacts.length,
      deals: DEMO_DEALS.length,
    },
  });
}
