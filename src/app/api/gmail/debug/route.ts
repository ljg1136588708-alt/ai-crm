import { NextResponse } from 'next/server';

export async function GET() {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL;
  const fallbackUrl = 'https://ai-crm-red-pi.vercel.app';
  const redirectUri = `${appUrl || fallbackUrl}/api/gmail/callback`;

  const params = new URLSearchParams({
    client_id: clientId || 'MISSING',
    redirect_uri: redirectUri,
    response_type: 'code',
    access_type: 'offline',
    prompt: 'consent',
    scope: 'https://www.googleapis.com/auth/gmail.readonly https://www.googleapis.com/auth/gmail.send',
  });

  return NextResponse.json({
    clientIdFirst: clientId?.slice(0, 40),
    clientIdLast: clientId?.slice(-20),
    redirectUri,
    constructedUrl: `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`,
  });
}
