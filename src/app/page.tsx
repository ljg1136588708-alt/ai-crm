'use client';
import Link from 'next/link';
import { useT } from '@/components/locale-provider';

function Button({ children, variant, size, className, href, ...props }: any) {
  const base = "inline-flex items-center justify-center rounded-lg font-medium transition-colors";
  const sizes: Record<string, string> = { sm: "px-3 py-1.5 text-sm", lg: "px-6 py-2.5 text-base" };
  const vars: Record<string, string> = {
    outline: "border border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50",
    default: "bg-violet-600 text-white hover:bg-violet-700",
  };
  const cls = `${base} ${sizes[size || 'sm']} ${vars[variant || 'default']} ${className || ''}`;
  if (href) return <Link href={href} className={cls}>{children}</Link>;
  return <button className={cls} {...props}>{children}</button>;
}

export default function LandingPage() {
  const t = useT();

  return (
    <main className="min-h-screen">
      <nav className="flex items-center justify-between px-6 py-4 max-w-6xl mx-auto">
        <span className="text-xl font-bold tracking-tight">AI CRM</span>
        <div className="flex items-center gap-4">
          <Link href="/pricing" className="text-sm text-zinc-600 hover:text-zinc-900">{t.common.pricing}</Link>
          <Link href="/sign-in"><Button variant="outline" size="sm">{t.common.signIn}</Button></Link>
          <Link href="/sign-up"><Button size="sm">{t.common.signUp}</Button></Link>
        </div>
      </nav>

      <section className="max-w-4xl mx-auto text-center pt-32 pb-20 px-6">
        <div className="inline-block mb-6 px-4 py-1.5 rounded-full border border-violet-200 bg-violet-50 text-violet-700 text-sm font-medium">
          {t.landing.badge}
        </div>
        <h1 className="text-5xl md:text-6xl font-bold tracking-tight leading-tight mb-6">{t.landing.heroTitle}</h1>
        <p className="text-xl text-zinc-500 mb-10 max-w-xl mx-auto leading-relaxed">{t.landing.heroSub}</p>
        <div className="flex gap-4 justify-center">
          <Link href="/sign-up"><Button size="lg" className="text-base px-8">{t.landing.tryFree}</Button></Link>
          <Link href="/pricing"><Button size="lg" variant="outline" className="text-base px-8">{t.landing.viewPricing}</Button></Link>
        </div>
      </section>

      <section className="max-w-5xl mx-auto px-6 pb-24">
        <h2 className="text-2xl font-bold text-center mb-12">{t.landing.howItWorks}</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { step: '1', title: t.landing.step1Title, desc: t.landing.step1Desc, emoji: '🔗' },
            { step: '2', title: t.landing.step2Title, desc: t.landing.step2Desc, emoji: '🤖' },
            { step: '3', title: t.landing.step3Title, desc: t.landing.step3Desc, emoji: '📬' },
          ].map(({ step, title, desc, emoji }) => (
            <div key={step} className="text-center p-6">
              <div className="text-3xl mb-3">{emoji}</div>
              <div className="text-xs font-bold text-violet-600 mb-2">STEP {step}</div>
              <h3 className="font-semibold mb-2">{title}</h3>
              <p className="text-sm text-zinc-500 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="max-w-5xl mx-auto px-6 pb-24 grid grid-cols-1 md:grid-cols-3 gap-8">
        {[
          { icon: '⚡', title: t.landing.feature1Title, desc: t.landing.feature1Desc },
          { icon: '📊', title: t.landing.feature2Title, desc: t.landing.feature2Desc },
          { icon: '✉️', title: t.landing.feature3Title, desc: t.landing.feature3Desc },
        ].map((f) => (
          <div key={f.title} className="p-6 rounded-xl border border-zinc-200 hover:border-violet-300 hover:shadow-md transition-all">
            <div className="text-2xl mb-3">{f.icon}</div>
            <h3 className="font-semibold text-lg mb-2">{f.title}</h3>
            <p className="text-zinc-500 text-sm leading-relaxed">{f.desc}</p>
          </div>
        ))}
      </section>

      <section className="bg-zinc-50 py-24 px-6">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">{t.landing.vsOldGuard}</h2>
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

      <section className="py-24 px-6 text-center">
        <h2 className="text-3xl font-bold mb-4">{t.landing.ctaTitle}</h2>
        <p className="text-zinc-500 mb-8">{t.landing.ctaSub}</p>
        <Link href="/sign-up"><Button size="lg" className="text-base px-10">{t.landing.tryFree}</Button></Link>
      </section>

      <footer className="border-t border-zinc-200 py-8 px-6 text-center text-sm text-zinc-400">
        {t.landing.footer}
      </footer>
    </main>
  );
}
