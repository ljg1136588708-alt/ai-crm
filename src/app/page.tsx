import Link from 'next/link';

export default function LandingPage() {
  return (
    <main className="min-h-screen">
      <nav className="flex items-center justify-between px-6 py-4 max-w-3xl mx-auto">
        <span className="text-xl font-bold tracking-tight">AI Foto</span>
        <div className="flex items-center gap-4">
          <Link href="/sign-in" className="text-sm text-zinc-600 hover:text-zinc-900">Sign In</Link>
          <Link href="/sign-up" className="inline-flex items-center justify-center rounded-lg bg-violet-600 text-white px-4 py-2 text-sm font-medium hover:bg-violet-700">
            Get Started
          </Link>
        </div>
      </nav>

      <section className="max-w-2xl mx-auto text-center pt-32 pb-20 px-6">
        <h1 className="text-5xl md:text-6xl font-bold tracking-tight leading-tight mb-6">
          Your photos,<br />any style you imagine
        </h1>
        <p className="text-xl text-zinc-500 mb-10 leading-relaxed">
          Upload a photo or describe what you want. AI generates stunning images in 20+ styles — anime, photorealistic, oil painting, cyberpunk, and more.
        </p>
        <div className="flex gap-4 justify-center">
          <Link href="/sign-up" className="inline-flex items-center justify-center rounded-lg bg-violet-600 text-white px-8 py-3 text-base font-medium hover:bg-violet-700">
            Try Free — No Credit Card
          </Link>
        </div>
      </section>

      <section className="max-w-2xl mx-auto px-6 pb-24">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          {[
            { emoji: '📸', title: 'Upload or Describe', desc: 'Start with a selfie, a photo, or just a text description.' },
            { emoji: '🎨', title: 'Pick a Style', desc: '21 styles from anime to photorealistic to cyberpunk.' },
            { emoji: '✨', title: 'Generate & Download', desc: 'Get your image in seconds. Download in PNG, JPG, or WebP.' },
          ].map(({ emoji, title, desc }) => (
            <div key={title} className="p-6">
              <div className="text-3xl mb-3">{emoji}</div>
              <h3 className="font-semibold mb-2">{title}</h3>
              <p className="text-sm text-zinc-500">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      <footer className="border-t border-zinc-200 py-8 px-6 text-center text-sm text-zinc-400">
        © 2026 AI Foto. Powered by Nano Banana.
      </footer>
    </main>
  );
}
