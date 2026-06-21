import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

const isProtectedRoute = createRouteMatcher([
  '/dashboard(.*)',
]);

export default clerkMiddleware(async (auth, req) => {
  if (isProtectedRoute(req)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals and static files
    '/((?!_next|.*\\.(?:ico|png|jpg|jpeg|svg|css|js|woff|woff2|ttf|eot)$).*)',
    '/',
    '/(api|trpc)(.*)',
  ],
};
