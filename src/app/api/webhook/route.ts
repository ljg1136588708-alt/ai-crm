// POST /api/webhook — handle PayPal IPN (subscription events)
export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { getServiceClient } from '@/lib/supabase/client';

const FREE_QUOTA = 12;

async function verifyIPN(body: string): Promise<boolean> {
  try {
    const verifyUrl = process.env.PAYPAL_SANDBOX === 'true'
      ? 'https://ipnpb.sandbox.paypal.com/cgi-bin/webscr'
      : 'https://ipnpb.paypal.com/cgi-bin/webscr';

    const verifyBody = `cmd=_notify-validate&${body}`;
    const resp = await fetch(verifyUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: verifyBody,
    });
    const text = await resp.text();
    return text.trim() === 'VERIFIED';
  } catch {
    return false;
  }
}

export async function POST(req: Request) {
  const body = await req.text();
  const verified = await verifyIPN(body);

  if (!verified) {
    console.warn('IPN verification failed');
    return NextResponse.json({ error: 'Not verified' }, { status: 400 });
  }

  const params = new URLSearchParams(body);
  const txnType = params.get('txn_type') || '';
  const clerkId = params.get('custom') || '';

  // Log every verified IPN's key fields so payments can be traced in Vercel Logs.
  console.log('IPN received:', {
    txn_type: txnType,
    payment_status: params.get('payment_status') || '',
    custom: clerkId,
    item_number: params.get('item_number') || '',
    subscr_id: params.get('subscr_id') || '',
    amount: params.get('mc_gross') || params.get('amount3') || '',
  });

  if (!clerkId) {
    console.warn('IPN missing custom (clerkId) — ignoring');
    return NextResponse.json({ received: true });
  }

  const supabase = getServiceClient();

  try {
    // Subscription created or renewed
    if (txnType === 'subscr_signup' || txnType === 'subscr_payment') {
      const itemNumber = params.get('item_number') || '';
      const interval = itemNumber === 'aifoto-pro-yearly' ? 'yearly' : 'monthly';

      // Only set pro_since on first activation (don't overwrite on renewal)
      const { data: existing } = await supabase.from('users').select('pro_since').eq('clerk_id', clerkId).single();

      await supabase.from('users').upsert({
        clerk_id: clerkId,
        is_pro: true,
        pro_interval: interval,
        pro_since: existing?.pro_since || new Date().toISOString(),
        subscr_id: params.get('subscr_id') || Date.now().toString(),
        quota_remaining: -1,
        quota_total: -1,
      }, { onConflict: 'clerk_id' });

      console.log(`✅ Pro activated for ${clerkId} (${interval}, sub ${params.get('subscr_id')})`);
    }

    // Subscription ended. Note: subscr_failed is NOT treated as an end —
    // PayPal retries failed payments, so we only downgrade on a confirmed
    // cancellation (subscr_cancel) or end-of-term (subscr_eot).
    if (txnType === 'subscr_cancel' || txnType === 'subscr_eot') {
      await supabase.from('users').update({
        is_pro: false,
        pro_until: new Date().toISOString(),
        quota_remaining: FREE_QUOTA,
        quota_total: FREE_QUOTA,
      }).eq('clerk_id', clerkId);

      console.log(`⚠️ Pro ended for ${clerkId} (${txnType})`);
    }
  } catch (err: any) {
    console.error('IPN handler error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }

  return new NextResponse(null, { status: 200 });
}
