import { NextResponse } from 'next/server';

// Debug endpoint to verify env vars are set correctly
export async function GET() {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const hasSecret = !!process.env.GOOGLE_CLIENT_SECRET;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL;

  return NextResponse.json({
    clientIdPrefix: clientId ? clientId.slice(0, 30) + '...' : 'MISSING',
    clientIdSuffix: clientId ? '...' + clientId.slice(-20) : '',
    hasSecret,
    appUrl: appUrl || 'not set (using fallback)',
    fullClientId: clientId ? 'SET (hidden)' : 'NOT SET',
  });
}
