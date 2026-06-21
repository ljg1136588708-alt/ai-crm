import { clerkMiddleware } from '@clerk/nextjs/server';
import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';
import { NextResponse } from 'next/server';

const intlMiddleware = createMiddleware(routing);

export default clerkMiddleware(async (auth, req) => {
  // Step 1: let next-intl handle locale redirects/cookies
  const intlResponse = intlMiddleware(req);
  if (intlResponse) return intlResponse;

  // Step 2: protect dashboard routes
  if (req.nextUrl.pathname.match(/^\/(en|zh)\/dashboard/)) {
    const { userId } = await auth();
    if (!userId) {
      const locale = req.nextUrl.pathname.startsWith('/zh') ? 'zh' : 'en';
      return NextResponse.redirect(new URL(`/${locale}/sign-in`, req.url));
    }
  }
});

export const config = {
  matcher: [
    '/',
    '/(en|zh)/:path*',
    '/((?!_next|api|.*\\..*).*)',
  ],
};
