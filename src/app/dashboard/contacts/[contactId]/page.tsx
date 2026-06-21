import { auth } from '@clerk/nextjs/server';
import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { getServiceClient } from '@/lib/supabase/client';
import { getContact, getDeals, getEmailsForContact, getFollowups } from '@/lib/supabase/queries';
import { getServerT } from '@/lib/i18n-server';
import { ArrowLeft, Mail, Building2, Briefcase, CircleDollarSign, Clock, Calendar } from 'lucide-react';
import type { DealStage } from '@/types';

const STAGE_COLORS: Record<DealStage, string> = {
  lead: 'bg-amber-50 text-amber-700 border-amber-200',
  contacted: 'bg-blue-50 text-blue-700 border-blue-200',
  negotiation: 'bg-violet-50 text-violet-700 border-violet-200',
  won: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  lost: 'bg-zinc-50 text-zinc-400 border-zinc-200',
};

export default async function ContactDetailPage({
  params,
}: {
  params: Promise<{ contactId: string }>;
}) {
  const { userId } = await auth();
  if (!userId) redirect('/sign-in');

  const [t, supabase] = [await getServerT(), getServiceClient()];

  const { data: user } = await supabase
    .from('users')
    .select('id')
    .eq('clerk_id', userId)
    .single();

  if (!user) redirect('/sign-in');

  const { contactId } = await params;

  const [contact, deals, emails, followups] = await Promise.all([
    getContact(user.id, contactId),
    getDeals(user.id),
    getEmailsForContact(user.id, contactId),
    getFollowups(user.id),
  ]);

  if (!contact) notFound();

  const contactDeals = (deals as any[]).filter((d) => d.contact_id === contactId);
  const contactFollowups = (followups as any[]).filter((f: any) => f.contact_id === contactId);

  return (
    <div className="p-8 max-w-7xl">
      <Link href="/dashboard/contacts" className="inline-flex items-center gap-1 text-sm text-zinc-400 hover:text-zinc-600 mb-6 transition-colors">
        <ArrowLeft size={14} />
        {t.contactDetail.back}
      </Link>

      <div className="flex items-start justify-between mb-8">
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 rounded-full bg-gradient-to-br from-violet-400 to-indigo-500 flex items-center justify-center text-white font-bold text-xl shrink-0">
            {(contact.name || contact.email || '?')[0].toUpperCase()}
          </div>
          <div>
            <h1 className="text-2xl font-bold">{contact.name || contact.email}</h1>
            <div className="flex flex-wrap items-center gap-3 text-sm text-zinc-500 mt-1">
              {contact.email && (
                <span className="flex items-center gap-1">
                  <Mail size={13} /> {contact.email}
                </span>
              )}
              {contact.company && (
                <span className="flex items-center gap-1">
                  <Building2 size={13} /> {contact.company}
                </span>
              )}
              {contact.title && (
                <span className="flex items-center gap-1">
                  <Briefcase size={13} /> {contact.title}
                </span>
              )}
            </div>
            {contact.last_contacted_at && (
              <p className="text-xs text-zinc-400 mt-2 flex items-center gap-1">
                <Clock size={11} />
                {t.contactDetail.lastContact} {new Date(contact.last_contacted_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-3">
            {t.contactDetail.deals} ({contactDeals.length})
          </h2>
          {contactDeals.length === 0 ? (
            <Card className="p-8 text-center border-dashed">
              <p className="text-zinc-400 text-sm">{t.contactDetail.noDeals}</p>
            </Card>
          ) : (
            <div className="grid gap-3">
              {contactDeals.map((deal: any) => (
                <Card key={deal.id} className="p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium">{deal.title}</h3>
                      <div className="flex items-center gap-3 mt-1">
                        <Badge variant="outline" className={`text-xs border ${STAGE_COLORS[deal.stage as DealStage]}`}>
                          {t.dashboard.stages[deal.stage as DealStage]}
                        </Badge>
                        {deal.amount && (
                          <span className="text-sm text-zinc-500 flex items-center gap-1">
                            <CircleDollarSign size={13} />
                            ${deal.amount.toLocaleString()}
                          </span>
                        )}
                        {deal.confidence && (
                          <div className="flex items-center gap-1">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <div key={i} className={`h-1.5 w-5 rounded-full ${i < deal.confidence ? 'bg-violet-400' : 'bg-zinc-100'}`} />
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                    {deal.last_activity_at && (
                      <span className="text-xs text-zinc-400">
                        {new Date(deal.last_activity_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </span>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          )}

          {contactFollowups.length > 0 && (
            <>
              <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-3 mt-6">
                {t.contactDetail.followupsNeeded}
              </h2>
              <div className="space-y-2">
                {contactFollowups.map((f: any) => (
                  <Card key={f.id} className="p-3 border-amber-200 bg-amber-50/50">
                    <p className="text-sm text-amber-800">{f.reason}</p>
                    {f.draft_email_subject && (
                      <p className="text-xs text-amber-600 mt-1">
                        {t.contactDetail.draft} {f.draft_email_subject}
                      </p>
                    )}
                  </Card>
                ))}
              </div>
            </>
          )}
        </div>

        <div>
          <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-3">
            {t.contactDetail.emailHistory} ({emails.length})
          </h2>
          {emails.length === 0 ? (
            <Card className="p-8 text-center border-dashed">
              <p className="text-zinc-400 text-sm">{t.contactDetail.noEmailHistory}</p>
            </Card>
          ) : (
            <div className="space-y-3">
              {emails.map((email: any) => (
                <Card key={email.id} className="p-3">
                  <p className="text-xs font-medium truncate">{email.subject || t.contactDetail.noSubject}</p>
                  <p className="text-xs text-zinc-500 mt-0.5 line-clamp-2">{email.snippet}</p>
                  <div className="flex items-center justify-between mt-2">
                    <Badge variant="outline" className={`text-[10px] ${email.direction === 'inbound' ? 'text-blue-600' : 'text-emerald-600'}`}>
                      {email.direction === 'inbound' ? t.contactDetail.received : t.contactDetail.sent}
                    </Badge>
                    {email.sent_at && (
                      <span className="text-[10px] text-zinc-400 flex items-center gap-0.5">
                        <Calendar size={10} />
                        {new Date(email.sent_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </span>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
