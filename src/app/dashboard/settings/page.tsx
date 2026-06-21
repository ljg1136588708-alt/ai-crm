import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { getServiceClient } from '@/lib/supabase/client';
import { Mail, CreditCard, Calendar, CheckCircle2 } from 'lucide-react';

export default async function SettingsPage() {
  const { userId } = await auth();
  if (!userId) redirect('/sign-in');

  const supabase = getServiceClient();
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
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-zinc-500 text-sm mt-1">Manage your account and integrations</p>
      </div>

      <div className="space-y-6">
        {/* Gmail */}
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${user.gmail_connected ? 'bg-emerald-100' : 'bg-zinc-100'}`}>
                <Mail className={`w-5 h-5 ${user.gmail_connected ? 'text-emerald-600' : 'text-zinc-400'}`} />
              </div>
              <div>
                <h3 className="font-semibold">Gmail Connection</h3>
                <p className="text-sm text-zinc-500">
                  {user.gmail_connected
                    ? `Connected as ${user.gmail_email}`
                    : 'Not connected'}
                </p>
              </div>
            </div>
            {user.gmail_connected ? (
              <Badge variant="outline" className="text-emerald-700 border-emerald-300 bg-emerald-50">
                <CheckCircle2 size={12} className="mr-1" />
                Connected
              </Badge>
            ) : (
              <Link href="/dashboard/onboarding">
                <Button variant="outline" size="sm">Connect Gmail</Button>
              </Link>
            )}
          </div>
        </Card>

        {/* Plan */}
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-violet-100 flex items-center justify-center">
                <CreditCard className="w-5 h-5 text-violet-600" />
              </div>
              <div>
                <h3 className="font-semibold">Plan</h3>
                <p className="text-sm text-zinc-500">
                  {user.plan === 'trial' ? 'Free Trial' : user.plan}
                  {trialDays != null && (
                    <span className="flex items-center gap-1 mt-0.5">
                      <Calendar size={11} />
                      {trialDays > 0
                        ? `${trialDays} day${trialDays !== 1 ? 's' : ''} remaining`
                        : 'Trial expired'}
                    </span>
                  )}
                </p>
              </div>
            </div>
            <Button variant="outline" size="sm">Upgrade to Pro</Button>
          </div>
        </Card>

        {/* Account info */}
        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-lg bg-zinc-100 flex items-center justify-center">
              <Calendar className="w-5 h-5 text-zinc-600" />
            </div>
            <div>
              <h3 className="font-semibold">Account</h3>
              <p className="text-sm text-zinc-500">
                Joined {new Date(user.created_at).toLocaleDateString('en-US', {
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
