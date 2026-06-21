import type { Metadata } from 'next';
import { ClerkProvider } from '@clerk/nextjs';
import { LocaleSwitcher } from '@/components/locale-switcher';
import './globals.css';

export const metadata: Metadata = {
  title: 'AI CRM — The CRM that fills itself',
  description: 'Connect your Gmail, and your pipeline builds automatically.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider
      signInUrl="/sign-in"
      signUpUrl="/sign-up"
      afterSignOutUrl="/"
      signInFallbackRedirectUrl="/dashboard"
      signUpFallbackRedirectUrl="/dashboard/onboarding"
    >
      <html lang="en" className="antialiased">
        <body className="min-h-screen bg-white text-zinc-900">
          {children}
          <LocaleSwitcher />
        </body>
      </html>
    </ClerkProvider>
  );
}
