// POST /api/checkout — generate PayPal subscription URL
import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';

const BUSINESS = process.env.PAYPAL_BUSINESS_EMAIL!;
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://aicrm.shangqiushi.com';

// Use sandbox checkout when PAYPAL_SANDBOX=true so the whole flow can be tested
// for free. Must match the IPN verification host used in the webhook.
const PAYPAL_URL = process.env.PAYPAL_SANDBOX === 'true'
  ? 'https://www.sandbox.paypal.com/cgi-bin/webscr'
  : 'https://www.paypal.com/cgi-bin/webscr';

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { plan } = (await req.json()) as { plan?: string };
  const isYearly = plan === 'yearly';

  const params = new URLSearchParams({
    cmd: '_xclick-subscriptions',
    business: BUSINESS,
    item_name: isYearly ? 'AI Foto Pro — Yearly' : 'AI Foto Pro — Monthly',
    item_number: isYearly ? 'aifoto-pro-yearly' : 'aifoto-pro-monthly',
    a3: isYearly ? '120.00' : '15.00',
    p3: isYearly ? '1' : '1',
    t3: isYearly ? 'Y' : 'M',    // Year / Month
    src: '1',
    sra: '1',
    no_note: '1',
    no_shipping: '1',
    rm: '2',
    custom: userId,
    return: `${APP_URL}/pricing/success`,
    cancel_return: `${APP_URL}/pricing`,
    notify_url: `${APP_URL}/api/webhook`,
    currency_code: 'USD',
    charset: 'utf-8',
  });

  const url = `${PAYPAL_URL}?${params.toString()}`;
  return NextResponse.json({ url });
}
