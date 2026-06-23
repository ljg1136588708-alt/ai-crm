'use client';
import Link from 'next/link';
import { useT } from '@/components/locale-provider';
import { useUser, UserButton } from '@clerk/nextjs';
import { Logo } from '@/components/logo';

// Curated showcase images for the landing gallery (public Supabase URLs).
const SB = 'https://zthvfbnxmnwtdcpdccfi.supabase.co/storage/v1/object/public/generations/user_3FVJAALxEi6NUGFuiIPgamwz8JY';
const SHOWCASE = [
  `${SB}/1782203077759.png`,
  `${SB}/1782202495817.png`,
  `${SB}/1782202916902.png`,
  `${SB}/1782203005125.png`,
  `${SB}/1782202830719.png`,
  `${SB}/1782202674577.png`,
  `${SB}/1782202338755.png`,
  `${SB}/1782202456590.png`,
  `${SB}/1782202781940.png`,
  `${SB}/1782202637262.png`,
  `${SB}/1782202367619.png`,
  `${SB}/1782202754465.png`,
];

export default function LandingPage() {
  const t = useT().aifoto.landing;
  const { isLoaded, isSignedIn } = useUser();
  return (
    <main className="min-h-screen flex flex-col">
      <nav className="w-full flex items-center justify-between px-6 py-4 max-w-3xl mx-auto">
        <Logo />
        <div className="flex items-center gap-4">
          <Link href="/pricing" className="text-sm text-zinc-600 hover:text-zinc-900">{t.pricing}</Link>
          {!isLoaded ? null : isSignedIn ? (
            <>
              <Link href="/dashboard" className="text-sm text-violet-600 font-medium hover:text-violet-700">
                {t.dashboard}
              </Link>
              <UserButton />
            </>
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

      <section className="max-w-2xl mx-auto text-center pt-28 pb-12 px-6">
        <h1 className="text-5xl md:text-6xl font-bold tracking-tight leading-tight mb-6">
          {t.heroTitle}
        </h1>
        <p className="text-xl text-zinc-500 mb-10 leading-relaxed">
          {t.heroDesc}
        </p>
        <div className="flex gap-4 justify-center">
          {isLoaded && !isSignedIn && (
            <Link
              href="/sign-up"
              className="inline-flex items-center justify-center rounded-lg bg-violet-600 text-white px-8 py-3 text-base font-medium hover:bg-violet-700"
            >
              {t.tryFree}
            </Link>
          )}
        </div>
      </section>

      {/* Showcase gallery */}
      <section className="w-full max-w-5xl mx-auto px-6 pb-20">
        <h2 className="text-center text-sm font-medium text-zinc-400 mb-6">{t.showcase}</h2>
        <div className="columns-2 sm:columns-3 lg:columns-4 gap-3">
          {SHOWCASE.map((src, i) => (
            <img
              key={i}
              src={src}
              alt=""
              loading="lazy"
              className="mb-3 w-full rounded-xl border border-zinc-100 break-inside-avoid"
            />
          ))}
        </div>
      </section>

      <footer className="mt-auto max-w-2xl mx-auto text-center px-6 py-8 text-sm text-zinc-400">
        <p>
          {t.contact}:{' '}
          <span className="text-zinc-900">ljg1136588708@gmail.com</span>
        </p>
        <p className="mt-2">
          <Link href="/privacy" className="hover:text-zinc-700">{t.privacy}</Link>
          <span className="mx-2">·</span>
          <Link href="/terms" className="hover:text-zinc-700">{t.terms}</Link>
        </p>
      </footer>
    </main>
  );
}
