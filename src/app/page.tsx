import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function LandingPage() {
  return (
    <main className="min-h-screen">
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-4 max-w-6xl mx-auto">
        <span className="text-xl font-bold tracking-tight">AI CRM</span>
        <div className="flex items-center gap-4">
          <Link href="/pricing" className="text-sm text-zinc-600 hover:text-zinc-900">Pricing</Link>
          <Link href="/sign-in"><Button variant="outline" size="sm">Sign In</Button></Link>
          <Link href="/sign-up"><Button size="sm">Get Started Free</Button></Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-3xl mx-auto text-center pt-32 pb-20 px-6">
        <h1 className="text-5xl font-bold tracking-tight leading-tight mb-6">
          The CRM that<br />
          <span className="text-violet-600">fills itself.</span>
        </h1>
        <p className="text-xl text-zinc-500 mb-10 max-w-xl mx-auto leading-relaxed">
          Connect your Gmail. AI scans your emails, builds your pipeline,
          and drafts follow-ups — so you never touch a CRM dashboard again.
        </p>
        <div className="flex gap-4 justify-center">
          <Link href="/sign-up">
            <Button size="lg" className="text-base px-8">Try Free — No Credit Card</Button>
          </Link>
          <Link href="/pricing">
            <Button size="lg" variant="outline" className="text-base px-8">View Pricing</Button>
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-5xl mx-auto px-6 pb-24 grid grid-cols-1 md:grid-cols-3 gap-8">
        {[
          {
            title: 'Zero Data Entry',
            desc: 'Connect Gmail and AI extracts contacts, companies, and deals from your existing conversations. Nothing to type.',
          },
          {
            title: 'Pipeline on Autopilot',
            desc: 'Deals move through stages automatically as context changes. You see what matters — who needs following up.',
          },
          {
            title: 'AI Drafts, You Approve',
            desc: 'Get daily follow-up reminders with pre-written emails in your voice. Read, edit if needed, hit send.',
          },
        ].map((f) => (
          <div key={f.title} className="p-6 rounded-xl border border-zinc-200">
            <h3 className="font-semibold text-lg mb-2">{f.title}</h3>
            <p className="text-zinc-500 text-sm leading-relaxed">{f.desc}</p>
          </div>
        ))}
      </section>

      {/* Comparison */}
      <section className="bg-zinc-50 py-24 px-6">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">vs The Old Guard</h2>
          <div className="grid grid-cols-4 gap-4 text-sm">
            <div className="font-medium"></div>
            <div className="font-bold text-violet-600 text-center p-3 bg-violet-50 rounded-lg">AI CRM</div>
            <div className="font-medium text-center p-3">Salesforce</div>
            <div className="font-medium text-center p-3">HubSpot</div>

            {[
              ['Starting price', '$19/mo', '$25/user/mo', '$15/user/mo'],
              ['Data entry', 'Automatic ✨', 'Manual 😰', 'Manual 😰'],
              ['Setup time', '2 minutes', '2-4 weeks', '1-2 weeks'],
              ['AI follow-ups', 'Built-in', 'Add-on $50/mo', 'Add-on $50/mo'],
              ['Training needed', 'None', 'Certification', 'Hours of videos'],
              ['Best for', '1-3 people', '50+ people', '10+ people'],
            ].map(([label, us, sf, hs]) => (
              <div key={label} className="contents">
                <div className="py-3 border-t border-zinc-200 text-zinc-600">{label}</div>
                <div className="py-3 border-t border-zinc-200 text-center font-medium">{us}</div>
                <div className="py-3 border-t border-zinc-200 text-center text-zinc-500">{sf}</div>
                <div className="py-3 border-t border-zinc-200 text-center text-zinc-500">{hs}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6 text-center">
        <h2 className="text-3xl font-bold mb-4">Stop paying for 95% of features you never touch.</h2>
        <p className="text-zinc-500 mb-8">$19/month. Cancel anytime. 14-day free trial with full access.</p>
        <Link href="/sign-up"><Button size="lg" className="text-base px-10">Start Free Trial</Button></Link>
      </section>

      {/* Footer */}
      <footer className="border-t border-zinc-200 py-8 px-6 text-center text-sm text-zinc-400">
        © 2026 AI CRM. Built for solo founders who hate data entry.
      </footer>
    </main>
  );
}
