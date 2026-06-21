import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';
import { NextResponse } from 'next/server';

// next-intl handles locale prefix/detection
const intlMiddleware = createMiddleware(routing);

// Routes that need auth (already locale-prefixed by intl middleware)
const isProtected = createRouteMatcher([
  '/en/dashboard(.*)',
  '/zh/dashboard(.*)',
]);

export default clerkMiddleware(async (auth, req) => {
  // Step 1: next-intl locale handling
  const intlRes = intlMiddleware(req);
  if (intlRes) return intlRes;

  // Step 2: Clerk auth protection (only runs if intl middleware passed through)
  if (isProtected(req)) {
    const { userId } = await auth();
    if (!userId) {
      const locale = req.nextUrl.pathname.match(/^\/(en|zh)\//)?.[1] || 'en';
      const signInUrl = new URL(`/${locale}/sign-in`, req.url);
      return NextResponse.redirect(signInUrl);
    }
  }
});

export const config = {
  matcher: [
    // Match root for locale redirect
    '/',
    // Match locale-prefixed pages (but not API routes)
    '/(en|zh)/:path*',
    // Match unprotected pages at root (sign-in, sign-up, pricing under old paths for backward compat)
    '/((?!_next|api|.*\\..*).*)',
  ],
};
