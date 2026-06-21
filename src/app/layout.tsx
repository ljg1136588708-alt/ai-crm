import type { Metadata } from 'next';
import { ClerkProvider } from '@clerk/nextjs';
import { I18nProvider } from '@/lib/i18n-context';
import { LocaleSwitcher } from '@/components/locale-switcher';
import './globals.css';

export const metadata: Metadata = {
  title: 'AI CRM — The CRM that fills itself',
  description: 'Connect your Gmail, and your pipeline builds automatically.',
  openGraph: {
    title: 'AI CRM — The CRM that fills itself',
    description: 'Connect your Gmail, and your pipeline builds automatically.',
    type: 'website',
  },
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
          <I18nProvider>
            {children}
            <LocaleSwitcher />
          </I18nProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
