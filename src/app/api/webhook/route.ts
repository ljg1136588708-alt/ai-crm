// POST /api/webhook — handle Gumroad ping (purchase/subscription events)
export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { getServiceClient } from '@/lib/supabase/client';

// Gumroad sends form-encoded POST, not JSON
export async function POST(req: Request) {
  let body: Record<string, string>;
  try {
    const text = await req.text();
    body = Object.fromEntries(new URLSearchParams(text));
  } catch {
    return NextResponse.json({ error: 'Invalid body' }, { status: 400 });
  }

  const productPermalink = body.product_permalink || '';
  const expectedPermalink = process.env.GUMROAD_PRODUCT_PERMALINK || '';

  // Only accept pings for our product
  if (productPermalink !== expectedPermalink) {
    return NextResponse.json({ error: 'Unknown product' }, { status: 403 });
  }

  // Gumroad sends a URL param "cancelled=true" for subscription cancellations
  const isCancelled = body.cancelled === 'true';

  // Custom field passed via URL: ?clerk_id=xxx
  const clerkId = body.clerk_id;
  if (!clerkId) {
    console.warn('No clerk_id in webhook payload');
    return NextResponse.json({ received: true });
  }

  const supabase = getServiceClient();

  try {
    if (isCancelled) {
      // Subscription cancelled or ended
      await supabase.from('users').update({
        is_pro: false,
        quota_remaining: 50,
        quota_total: 50,
      }).eq('clerk_id', clerkId);

      console.log(`⚠️ Pro cancelled for ${clerkId}`);
    } else {
      // New purchase or subscription renewal
      const orderId = body.sale_id || body.purchase_id || Date.now().toString();

      await supabase.from('users').upsert({
        clerk_id: clerkId,
        is_pro: true,
        ls_order_id: orderId,
        quota_remaining: -1,
        quota_total: -1,
      }, { onConflict: 'clerk_id' });

      console.log(`✅ Pro activated for ${clerkId} (Gumroad order ${orderId})`);
    }
  } catch (err: any) {
    console.error('Gumroad webhook error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
