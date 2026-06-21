import { NextIntlClientProvider } from 'next-intl';
import { getMessages, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { routing } from '@/i18n/routing';
import { ClerkProvider } from '@clerk/nextjs';
import { LocaleSwitcher } from '@/components/locale-switcher';

type Props = { children: React.ReactNode; params: Promise<{ locale: string }> };

export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = await params;

  if (!routing.locales.includes(locale as any)) notFound();
  setRequestLocale(locale);

  const messages = await getMessages();

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      <ClerkProvider
        signInUrl={`/${locale}/sign-in`}
        signUpUrl={`/${locale}/sign-up`}
        afterSignOutUrl={`/${locale}`}
        signInFallbackRedirectUrl={`/${locale}/dashboard`}
        signUpFallbackRedirectUrl={`/${locale}/dashboard/onboarding`}
      >
        {children}
        <LocaleSwitcher />
      </ClerkProvider>
    </NextIntlClientProvider>
  );
}
