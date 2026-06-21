import { clerkMiddleware } from '@clerk/nextjs/server';

// Middleware handles auth but doesn't block — we'll protect in layout
export default clerkMiddleware();

export const config = {
  matcher: ['/((?!.*\\..*|_next).*)', '/', '/(api|trpc)(.*)'],
};
