import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';

const intlMiddleware = createMiddleware(routing);

const isProtected = createRouteMatcher([
  '/en/dashboard(.*)',
  '/zh/dashboard(.*)',
]);

export default clerkMiddleware(async (auth, req) => {
  // Step 1: let next-intl handle locale redirects/cookies
  const intlResponse = intlMiddleware(req);
  if (intlResponse) return intlResponse;

  // Step 2: auth check for dashboard routes
  if (isProtected(req)) {
    const { userId } = await auth();
    if (!userId) {
      const locale = req.nextUrl.pathname.startsWith('/zh') ? 'zh' : 'en';
      return Response.redirect(new URL(`/${locale}/sign-in`, req.url));
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
