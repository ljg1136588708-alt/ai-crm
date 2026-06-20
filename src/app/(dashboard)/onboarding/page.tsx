export const dynamic = 'force-dynamic';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Mail, Sparkles, Check } from 'lucide-react';

export default function OnboardingPage() {
  return (
    <div className="max-w-lg mx-auto py-16 px-6">
      <Card className="p-8 text-center">
        <div className="w-16 h-16 rounded-2xl bg-violet-100 flex items-center justify-center mx-auto mb-6">
          <Mail className="w-8 h-8 text-violet-600" />
        </div>
        <h1 className="text-xl font-bold mb-2">Connect your Gmail</h1>
        <p className="text-zinc-500 mb-8">
          AI scans your emails, extracts contacts and deals, and builds your pipeline automatically.
          No data entry required.
        </p>
        <div className="bg-zinc-50 rounded-lg p-4 text-sm text-zinc-600 space-y-2 mb-6 text-left">
          <p className="flex items-center gap-2">
            <Check size={14} className="text-emerald-500 shrink-0" />
            Only business emails are scanned — newsletters and notifications are skipped
          </p>
          <p className="flex items-center gap-2">
            <Check size={14} className="text-emerald-500 shrink-0" />
            Email bodies are never stored — only metadata is saved
          </p>
          <p className="flex items-center gap-2">
            <Check size={14} className="text-emerald-500 shrink-0" />
            Revoke access anytime from your Google Account settings
          </p>
        </div>
        <p className="text-amber-600 text-sm">
          <Sparkles className="inline w-3 h-3 mr-1" />
          Gmail integration coming soon — Clerk + Google OAuth setup in progress.
        </p>
        <Link href="/dashboard" className="block mt-6">
          <Button variant="outline">Back to Dashboard</Button>
        </Link>
      </Card>
    </div>
  );
}
