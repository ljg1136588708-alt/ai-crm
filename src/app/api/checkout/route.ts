// POST /api/checkout — generate PayPal subscription URL
import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';

// PayPal subscription button params
const BUSINESS = process.env.PAYPAL_BUSINESS_EMAIL!;
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://aicrm.shangqiushi.com';

export async function POST() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const params = new URLSearchParams({
    cmd: '_xclick-subscriptions',
    business: BUSINESS,
    item_name: 'AI Foto Pro',
    item_number: 'aifoto-pro-monthly',
    a3: '9.99',
    p3: '1',
    t3: 'M',
    src: '1',
    sra: '1',        // reattempt on failure
    no_note: '1',
    no_shipping: '1',
    rm: '2',          // POST to return URL
    custom: userId,
    return: `${APP_URL}/pricing/success`,
    cancel_return: `${APP_URL}/pricing`,
    notify_url: `${APP_URL}/api/webhook`,
    currency_code: 'USD',
    charset: 'utf-8',
  });

  const url = `https://www.paypal.com/cgi-bin/webscr?${params.toString()}`;
  return NextResponse.json({ url });
}
