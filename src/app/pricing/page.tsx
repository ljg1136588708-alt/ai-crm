import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Check } from 'lucide-react';

export default function PricingPage() {
  return (
    <main className="min-h-screen">
      <nav className="flex items-center justify-between px-6 py-4 max-w-6xl mx-auto">
        <Link href="/" className="text-xl font-bold tracking-tight">AI CRM</Link>
        <div className="flex items-center gap-4">
          <Link href="/sign-in"><Button variant="outline" size="sm">Sign In</Button></Link>
        </div>
      </nav>

      <section className="max-w-5xl mx-auto py-20 px-6 text-center">
        <h1 className="text-4xl font-bold mb-4">Simple, transparent pricing</h1>
        <p className="text-xl text-zinc-500 mb-16">14-day free trial on all plans. No credit card required.</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-2xl mx-auto">
          {/* Pro Monthly */}
          <div className="border border-zinc-200 rounded-2xl p-8 text-left">
            <h3 className="text-lg font-semibold mb-2">Pro — Monthly</h3>
            <div className="mb-6">
              <span className="text-4xl font-bold">$19</span>
              <span className="text-zinc-500">/month</span>
            </div>
            <ul className="space-y-3 mb-8">
              {[
                'Unlimited contacts & deals',
                'AI email scanning & extraction',
                'AI follow-up drafts',
                'Natural language query',
                'Pipeline analytics',
                'Priority support',
              ].map((f) => (
                <li key={f} className="flex items-center gap-2 text-sm">
                  <Check size={14} className="text-emerald-500 shrink-0" /> {f}
                </li>
              ))}
            </ul>
            <Link href="/sign-up">
              <Button className="w-full" size="lg">Start Free Trial</Button>
            </Link>
          </div>

          {/* Pro Yearly */}
          <div className="border-2 border-violet-500 rounded-2xl p-8 text-left relative">
            <div className="absolute -top-3 right-6 bg-violet-500 text-white text-xs font-medium px-3 py-1 rounded-full">
              Save 26%
            </div>
            <h3 className="text-lg font-semibold mb-2">Pro — Yearly</h3>
            <div className="mb-6">
              <span className="text-4xl font-bold">$14</span>
              <span className="text-zinc-500">/month</span>
              <p className="text-sm text-zinc-400 mt-1">$168 billed annually</p>
            </div>
            <ul className="space-y-3 mb-8">
              {[
                'Everything in Pro Monthly',
                '2 months free',
                'Early access to new features',
              ].map((f) => (
                <li key={f} className="flex items-center gap-2 text-sm">
                  <Check size={14} className="text-emerald-500 shrink-0" /> {f}
                </li>
              ))}
            </ul>
            <Link href="/sign-up">
              <Button className="w-full bg-violet-600 hover:bg-violet-700" size="lg">Start Free Trial</Button>
            </Link>
          </div>
        </div>

        <div className="mt-16 max-w-lg mx-auto text-left">
          <h3 className="font-semibold mb-4 text-center">FAQ</h3>
          <div className="space-y-4">
            {[
              { q: 'Can I cancel anytime?', a: 'Yes. Cancel with one click. Your data is yours to export.' },
              { q: 'Is my email data safe?', a: 'We never store email bodies. Only metadata (sender, subject, date) is saved. Gmail access can be revoked anytime.' },
              { q: 'Do I need a credit card for the trial?', a: 'No. Start free for 14 days — no card needed. Upgrade when you are ready.' },
              { q: 'What happens after the trial?', a: 'You can choose a plan or your account pauses. No automatic charges.' },
            ].map(({ q, a }) => (
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
