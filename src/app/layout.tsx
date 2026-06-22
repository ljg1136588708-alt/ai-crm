import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import { ClerkProvider } from '@clerk/nextjs';
import { LocaleProvider } from '@/components/locale-provider';
import { LocaleSwitcher } from '@/components/locale-switcher';
import { type Locale } from '@/lib/i18n';
import './globals.css';

export const metadata: Metadata = {
  title: 'AI Foto — Generate stunning images with AI',
  description: 'Create beautiful AI-generated images from text or photos. Multiple styles, any size, instant results.',
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const locale = (cookieStore.get('locale')?.value ?? 'en') as Locale;

  // Clerk doesn't have built-in zh-CN, so provide custom strings
  const clerkLocalization = locale === 'zh' ? {
    'userButton.action__manageAccount': '管理账户',
    'userButton.action__signOut': '退出登录',
    'userButton.action__signOutAll': '退出所有设备',
  } as any : undefined;

  return (
    <ClerkProvider
      localization={clerkLocalization}
      signInUrl="/sign-in"
      signUpUrl="/sign-up"
      afterSignOutUrl="/"
      signInFallbackRedirectUrl="/dashboard"
      signUpFallbackRedirectUrl="/dashboard"
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
