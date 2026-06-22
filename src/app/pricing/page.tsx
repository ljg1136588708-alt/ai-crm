'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Loader2, Check } from 'lucide-react';
import { useT } from '@/components/locale-provider';
import { useUser } from '@clerk/nextjs';

export default function PricingPage() {
  const t = useT().aifoto.pricing;
  const { isSignedIn, user } = useUser();
  const [loading, setLoading] = useState<'monthly' | 'yearly' | null>(null);
  const router = useRouter();

  const handleSubscribe = async (plan: 'monthly' | 'yearly') => {
    if (!isSignedIn) {
      router.push('/sign-in?redirect_url=/pricing');
      return;
    }
    setLoading(plan);
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        alert(data.error || t.checkoutFailed);
        setLoading(null);
      }
    } catch {
      alert(t.networkError);
      setLoading(null);
    }
  };

  const plans = [
    {
      key: 'free' as const,
      name: t.free,
      price: t.freePrice,
      per: '',
      desc: t.freeDesc,
      features: t.freeFeatures as string[],
      cta: t.freeCta,
      highlight: false,
    },
    {
      key: 'monthly' as const,
      name: t.monthly,
      price: t.monthlyPrice,
      per: t.monthlyPer,
      desc: t.monthlyDesc,
      features: t.monthlyFeatures as string[],
      cta: t.monthlyCta,
      highlight: true,
    },
    {
      key: 'yearly' as const,
      name: t.yearly,
      price: t.yearlyPrice,
      per: t.yearlyPer,
      desc: t.yearlyDesc,
      features: t.yearlyFeatures as string[],
      cta: t.yearlyCta,
      highlight: false,
    },
  ];

  return (
    <div className="min-h-screen">
      <header className="border-b border-zinc-200 bg-white">
        <div className="max-w-3xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/" className="text-lg font-bold tracking-tight">AI Foto</Link>
          <div className="flex items-center gap-4">
            {isSignedIn ? (
              <>
                <Link href="/dashboard" className="text-sm text-violet-600 font-medium hover:text-violet-700">{t.dashboard}</Link>
                <Link href="/dashboard" title={t.dashboard}>
                  <img src={user?.imageUrl} alt="" className="w-8 h-8 rounded-full border-2 border-zinc-200 hover:border-violet-400 transition-colors" />
                </Link>
              </>
            ) : (
              <Link href="/sign-in" className="text-sm text-zinc-600 hover:text-zinc-900">{t.signIn}</Link>
            )}
          </div>
        </div>
      </header>

      <section className="max-w-5xl mx-auto px-4 py-16 text-center">
        <h1 className="text-3xl font-bold mb-4">{t.title}</h1>
        <p className="text-zinc-500 mb-12">{t.subtitle}</p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map((plan) => (
            <div
              key={plan.key}
              className={`rounded-2xl p-8 border ${
                plan.highlight
                  ? 'border-violet-300 bg-violet-50/50 shadow-lg scale-[1.02]'
                  : 'border-zinc-200'
              }`}
            >
              <div className="text-sm font-medium text-violet-600 mb-2">{plan.name}</div>
              <div className="text-4xl font-bold mb-1">
                {plan.price}
                {plan.per && <span className="text-lg text-zinc-400">{plan.per}</span>}
              </div>
              {plan.key === 'yearly' && (
                <p className="text-xs text-green-600 font-medium mb-2">{t.yearlyNote}</p>
              )}
              <p className="text-sm text-zinc-500 mb-6">{plan.desc}</p>

              <ul className="text-sm text-zinc-600 space-y-3 mb-8 text-left">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-violet-600 mt-0.5 shrink-0" /> {f}
                  </li>
                ))}
              </ul>

              {plan.key === 'free' ? (
                <Link
                  href={isSignedIn ? '/dashboard' : '/sign-up'}
                  className="block w-full py-3 text-base rounded-lg text-center font-medium bg-zinc-100 text-zinc-700 hover:bg-zinc-200 transition-colors"
                >
                  {plan.cta}
                </Link>
              ) : (
                <button
                  className={`block w-full py-3 text-base rounded-lg text-center font-medium text-white transition-colors ${
                    loading !== null ? 'bg-violet-400 cursor-not-allowed' : 'bg-violet-600 hover:bg-violet-700'
                  }`}
                  onClick={() => handleSubscribe(plan.key)}
                  disabled={loading !== null}
                >
                  {loading === plan.key ? (
                    <span className="inline-flex items-center justify-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      {t.redirecting}
                    </span>
                  ) : (
                    plan.cta
                  )}
                </button>
              )}
            </div>
          ))}
        </div>

        <p className="text-xs text-zinc-400 mt-12">{t.footer}</p>
      </section>
    </div>
  );
}
