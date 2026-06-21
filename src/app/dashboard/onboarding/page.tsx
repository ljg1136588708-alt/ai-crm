import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { getServerT } from '@/lib/i18n-server';
import { Mail, Check } from 'lucide-react';

export default async function OnboardingPage() {
  const { userId } = await auth();
  if (!userId) redirect('/sign-in');

  const [t, { getServiceClient }] = [await getServerT(), await import('@/lib/supabase/client')];
  const supabase = getServiceClient();
  const { data: user } = await supabase
    .from('users')
    .select('gmail_connected')
    .eq('clerk_id', userId)
    .single();

  if (user?.gmail_connected) {
    redirect('/dashboard');
  }

  return (
    <div className="max-w-lg mx-auto py-16 px-6">
      <Card className="p-8 text-center">
        <div className="w-16 h-16 rounded-2xl bg-violet-100 flex items-center justify-center mx-auto mb-6">
          <Mail className="w-8 h-8 text-violet-600" />
        </div>
        <h1 className="text-xl font-bold mb-2">{t.onboarding.title}</h1>
        <p className="text-zinc-500 mb-8">{t.onboarding.desc}</p>
        <div className="bg-zinc-50 rounded-lg p-4 text-sm text-zinc-600 space-y-2 mb-6 text-left">
          <p className="flex items-center gap-2">
            <Check size={14} className="text-emerald-500 shrink-0" />
            {t.onboarding.privacy1}
          </p>
          <p className="flex items-center gap-2">
            <Check size={14} className="text-emerald-500 shrink-0" />
            {t.onboarding.privacy2}
          </p>
          <p className="flex items-center gap-2">
            <Check size={14} className="text-emerald-500 shrink-0" />
            {t.onboarding.privacy3}
          </p>
        </div>
        <a
          href="/api/gmail/auth"
          className="inline-flex items-center justify-center rounded-lg bg-violet-600 text-white font-medium px-6 py-2.5 hover:bg-violet-700 transition-colors"
        >
          <Mail className="w-4 h-4 mr-2" />
          {t.onboarding.connectGmail}
        </a>
        <Link href="/dashboard" className="block mt-4">
          <Button variant="outline" size="sm">{t.onboarding.backToDashboard}</Button>
        </Link>
      </Card>
    </div>
  );
}
