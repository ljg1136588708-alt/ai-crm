import { clerkMiddleware } from '@clerk/nextjs/server';

// Just initialize auth context, don't protect routes here
export default clerkMiddleware();

export const config = {
  matcher: ['/((?!.*\\..*|_next).*)', '/', '/(api|trpc)(.*)'],
};
