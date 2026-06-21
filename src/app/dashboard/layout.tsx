import { UserButton } from '@clerk/nextjs';
import Link from 'next/link';
import { BarChart3, Users, Bell, Settings } from 'lucide-react';
import { QueryPanel } from '@/components/query-panel';
import { getServerT } from '@/lib/i18n-server';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const t = await getServerT();

  const nav = [
    { href: '/dashboard', label: t.dashboard.pipeline, icon: BarChart3 },
    { href: '/dashboard/contacts', label: t.dashboard.contacts, icon: Users },
    { href: '/dashboard/followups', label: t.dashboard.followups, icon: Bell },
    { href: '/dashboard/settings', label: t.dashboard.settings, icon: Settings },
  ];

  return (
    <div className="min-h-screen flex">
      <aside className="w-56 border-r border-zinc-200 flex flex-col bg-zinc-50/50">
        <div className="p-4 border-b border-zinc-200">
          <Link href="/dashboard" className="text-lg font-bold tracking-tight">AI CRM</Link>
        </div>
        <nav className="flex-1 p-3 space-y-1">
          {nav.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 transition-colors"
            >
              <Icon size={16} />
              {label}
            </Link>
          ))}
        </nav>
        <div className="p-4 border-t border-zinc-200">
          <UserButton />
        </div>
      </aside>
      <main className="flex-1 overflow-auto">
        {children}
        <QueryPanel />
      </main>
    </div>
  );
}
