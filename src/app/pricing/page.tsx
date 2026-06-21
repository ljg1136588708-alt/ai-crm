'use client';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function PricingPage() {
  return (
    <div className="min-h-screen">
      <header className="border-b border-zinc-200 bg-white">
        <div className="max-w-3xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/" className="text-lg font-bold tracking-tight">AI Foto</Link>
          <Link href="/sign-in" className="text-sm text-zinc-600 hover:text-zinc-900">Sign In</Link>
        </div>
      </header>

      <section className="max-w-2xl mx-auto px-4 py-20 text-center">
        <h1 className="text-3xl font-bold mb-4">Upgrade to Pro</h1>
        <p className="text-zinc-500 mb-12">Free trial: 50 generations. Pro: unlimited.</p>

        <div className="max-w-sm mx-auto border border-violet-200 rounded-2xl p-8 bg-violet-50/50">
          <div className="text-sm font-medium text-violet-600 mb-2">PRO</div>
          <div className="text-4xl font-bold mb-1">$9.99<span className="text-lg text-zinc-400">/mo</span></div>
          <p className="text-sm text-zinc-500 mb-6">Cancel anytime</p>

          <ul className="text-sm text-zinc-600 space-y-2 mb-8 text-left">
            {['Unlimited image generations', 'All 21 styles', 'All aspect ratios & formats', 'Generate from photos or text', 'Priority generation speed', 'Download in full resolution'].map((f) => (
              <li key={f} className="flex items-start gap-2">
                <span className="text-violet-600">✓</span> {f}
              </li>
            ))}
          </ul>

          <Button className="w-full py-3 text-base bg-violet-600 hover:bg-violet-700">
            Subscribe — $9.99/mo
          </Button>
        </div>

        <p className="text-xs text-zinc-400 mt-8">
          Coming soon. No card required for free trial.
        </p>
      </section>

      <footer className="border-t border-zinc-200 py-8 px-6 text-center text-sm text-zinc-400">
        © 2026 AI Foto.
      </footer>
    </div>
  );
}
