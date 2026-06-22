// POST /api/webhook — handle Lemon Squeezy events
export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { getServiceClient } from '@/lib/supabase/client';

function verifySignature(payload: string, signature: string): boolean {
  const secret = process.env.LEMONSQUEEZY_WEBHOOK_SECRET!;
  const hmac = crypto.createHmac('sha256', secret);
  const digest = hmac.update(payload).digest('hex');
  return crypto.timingSafeEqual(
    Buffer.from(digest),
    Buffer.from(signature),
  );
}

export async function POST(req: Request) {
  const rawBody = await req.text();
  const signature = req.headers.get('x-signature') || '';

  if (!verifySignature(rawBody, signature)) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
  }

  const event = JSON.parse(rawBody);
  const eventName = event.meta?.event_name;
  const supabase = getServiceClient();

  try {
    switch (eventName) {
      case 'order_created': {
        // order_created fires on every successful purchase (one-time + subscription initial)
        const custom = event.data?.attributes?.custom_data;
        const clerkId = custom?.clerk_id;
        if (!clerkId) break;

        const orderId = event.data?.id;
        const variantName = event.data?.attributes?.variant_name || '';

        // Activate Pro
        await supabase.from('users').upsert({
          clerk_id: clerkId,
          is_pro: true,
          ls_order_id: String(orderId),
          quota_remaining: -1,
          quota_total: -1,
        }, { onConflict: 'clerk_id' });

        console.log(`✅ Pro activated for ${clerkId} (LS order ${orderId})`);
        break;
      }

      case 'subscription_cancelled': {
        const custom = event.data?.attributes?.custom_data;
        const clerkId = custom?.clerk_id;
        if (!clerkId) break;

        await supabase.from('users').update({
          is_pro: false,
          quota_remaining: 50,
          quota_total: 50,
        }).eq('clerk_id', clerkId);

        console.log(`⚠️ Pro cancelled for ${clerkId}`);
        break;
      }

      case 'subscription_payment_failed': {
        const custom = event.data?.attributes?.custom_data;
        const clerkId = custom?.clerk_id;
        if (clerkId) {
          console.warn(`💳 Payment failed for ${clerkId}`);
        }
        break;
      }

      case 'subscription_expired': {
        const custom = event.data?.attributes?.custom_data;
        const clerkId = custom?.clerk_id;
        if (!clerkId) break;

        await supabase.from('users').update({
          is_pro: false,
          quota_remaining: 50,
          quota_total: 50,
        }).eq('clerk_id', clerkId);

        console.log(`⚠️ Pro expired for ${clerkId}`);
        break;
      }
    }
  } catch (err: any) {
    console.error('Webhook handler error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
