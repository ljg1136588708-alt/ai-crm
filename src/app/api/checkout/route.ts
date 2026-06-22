// POST /api/checkout — create Lemon Squeezy checkout
import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';

const LS_API = 'https://api.lemonsqueezy.com/v1';
const STORE_ID = process.env.LEMONSQUEEZY_STORE_ID!;
const VARIANT_ID = process.env.LEMONSQUEEZY_VARIANT_ID!;

export async function POST() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const origin = process.env.NEXT_PUBLIC_APP_URL || 'https://aicrm.shangqiushi.com';

  try {
    const resp = await fetch(`${LS_API}/checkouts`, {
      method: 'POST',
      headers: {
        'Accept': 'application/vnd.api+json',
        'Content-Type': 'application/vnd.api+json',
        'Authorization': `Bearer ${process.env.LEMONSQUEEZY_API_KEY}`,
      },
      body: JSON.stringify({
        data: {
          type: 'checkouts',
          attributes: {
            product_options: {
              redirect_url: `${origin}/pricing/success`,
            },
            checkout_data: {
              custom: { clerk_id: userId },
            },
          },
          relationships: {
            store: {
              data: { type: 'stores', id: STORE_ID },
            },
            variant: {
              data: { type: 'variants', id: VARIANT_ID },
            },
          },
        },
      }),
    });

    const data = await resp.json();
    if (!resp.ok) {
      console.error('Lemon Squeezy checkout error:', data);
      throw new Error(data.errors?.[0]?.detail || 'Checkout creation failed');
    }

    const checkoutUrl = data.data?.attributes?.url;
    if (!checkoutUrl) throw new Error('No checkout URL returned');

    return NextResponse.json({ url: checkoutUrl });
  } catch (err: any) {
    console.error('Checkout error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
