// POST /api/webhook — handle PayPal IPN (subscription events)
export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { getServiceClient } from '@/lib/supabase/client';

async function verifyIPN(body: string): Promise<boolean> {
  try {
    // Post back to PayPal for verification
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
  const paymentStatus = params.get('payment_status') || '';
  const clerkId = params.get('custom') || '';

  if (!clerkId) {
    return NextResponse.json({ received: true });
  }

  const supabase = getServiceClient();

  try {
    // Subscription created
    if (txnType === 'subscr_signup' || txnType === 'subscr_payment') {
      await supabase.from('users').upsert({
        clerk_id: clerkId,
        is_pro: true,
        ls_order_id: params.get('subscr_id') || Date.now().toString(),
        quota_remaining: -1,
        quota_total: -1,
      }, { onConflict: 'clerk_id' });

      console.log(`✅ Pro activated for ${clerkId} (PayPal sub ${params.get('subscr_id')})`);
    }

    // Subscription cancelled or expired
    if (txnType === 'subscr_cancel' || txnType === 'subscr_eot' || txnType === 'subscr_failed') {
      await supabase.from('users').update({
        is_pro: false,
        quota_remaining: 12,
        quota_total: 12,
      }).eq('clerk_id', clerkId);

      console.log(`⚠️ Pro ended for ${clerkId} (${txnType})`);
    }
  } catch (err: any) {
    console.error('IPN handler error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }

  // PayPal expects an empty 200 response
  return new NextResponse(null, { status: 200 });
}
