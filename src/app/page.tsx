'use client';
import Link from 'next/link';
import { useT } from '@/components/locale-provider';
import { useUser } from '@clerk/nextjs';

export default function LandingPage() {
  const t = useT().aifoto.landing;
  const { isSignedIn } = useUser();
  return (
    <main className="min-h-screen">
      <nav className="flex items-center justify-between px-6 py-4 max-w-3xl mx-auto">
        <span className="text-xl font-bold tracking-tight">AI Foto</span>
        <div className="flex items-center gap-4">
          <Link href="/pricing" className="text-sm text-zinc-600 hover:text-zinc-900">{t.pricing}</Link>
          {isSignedIn ? (
            <Link href="/dashboard" className="inline-flex items-center justify-center rounded-lg bg-violet-600 text-white px-4 py-2 text-sm font-medium hover:bg-violet-700">
              {t.dashboard}
            </Link>
          ) : (
            <>
              <Link href="/sign-in" className="text-sm text-zinc-600 hover:text-zinc-900">{t.signIn}</Link>
              <Link href="/sign-up" className="inline-flex items-center justify-center rounded-lg bg-violet-600 text-white px-4 py-2 text-sm font-medium hover:bg-violet-700">
                {t.getStarted}
              </Link>
            </>
          )}
        </div>
      </nav>

      <section className="max-w-2xl mx-auto text-center pt-32 pb-20 px-6">
        <h1 className="text-5xl md:text-6xl font-bold tracking-tight leading-tight mb-6">
          {t.heroTitle}<br />{t.heroTitle2}
        </h1>
        <p className="text-xl text-zinc-500 mb-10 leading-relaxed">
          {t.heroDesc}
        </p>
        <div className="flex gap-4 justify-center">
          <Link
            href={isSignedIn ? '/dashboard' : '/sign-up'}
            className="inline-flex items-center justify-center rounded-lg bg-violet-600 text-white px-8 py-3 text-base font-medium hover:bg-violet-700"
          >
            {isSignedIn ? t.dashboard : t.tryFree}
          </Link>
        </div>
      </section>
    </main>
  );
}
