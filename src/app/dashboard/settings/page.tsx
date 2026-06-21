import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { getServiceClient } from '@/lib/supabase/client';
import { getServerT } from '@/lib/i18n-server';
import { Mail, CreditCard, Calendar, CheckCircle2 } from 'lucide-react';

export default async function SettingsPage() {
  const { userId } = await auth();
  if (!userId) redirect('/sign-in');

  const [t, supabase] = [await getServerT(), getServiceClient()];

  const { data: user } = await supabase
    .from('users')
    .select('gmail_connected, gmail_email, plan, trial_ends_at, created_at')
    .eq('clerk_id', userId)
    .single();

  if (!user) redirect('/sign-in');

  const trialDays = user.trial_ends_at
    ? Math.max(0, Math.ceil((new Date(user.trial_ends_at).getTime() - Date.now()) / 86400000))
    : null;

  return (
    <div className="p-8 max-w-3xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">{t.settings.title}</h1>
        <p className="text-zinc-500 text-sm mt-1">{t.settings.sub}</p>
      </div>

      <div className="space-y-6">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${user.gmail_connected ? 'bg-emerald-100' : 'bg-zinc-100'}`}>
                <Mail className={`w-5 h-5 ${user.gmail_connected ? 'text-emerald-600' : 'text-zinc-400'}`} />
              </div>
              <div>
                <h3 className="font-semibold">{t.settings.gmailConnection}</h3>
                <p className="text-sm text-zinc-500">
                  {user.gmail_connected
                    ? `${t.settings.gmailConnectedAs} ${user.gmail_email}`
                    : t.settings.gmailNotConnected}
                </p>
              </div>
            </div>
            {user.gmail_connected ? (
              <Badge variant="outline" className="text-emerald-700 border-emerald-300 bg-emerald-50">
                <CheckCircle2 size={12} className="mr-1" />
                {t.settings.gmailConnected}
              </Badge>
            ) : (
              <Link href="/dashboard/onboarding">
                <Button variant="outline" size="sm">{t.dashboard.connectGmail}</Button>
              </Link>
            )}
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-violet-100 flex items-center justify-center">
                <CreditCard className="w-5 h-5 text-violet-600" />
              </div>
              <div>
                <h3 className="font-semibold">{t.settings.plan}</h3>
                <p className="text-sm text-zinc-500">
                  {user.plan === 'trial' ? t.settings.freeTrial : user.plan}
                  {trialDays != null && (
                    <span className="flex items-center gap-1 mt-0.5">
                      <Calendar size={11} />
                      {trialDays > 0
                        ? `${trialDays} ${trialDays !== 1 ? t.settings.daysRemaining : t.settings.dayRemaining}`
                        : t.settings.trialExpired}
                    </span>
                  )}
                </p>
              </div>
            </div>
            <Button variant="outline" size="sm">{t.settings.upgradePro}</Button>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-lg bg-zinc-100 flex items-center justify-center">
              <Calendar className="w-5 h-5 text-zinc-600" />
            </div>
            <div>
              <h3 className="font-semibold">{t.settings.account}</h3>
              <p className="text-sm text-zinc-500">
                {t.settings.joined} {new Date(user.created_at).toLocaleDateString('en-US', {
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
