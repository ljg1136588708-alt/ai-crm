import { NextResponse } from 'next/server';
import { Webhook } from 'svix';
import { headers } from 'next/headers';
import { upsertUser } from '@/lib/supabase/users';

export async function POST(req: Request) {
  const SIGNING_SECRET = process.env.CLERK_WEBHOOK_SECRET;
  if (!SIGNING_SECRET) {
    return NextResponse.json({ error: 'Missing webhook secret' }, { status: 500 });
  }

  const headerPayload = await headers();
  const svixId = headerPayload.get('svix-id');
  const svixTimestamp = headerPayload.get('svix-timestamp');
  const svixSignature = headerPayload.get('svix-signature');

  if (!svixId || !svixTimestamp || !svixSignature) {
    return NextResponse.json({ error: 'Missing svix headers' }, { status: 400 });
  }

  const payload = await req.json();
  const body = JSON.stringify(payload);

  const wh = new Webhook(SIGNING_SECRET);
  let evt: { type: string; data: Record<string, unknown> };

  try {
    evt = wh.verify(body, {
      'svix-id': svixId,
      'svix-timestamp': svixTimestamp,
      'svix-signature': svixSignature,
    }) as { type: string; data: Record<string, unknown> };
  } catch {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  // Handle user.created and user.updated
  if (evt.type === 'user.created' || evt.type === 'user.updated') {
    const { id, email_addresses, first_name, last_name, image_url } = evt.data;
    const email = (email_addresses as Array<{ email_address: string }>)?.[0]?.email_address;
    const name = [first_name, last_name].filter(Boolean).join(' ') || undefined;

    if (id && email) {
      await upsertUser(id as string, email, name, image_url as string | undefined);
    }
  }

  return NextResponse.json({ success: true });
}
