import { UserButton } from '@clerk/nextjs';
import Link from 'next/link';
import { Logo } from '@/components/logo';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen">
      <header className="border-b border-zinc-200 bg-white sticky top-0 z-40">
        <div className="max-w-3xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/"><Logo /></Link>
          <UserButton />
        </div>
      </header>
      <main>{children}</main>
    </div>
  );
}
