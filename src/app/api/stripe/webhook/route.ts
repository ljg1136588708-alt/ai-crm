// POST /api/stripe/webhook — handle Stripe events (payment success, etc.)
export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { getServiceClient } from '@/lib/supabase/client';

function getStripe() {
  return new Stripe(process.env.STRIPE_SECRET_KEY!);
}
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(req: Request) {
  const sig = req.headers.get('stripe-signature');
  if (!sig) return NextResponse.json({ error: 'Missing signature' }, { status: 400 });

  let event: Stripe.Event;
  try {
    const stripe = getStripe();
    const body = await req.text();
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
  } catch (err: any) {
    console.error('Webhook signature error:', err);
    return NextResponse.json({ error: err.message }, { status: 400 });
  }

  const supabase = getServiceClient();

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const clerkId = session.metadata?.clerk_id || session.client_reference_id;
        if (!clerkId) break;

        // Mark user as pro — set quota to unlimited (-1 means unlimited)
        await supabase.from('users').upsert({
          clerk_id: clerkId,
          is_pro: true,
          stripe_customer_id: session.customer as string,
          stripe_subscription_id: session.subscription as string,
          quota_remaining: -1,
          quota_total: -1,
        }, { onConflict: 'clerk_id' });

        console.log(`✅ Pro activated for clerk ${clerkId}`);
        break;
      }

      case 'customer.subscription.deleted': {
        const sub = event.data.object as Stripe.Subscription;
        const clerkId = sub.metadata?.clerk_id;
        if (!clerkId) {
          // Try to look up by subscription ID
          const { data: user } = await supabase.from('users')
            .select('clerk_id')
            .eq('stripe_subscription_id', sub.id)
            .single();
          if (!user) break;
          await supabase.from('users').update({
            is_pro: false,
            quota_remaining: 50,
            quota_total: 50,
            stripe_subscription_id: null,
          }).eq('clerk_id', user.clerk_id);
          console.log(`⚠️ Pro cancelled for clerk ${user.clerk_id}`);
        } else {
          await supabase.from('users').update({
            is_pro: false,
            quota_remaining: 50,
            quota_total: 50,
            stripe_subscription_id: null,
          }).eq('clerk_id', clerkId);
          console.log(`⚠️ Pro cancelled for clerk ${clerkId}`);
        }
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        const clerkId = invoice.metadata?.clerk_id;
        if (clerkId) {
          console.warn(`💳 Payment failed for clerk ${clerkId}`);
        }
        break;
      }
    }
  } catch (err: any) {
    console.error('Webhook handler error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
