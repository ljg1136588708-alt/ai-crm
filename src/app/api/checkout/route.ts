// POST /api/checkout — return Gumroad product URL with clerk_id
import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';

const GUMROAD_PRODUCT_URL = process.env.GUMROAD_PRODUCT_URL!;
// Example: https://aifoto.gumroad.com/l/pro

export async function POST() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  // Pass Clerk user ID as a custom field so webhook can identify the user
  const url = `${GUMROAD_PRODUCT_URL}?clerk_id=${encodeURIComponent(userId)}`;

  return NextResponse.json({ url });
}
