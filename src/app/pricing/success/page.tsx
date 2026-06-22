'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Loader2 } from 'lucide-react';
import { useT } from '@/components/locale-provider';

export default function PricingSuccessPage() {
  const t = useT().aifoto.success;
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');

  useEffect(() => {
    const timer = setTimeout(() => setStatus('success'), 2000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="max-w-md mx-auto px-4 py-20 text-center">
        {status === 'loading' && (
          <>
            <Loader2 className="w-12 h-12 mx-auto mb-4 animate-spin text-violet-600" />
            <h1 className="text-2xl font-bold mb-2">{t.loading}</h1>
            <p className="text-zinc-500">{t.loadingDesc}</p>
          </>
        )}

        {status === 'success' && (
          <>
            <CheckCircle2 className="w-16 h-16 mx-auto mb-4 text-green-500" />
            <h1 className="text-2xl font-bold mb-2">{t.success}</h1>
            <p className="text-zinc-500 mb-8">{t.successDesc}</p>
            <Link href="/dashboard">
              <Button className="bg-violet-600 hover:bg-violet-700 px-8">
                {t.goDashboard}
              </Button>
            </Link>
          </>
        )}

        {status === 'error' && (
          <>
            <h1 className="text-2xl font-bold mb-2">{t.error}</h1>
            <p className="text-zinc-500 mb-8">{t.errorDesc}</p>
            <Link href="/dashboard">
              <Button className="bg-violet-600 hover:bg-violet-700 px-8">
                {t.goDashboard}
              </Button>
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
