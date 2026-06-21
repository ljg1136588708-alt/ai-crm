import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

export default async function DashboardPage() {
  const { userId } = await auth();
  if (!userId) redirect('/sign-in');

  const stats = { totalDeals: 0, totalValue: 0, followupCount: 0 };

  return (
    <div className="p-8 max-w-7xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold">Pipeline</h1>
          <p className="text-zinc-500 text-sm mt-1">
            {stats.totalDeals} active deals · ${stats.totalValue.toLocaleString()} total value
            {stats.followupCount > 0 && (
              <span className="text-amber-600 ml-2">· {stats.followupCount} need follow-up</span>
            )}
          </p>
        </div>
        <Link href="/dashboard/onboarding">
          <Button variant="outline" size="sm">Connect Gmail</Button>
        </Link>
      </div>

      <Card className="p-16 text-center border-dashed">
        <div className="text-4xl mb-4">📬</div>
        <h2 className="text-xl font-semibold mb-2">Connect your Gmail to get started</h2>
        <p className="text-zinc-500 mb-6 max-w-md mx-auto">
          AI will scan your emails, extract contacts and deals, and build your pipeline automatically. No data entry required.
        </p>
        <Link href="/dashboard/onboarding">
          <Button>Connect Gmail →</Button>
        </Link>
      </Card>
    </div>
  );
}
