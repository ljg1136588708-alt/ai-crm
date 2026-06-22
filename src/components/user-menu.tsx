'use client';
import { useState, useRef, useEffect } from 'react';
import { useUser, useClerk } from '@clerk/nextjs';
import { useT } from '@/components/locale-provider';

export function UserMenu() {
  const { user } = useUser();
  const { signOut, openUserProfile } = useClerk();
  const t = useT().aifoto.dashboard;
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const locale = document.cookie.match(/locale=([^;]+)/)?.[1] || 'en';
  const isZh = locale === 'zh';

  if (!user) return null;

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="w-8 h-8 rounded-full overflow-hidden border-2 border-zinc-200 hover:border-violet-400 transition-colors"
      >
        <img src={user.imageUrl} alt="" className="w-full h-full object-cover" />
      </button>

      {open && (
        <div className="absolute right-0 top-10 w-44 bg-white rounded-lg shadow-lg border border-zinc-200 py-1 z-50">
          <div className="px-3 py-2 border-b border-zinc-100">
            <p className="text-sm font-medium truncate">{user.fullName || user.primaryEmailAddress?.emailAddress}</p>
            <p className="text-xs text-zinc-400 truncate">{user.primaryEmailAddress?.emailAddress}</p>
          </div>
          <button
            onClick={() => { openUserProfile(); setOpen(false); }}
            className="w-full text-left px-3 py-2 text-sm text-zinc-700 hover:bg-zinc-50 transition-colors"
          >
            {isZh ? '管理账户' : 'Manage account'}
          </button>
          <button
            onClick={() => signOut()}
            className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
          >
            {isZh ? '退出登录' : 'Sign out'}
          </button>
        </div>
      )}
    </div>
  );
}
