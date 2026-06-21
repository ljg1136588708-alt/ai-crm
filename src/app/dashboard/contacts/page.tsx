import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { getServiceClient } from '@/lib/supabase/client';
import { getContacts } from '@/lib/supabase/queries';
import { Users, Search, Mail, Building2, Briefcase, Clock, ArrowRight } from 'lucide-react';

export default async function ContactsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { userId } = await auth();
  if (!userId) redirect('/sign-in');

  const supabase = getServiceClient();
  const { data: user } = await supabase
    .from('users')
    .select('id')
    .eq('clerk_id', userId)
    .single();

  if (!user) {
    return (
      <div className="p-8 max-w-7xl">
        <h1 className="text-2xl font-bold">Contacts</h1>
        <p className="text-zinc-500 mt-2">Setting up your account...</p>
      </div>
    );
  }

  const { q } = await searchParams;
  const contacts = await getContacts(user.id, q);

  // Get deal counts per contact
  const { data: dealCounts } = await supabase
    .from('deals')
    .select('contact_id, stage')
    .eq('user_id', user.id);

  const dealCountMap = new Map<string, { total: number; active: number }>();
  (dealCounts || []).forEach((d: { contact_id: string; stage: string }) => {
    if (!d.contact_id) return;
    const entry = dealCountMap.get(d.contact_id) || { total: 0, active: 0 };
    entry.total++;
    if (d.stage !== 'won' && d.stage !== 'lost') entry.active++;
    dealCountMap.set(d.contact_id, entry);
  });

  return (
    <div className="p-8 max-w-7xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold">Contacts</h1>
          <p className="text-zinc-500 text-sm mt-1">
            {contacts.length} {contacts.length === 1 ? 'contact' : 'contacts'} extracted from your emails
          </p>
        </div>
        <Link href="/dashboard">
          <span className="text-sm text-zinc-400 hover:text-zinc-600 transition-colors">
            ← Back to Pipeline
          </span>
        </Link>
      </div>

      {/* Search */}
      <form className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
        <Input
          name="q"
          placeholder="Search by name, email, or company..."
          defaultValue={q || ''}
          className="pl-10 bg-white"
        />
      </form>

      {contacts.length === 0 ? (
        <Card className="p-16 text-center border-dashed">
          <div className="w-16 h-16 rounded-2xl bg-violet-100 flex items-center justify-center mx-auto mb-4">
            <Users className="w-8 h-8 text-violet-600" />
          </div>
          <h2 className="text-lg font-semibold mb-2">
            {q ? `No contacts matching "${q}"` : 'No contacts yet'}
          </h2>
          <p className="text-zinc-500 text-sm mb-4">
            {q
              ? 'Try a different search term.'
              : 'Connect Gmail or load demo data, and AI will extract contacts from your emails.'}
          </p>
          {!q && (
            <Link href="/dashboard">
              <span className="text-violet-600 text-sm hover:underline">Go to Dashboard →</span>
            </Link>
          )}
        </Card>
      ) : (
        <div className="grid gap-3">
          {contacts.map((contact: any) => {
            const deals = dealCountMap.get(contact.id);
            return (
              <Link key={contact.id} href={`/dashboard/contacts/${contact.id}`}>
                <Card className="p-4 hover:shadow-md transition-all cursor-pointer group">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 min-w-0">
                      {/* Avatar */}
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-400 to-indigo-500 flex items-center justify-center text-white font-semibold text-sm shrink-0">
                        {(contact.name || contact.email || '?')[0].toUpperCase()}
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium truncate">
                            {contact.name || contact.email}
                          </h3>
                          {deals && deals.active > 0 && (
                            <Badge variant="secondary" className="text-xs shrink-0">
                              {deals.active} active deal{deals.active > 1 ? 's' : ''}
                            </Badge>
                          )}
                        </div>

                        <div className="flex items-center gap-3 text-xs text-zinc-500 mt-0.5">
                          {contact.email && (
                            <span className="flex items-center gap-1">
                              <Mail size={12} />
                              {contact.email}
                            </span>
                          )}
                          {contact.company && (
                            <span className="flex items-center gap-1">
                              <Building2 size={12} />
                              {contact.company}
                            </span>
                          )}
                          {contact.title && (
                            <span className="flex items-center gap-1">
                              <Briefcase size={12} />
                              {contact.title}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      {contact.last_contacted_at && (
                        <span className="flex items-center gap-1 text-xs text-zinc-400">
                          <Clock size={12} />
                          {timeAgo(contact.last_contacted_at)}
                        </span>
                      )}
                      <ArrowRight size={16} className="text-zinc-300 group-hover:text-violet-500 transition-colors" />
                    </div>
                  </div>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return 'Today';
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days}d ago`;
  if (days < 30) return `${Math.floor(days / 7)}w ago`;
  return `${Math.floor(days / 30)}mo ago`;
}
