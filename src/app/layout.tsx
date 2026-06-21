import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import { ClerkProvider } from '@clerk/nextjs';
import { LocaleProvider } from '@/components/locale-provider';
import { LocaleSwitcher } from '@/components/locale-switcher';
import { type Locale } from '@/lib/i18n';
import './globals.css';

export const metadata: Metadata = {
  title: 'AI CRM — The CRM that fills itself',
  description: 'Connect your Gmail, and your pipeline builds automatically.',
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const locale = (cookieStore.get('locale')?.value ?? 'en') as Locale;

  return (
    <ClerkProvider
      signInUrl="/sign-in"
      signUpUrl="/sign-up"
      afterSignOutUrl="/"
      signInFallbackRedirectUrl="/dashboard"
      signUpFallbackRedirectUrl="/dashboard/onboarding"
    >
      <html lang={locale} className="antialiased">
        <body className="min-h-screen bg-white text-zinc-900">
          <LocaleProvider locale={locale}>
            {children}
            <LocaleSwitcher />
          </LocaleProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
