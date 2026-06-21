'use client';
import { useLocale } from '@/components/locale-provider';
import { switchLocale } from '@/lib/i18n';

export function LocaleSwitcher() {
  const locale = useLocale();
  return (
    <button
      onClick={() => switchLocale(locale === 'en' ? 'zh' : 'en')}
      className="fixed top-4 right-4 z-50 px-3 py-1.5 rounded-full bg-white/90 backdrop-blur border border-zinc-200 shadow-sm text-xs font-medium text-zinc-600 hover:bg-zinc-50 hover:border-zinc-300 transition-all"
      title={locale === 'en' ? 'Switch to Chinese' : '切换到英文'}
    >
      {locale === 'en' ? '中文' : 'EN'}
    </button>
  );
}
