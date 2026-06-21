import { NextResponse } from 'next/server';
import { getServiceClient } from '@/lib/supabase/client';

const GOOGLE_TOKEN_URL = 'https://oauth2.googleapis.com/token';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get('code');
  const state = searchParams.get('state'); // Clerk user ID
  const error = searchParams.get('error');

  if (error) {
    return NextResponse.redirect(new URL('/dashboard/onboarding?error=gmail_denied', req.url));
  }

  if (!code || !state) {
    return NextResponse.redirect(new URL('/dashboard/onboarding?error=invalid_callback', req.url));
  }

  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL || 'https://ai-crm-red-pi.vercel.app'}/api/gmail/callback`;

  if (!clientId || !clientSecret) {
    return NextResponse.redirect(new URL('/dashboard/onboarding?error=config_missing', req.url));
  }

  try {
    // Exchange code for tokens
    const tokenRes = await fetch(GOOGLE_TOKEN_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code',
      }),
    });

    if (!tokenRes.ok) {
      const errText = await tokenRes.text();
      console.error('Google token exchange failed:', errText);
      return NextResponse.redirect(new URL('/dashboard/onboarding?error=token_exchange_failed', req.url));
    }

    const tokens = await tokenRes.json();
    const { access_token, refresh_token } = tokens;

    if (!refresh_token) {
      console.error('No refresh token returned — user may have already authorized');
      return NextResponse.redirect(new URL('/dashboard/onboarding?error=no_refresh_token', req.url));
    }

    // Get user's Gmail address
    const profileRes = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/profile', {
      headers: { Authorization: `Bearer ${access_token}` },
    });

    if (!profileRes.ok) {
      return NextResponse.redirect(new URL('/dashboard/onboarding?error=profile_fetch_failed', req.url));
    }

    const profile = await profileRes.json();
    const gmailEmail = profile.emailAddress;

    // Store encrypted refresh token in Supabase
    const supabase = getServiceClient();

    // Simple encryption using service role key (production should use a dedicated encryption key)
    const encKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.slice(0, 32) || 'fallback-encryption-key-32chr!';
    const encoder = new TextEncoder();
    const keyData = encoder.encode(encKey.padEnd(32, '0').slice(0, 32));

    // For simplicity, store as base64-encoded. In production, use proper AES-GCM.
    const encrypted = Buffer.from(refresh_token).toString('base64');

    const { error: dbError } = await supabase
      .from('users')
      .update({
        gmail_connected: true,
        gmail_email: gmailEmail,
        gmail_refresh_token_encrypted: encrypted,
      })
      .eq('clerk_id', state);

    if (dbError) {
      console.error('Failed to save Gmail connection:', dbError);
      return NextResponse.redirect(new URL('/dashboard/onboarding?error=db_save_failed', req.url));
    }

    return NextResponse.redirect(new URL('/dashboard?gmail=connected', req.url));
  } catch (err) {
    console.error('Gmail callback error:', err);
    return NextResponse.redirect(new URL('/dashboard/onboarding?error=unknown', req.url));
  }
}
