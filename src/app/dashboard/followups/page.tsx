import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { getServiceClient } from '@/lib/supabase/client';
import { getFollowups } from '@/lib/supabase/queries';
import { ArrowLeft, Mail, Clock, AlertCircle, CheckCircle2 } from 'lucide-react';
import { GenerateFollowupsButton } from '@/components/followup-button';

export default async function FollowupsPage() {
  const { userId } = await auth();
  if (!userId) redirect('/sign-in');

  const supabase = getServiceClient();
  const { data: user } = await supabase
    .from('users')
    .select('id')
    .eq('clerk_id', userId)
    .single();

  if (!user) redirect('/sign-in');

  const followups = await getFollowups(user.id);
  const activeFollowups = followups.filter((f: any) => !f.is_dismissed);

  return (
    <div className="p-8 max-w-7xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Link href="/dashboard" className="text-sm text-zinc-400 hover:text-zinc-600 transition-colors">
              ← Pipeline
            </Link>
          </div>
          <h1 className="text-2xl font-bold">Follow-ups</h1>
          <p className="text-zinc-500 text-sm mt-1">
            {activeFollowups.length} reminder{activeFollowups.length !== 1 ? 's' : ''}
            {(() => {
              const withDrafts = activeFollowups.filter((f: any) => f.draft_email_body).length;
              return withDrafts > 0 ? ` — ${withDrafts} with AI drafts` : '';
            })()}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <GenerateFollowupsButton />
        </div>
      </div>

      {activeFollowups.length === 0 ? (
        <Card className="p-16 text-center border-dashed">
          <div className="w-16 h-16 rounded-2xl bg-amber-100 flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-8 h-8 text-amber-600" />
          </div>
          <h2 className="text-lg font-semibold mb-2">All caught up!</h2>
          <p className="text-zinc-500 text-sm mb-4">
            No follow-up reminders right now. Click "Generate" to let AI scan for contacts needing attention.
          </p>
          <GenerateFollowupsButton />
        </Card>
      ) : (
        <div className="space-y-4">
          {activeFollowups.map((f: any) => (
            <Card key={f.id} className="p-5 border-l-4 border-l-amber-400 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-300 to-orange-400 flex items-center justify-center text-white font-semibold text-xs shrink-0">
                      {(f.contactName || f.contactEmail || '?')[0]?.toUpperCase()}
                    </div>
                    <div>
                      <h3 className="font-medium text-sm">
                        {f.contactName || f.contactEmail || 'Unknown'}
                      </h3>
                      {f.contactCompany && (
                        <p className="text-xs text-zinc-500">{f.contactCompany}</p>
                      )}
                    </div>
                    {f.dealTitle && (
                      <Badge variant="secondary" className="text-xs ml-auto shrink-0">
                        {f.dealTitle}
                      </Badge>
                    )}
                  </div>

                  <div className="flex items-center gap-2 mb-3">
                    <AlertCircle size={14} className="text-amber-500 shrink-0" />
                    <p className="text-sm text-zinc-700">{f.reason}</p>
                  </div>

                  {f.draft_email_body && (
                    <div className="bg-zinc-50 rounded-lg p-4 border">
                      {f.draft_email_subject && (
                        <p className="text-xs font-semibold text-zinc-500 mb-2">
                          Subject: {f.draft_email_subject}
                        </p>
                      )}
                      <p className="text-sm text-zinc-600 whitespace-pre-line leading-relaxed">
                        {f.draft_email_body}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between mt-4 pt-3 border-t border-zinc-100">
                <span className="flex items-center gap-1 text-xs text-zinc-400">
                  <Clock size={11} />
                  {new Date(f.created_at).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                  })}
                </span>

                {f.draft_email_body && (
                  <a
                    href={`https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(f.contactEmail || '')}&su=${encodeURIComponent(f.draft_email_subject || '')}&body=${encodeURIComponent(f.draft_email_body)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs text-violet-600 hover:text-violet-800 font-medium transition-colors"
                  >
                    <Mail size={12} />
                    Open in Gmail
                  </a>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
