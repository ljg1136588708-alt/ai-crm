'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { useT } from '@/components/locale-provider';
import { useUser } from '@clerk/nextjs';

export default function PricingPage() {
  const t = useT().aifoto.pricing;
  const { isSignedIn, user } = useUser();
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubscribe = async () => {
    if (!isSignedIn) {
      router.push('/sign-in?redirect_url=/pricing');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/checkout', { method: 'POST' });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        alert(data.error || t.checkoutFailed);
        setLoading(false);
      }
    } catch {
      alert(t.networkError);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen">
      <header className="border-b border-zinc-200 bg-white">
        <div className="max-w-3xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/" className="text-lg font-bold tracking-tight">AI Foto</Link>
          <div className="flex items-center gap-4">
            {isSignedIn ? (
              <Link href="/dashboard" title={t.dashboard}>
                <img src={user?.imageUrl} alt="" className="w-8 h-8 rounded-full border-2 border-zinc-200 hover:border-violet-400 transition-colors" />
              </Link>
            ) : (
              <Link href="/sign-in" className="text-sm text-zinc-600 hover:text-zinc-900">{t.signIn}</Link>
            )}
          </div>
        </div>
      </header>

      <section className="max-w-2xl mx-auto px-4 py-20 text-center">
        <h1 className="text-3xl font-bold mb-4">{t.title}</h1>
        <p className="text-zinc-500 mb-12">{t.subtitle}</p>

        <div className="max-w-sm mx-auto border border-violet-200 rounded-2xl p-8 bg-violet-50/50">
          <div className="text-sm font-medium text-violet-600 mb-2">{t.pro}</div>
          <div className="text-4xl font-bold mb-1">$9.99<span className="text-lg text-zinc-400">{t.perMo}</span></div>
          <p className="text-sm text-zinc-500 mb-6">{t.cancel}</p>

          <ul className="text-sm text-zinc-600 space-y-2 mb-8 text-left">
            {t.features.map((f) => (
              <li key={f} className="flex items-start gap-2">
                <span className="text-violet-600">✓</span> {f}
              </li>
            ))}
          </ul>

          <Button
            className="w-full py-3 text-base bg-violet-600 hover:bg-violet-700"
            onClick={handleSubscribe}
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                {t.redirecting}
              </>
            ) : (
              t.subscribe
            )}
          </Button>
        </div>

        <p className="text-xs text-zinc-400 mt-8">
          {t.footer}
        </p>
      </section>

      <footer className="border-t border-zinc-200 py-8 px-6 text-center text-sm text-zinc-400">
        © 2026 AI Foto.
      </footer>
    </div>
  );
}
