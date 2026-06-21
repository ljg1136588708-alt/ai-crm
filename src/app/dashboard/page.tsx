import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { getServiceClient } from '@/lib/supabase/client';
import { getPipelineStats, getDeals } from '@/lib/supabase/queries';
import { ScanEmailsButton, SeedDemoButton } from '@/components/scan-emails-button';
import { Mail, CircleDollarSign, User, Building2 } from 'lucide-react';
import { getServerT } from '@/lib/i18n-server';
import type { DealStage } from '@/types';

const STAGE_COLORS: Record<DealStage, string> = {
  lead: 'bg-amber-50 text-amber-700 border-amber-200',
  contacted: 'bg-blue-50 text-blue-700 border-blue-200',
  negotiation: 'bg-violet-50 text-violet-700 border-violet-200',
  won: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  lost: 'bg-zinc-50 text-zinc-400 border-zinc-200',
};

export default async function DashboardPage() {
  const { userId } = await auth();
  if (!userId) redirect('/sign-in');

  const [t, supabase] = [await getServerT(), getServiceClient()];

  const { data: user } = await supabase
    .from('users')
    .select('id, gmail_connected, gmail_email')
    .eq('clerk_id', userId)
    .single();

  if (!user) {
    return (
      <div className="p-8 max-w-7xl">
        <h1 className="text-2xl font-bold">{t.dashboard.pipeline}</h1>
        <p className="text-zinc-500 mt-2">{t.common.settingUp}</p>
      </div>
    );
  }

  if (!user.gmail_connected) {
    return (
      <div className="p-8 max-w-7xl">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold">{t.dashboard.pipeline}</h1>
            <p className="text-zinc-500 text-sm mt-1">{t.dashboard.noGmailDesc}</p>
          </div>
        </div>
        <Card className="p-16 text-center border-dashed">
          <div className="text-4xl mb-4">📬</div>
          <h2 className="text-xl font-semibold mb-2">{t.dashboard.noGmailTitle}</h2>
          <p className="text-zinc-500 mb-6 max-w-md mx-auto">{t.dashboard.noGmailCardDesc}</p>
          <Link href="/dashboard/onboarding">
            <Button>
              <Mail className="w-4 h-4 mr-2" />
              {t.dashboard.connectGmail}
            </Button>
          </Link>
        </Card>
      </div>
    );
  }

  const [stats, deals] = await Promise.all([
    getPipelineStats(user.id),
    getDeals(user.id),
  ]);

  if (stats.totalDeals === 0) {
    return (
      <div className="p-8 max-w-7xl">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold">{t.dashboard.pipeline}</h1>
            <p className="text-zinc-500 text-sm mt-1">
              {t.dashboard.gmailConnected} {user.gmail_email}
            </p>
          </div>
          <Link href="/dashboard/onboarding">
            <Button variant="ghost" size="sm">
              <Mail className="w-3 h-3 mr-1" />
              {user.gmail_email}
            </Button>
          </Link>
        </div>
        <Card className="p-16 text-center border-dashed">
          <div className="text-4xl mb-4">🤖</div>
          <h2 className="text-xl font-semibold mb-2">{t.dashboard.readyScan}</h2>
          <p className="text-zinc-500 mb-6 max-w-md mx-auto">{t.dashboard.readyScanDesc}</p>
          <div className="flex items-center justify-center gap-3">
            <ScanEmailsButton />
            <SeedDemoButton />
          </div>
        </Card>
      </div>
    );
  }

  const stages: DealStage[] = ['lead', 'contacted', 'negotiation', 'won', 'lost'];

  return (
    <div className="p-8 max-w-7xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold">{t.dashboard.pipeline}</h1>
          <p className="text-zinc-500 text-sm mt-1">
            {stats.totalDeals} {t.dashboard.activeDeals} · ${stats.totalValue.toLocaleString()} {t.dashboard.totalValue}
            {stats.followupCount > 0 && (
              <span className="text-amber-600 ml-2">· {stats.followupCount} {t.dashboard.needFollowup}</span>
            )}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <ScanEmailsButton />
          <SeedDemoButton />
          <Link href="/dashboard/contacts">
            <Button variant="outline" size="sm">{t.dashboard.contacts}</Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {stages.map((stage) => {
          const stageDeals = (deals as any[]).filter((d) => d.stage === stage);
          return (
            <div key={stage} className="min-h-[200px]">
              <div className="flex items-center justify-between mb-3 px-1">
                <span className="text-sm font-medium text-zinc-600">{t.dashboard.stages[stage]}</span>
                <Badge variant="secondary" className="text-xs">
                  {stats.stageCounts[stage]}
                </Badge>
              </div>
              <div className="space-y-3">
                {stageDeals.map((deal: any) => (
                  <Link key={deal.id} href={`/dashboard/contacts/${deal.contact_id || ''}`}>
                    <Card className="p-3 hover:shadow-md transition-shadow cursor-pointer">
                      <h4 className="font-medium text-sm mb-1">{deal.title}</h4>
                      {deal.amount && (
                        <div className="flex items-center gap-1 text-xs text-zinc-500 mb-1">
                          <CircleDollarSign size={12} />
                          ${deal.amount.toLocaleString()}
                        </div>
                      )}
                      {deal.contactName && (
                        <div className="flex items-center gap-1 text-xs text-zinc-400">
                          <User size={12} />
                          {deal.contactName}
                          {deal.contactCompany && (
                            <span className="flex items-center gap-0.5 ml-1">
                              <Building2 size={10} />
                              {deal.contactCompany}
                            </span>
                          )}
                        </div>
                      )}
                      {deal.confidence && (
                        <div className="mt-2 flex gap-1">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <div key={i} className={`h-1 w-4 rounded-full ${i < deal.confidence ? 'bg-violet-400' : 'bg-zinc-100'}`} />
                          ))}
                        </div>
                      )}
                    </Card>
                  </Link>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
