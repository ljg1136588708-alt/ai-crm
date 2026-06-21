import { UserButton } from '@clerk/nextjs';
import Link from 'next/link';
import { BarChart3, Users, Bell, Settings, Sparkles } from 'lucide-react';

const nav = [
  { href: '/dashboard', label: 'Pipeline', icon: BarChart3 },
  { href: '/dashboard/contacts', label: 'Contacts', icon: Users },
  { href: '/dashboard/followups', label: 'Follow-ups', icon: Bell },
  { href: '/dashboard/settings', label: 'Settings', icon: Settings },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
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
      </main>
    </div>
  );
}
