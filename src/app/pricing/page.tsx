import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Check } from 'lucide-react';
import { getServerT } from '@/lib/i18n-server';

export default async function PricingPage() {
  const t = await getServerT();

  return (
    <main className="min-h-screen">
      <nav className="flex items-center justify-between px-6 py-4 max-w-6xl mx-auto">
        <Link href="/" className="text-xl font-bold tracking-tight">AI CRM</Link>
        <div className="flex items-center gap-4">
          <Link href="/sign-in"><Button variant="outline" size="sm">{t.common.signIn}</Button></Link>
        </div>
      </nav>

      <section className="max-w-5xl mx-auto py-20 px-6 text-center">
        <h1 className="text-4xl font-bold mb-4">{t.pricing.title}</h1>
        <p className="text-xl text-zinc-500 mb-16">{t.pricing.sub}</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-2xl mx-auto">
          <div className="border border-zinc-200 rounded-2xl p-8 text-left">
            <h3 className="text-lg font-semibold mb-2">{t.pricing.monthly}</h3>
            <div className="mb-6">
              <span className="text-4xl font-bold">{t.pricing.monthlyPrice}</span>
              <span className="text-zinc-500">{t.pricing.perMonth}</span>
            </div>
            <ul className="space-y-3 mb-8">
              {t.pricing.features.map((f) => (
                <li key={f} className="flex items-center gap-2 text-sm">
                  <Check size={14} className="text-emerald-500 shrink-0" /> {f}
                </li>
              ))}
            </ul>
            <Link href="/sign-up">
              <Button className="w-full" size="lg">{t.pricing.startTrial}</Button>
            </Link>
          </div>

          <div className="border-2 border-violet-500 rounded-2xl p-8 text-left relative">
            <div className="absolute -top-3 right-6 bg-violet-500 text-white text-xs font-medium px-3 py-1 rounded-full">
              {t.pricing.savePercent}
            </div>
            <h3 className="text-lg font-semibold mb-2">{t.pricing.yearly}</h3>
            <div className="mb-6">
              <span className="text-4xl font-bold">{t.pricing.yearlyPrice}</span>
              <span className="text-zinc-500">{t.pricing.perMonth}</span>
              <p className="text-sm text-zinc-400 mt-1">{t.pricing.billedAnnually}</p>
            </div>
            <ul className="space-y-3 mb-8">
              {t.pricing.yearlyFeatures.map((f) => (
                <li key={f} className="flex items-center gap-2 text-sm">
                  <Check size={14} className="text-emerald-500 shrink-0" /> {f}
                </li>
              ))}
            </ul>
            <Link href="/sign-up">
              <Button className="w-full bg-violet-600 hover:bg-violet-700" size="lg">{t.pricing.startTrial}</Button>
            </Link>
          </div>
        </div>

        <div className="mt-16 max-w-lg mx-auto text-left">
          <h3 className="font-semibold mb-4 text-center">{t.pricing.faq}</h3>
          <div className="space-y-4">
            {t.pricing.faqItems.map(({ q, a }) => (
              <details key={q} className="border border-zinc-200 rounded-lg p-4">
                <summary className="font-medium text-sm cursor-pointer">{q}</summary>
                <p className="text-zinc-500 text-sm mt-2">{a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
