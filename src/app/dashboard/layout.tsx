import { UserButton } from '@clerk/nextjs';
import Link from 'next/link';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen">
      <header className="border-b border-zinc-200 bg-white sticky top-0 z-40">
        <div className="max-w-3xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/" className="text-lg font-bold tracking-tight">AI Foto</Link>
          <div className="flex items-center gap-4">
            <Link href="/pricing" className="text-sm text-violet-600 font-medium hover:text-violet-700">Pricing</Link>
            <UserButton />
          </div>
        </div>
      </header>
      <main>{children}</main>
    </div>
  );
}
