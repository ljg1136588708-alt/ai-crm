import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import { ClerkProvider } from '@clerk/nextjs';
import { LocaleProvider } from '@/components/locale-provider';
import { LocaleSwitcher } from '@/components/locale-switcher';
import { type Locale } from '@/lib/i18n';
import './globals.css';

const OG_IMAGE = 'https://zthvfbnxmnwtdcpdccfi.supabase.co/storage/v1/object/public/generations/user_3FVJAALxEi6NUGFuiIPgamwz8JY/1782154339162.png';
const SITE_DESC = 'Create beautiful AI-generated images from text or photos. 20+ styles, any size, instant results.';

export const metadata: Metadata = {
  metadataBase: new URL('https://aicrm.shangqiushi.com'),
  title: 'AI Foto — Generate stunning images with AI',
  description: SITE_DESC,
  openGraph: {
    title: 'AI Foto — Generate stunning images with AI',
    description: SITE_DESC,
    url: 'https://aicrm.shangqiushi.com',
    siteName: 'AI Foto',
    images: [OG_IMAGE],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AI Foto — Generate stunning images with AI',
    description: SITE_DESC,
    images: [OG_IMAGE],
  },
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const locale = (cookieStore.get('locale')?.value ?? 'en') as Locale;

  // Clerk doesn't have built-in zh-CN, so provide custom strings
  const clerkLocalization = locale === 'zh' ? {
    locale: 'zh-CN',
    userButton: {
      action__manageAccount: '管理账户',
      action__signOut: '退出登录',
      action__signOutAll: '退出所有设备',
    },
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
