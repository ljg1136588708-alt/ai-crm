'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Loader2 } from 'lucide-react';

export default function PricingSuccessPage() {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');

  useEffect(() => {
    // Stripe redirects with ?session_id=... — the webhook already processed it,
    // so we just show success after a brief delay to let webhook land
    const timer = setTimeout(() => setStatus('success'), 2000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="max-w-md mx-auto px-4 py-20 text-center">
        {status === 'loading' && (
          <>
            <Loader2 className="w-12 h-12 mx-auto mb-4 animate-spin text-violet-600" />
            <h1 className="text-2xl font-bold mb-2">Confirming your subscription...</h1>
            <p className="text-zinc-500">This takes just a moment.</p>
          </>
        )}

        {status === 'success' && (
          <>
            <CheckCircle2 className="w-16 h-16 mx-auto mb-4 text-green-500" />
            <h1 className="text-2xl font-bold mb-2">You're a Pro! 🎉</h1>
            <p className="text-zinc-500 mb-8">
              Unlimited generations unlocked. Go create something amazing.
            </p>
            <Link href="/dashboard">
              <Button className="bg-violet-600 hover:bg-violet-700 px-8">
                Go to Dashboard
              </Button>
            </Link>
          </>
        )}

        {status === 'error' && (
          <>
            <h1 className="text-2xl font-bold mb-2">Something went wrong</h1>
            <p className="text-zinc-500 mb-8">
              If you were charged, your Pro access will be active shortly. Contact support if needed.
            </p>
            <Link href="/dashboard">
              <Button className="bg-violet-600 hover:bg-violet-700 px-8">
                Go to Dashboard
              </Button>
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
