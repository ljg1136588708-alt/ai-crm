import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Settings, Mail } from 'lucide-react';

export default async function SettingsPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  return (
    <div className="p-8 max-w-3xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-zinc-500 text-sm mt-1">Manage your account and integrations</p>
      </div>

      <div className="space-y-6">
        <Card className="p-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-10 h-10 rounded-lg bg-violet-100 flex items-center justify-center">
              <Mail className="w-5 h-5 text-violet-600" />
            </div>
            <div>
              <h3 className="font-semibold">Gmail Connection</h3>
              <p className="text-sm text-zinc-500">Not connected</p>
            </div>
          </div>
          <Button variant="outline" size="sm">Connect Gmail</Button>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-10 h-10 rounded-lg bg-zinc-100 flex items-center justify-center">
              <Settings className="w-5 h-5 text-zinc-600" />
            </div>
            <div>
              <h3 className="font-semibold">Plan</h3>
              <p className="text-sm text-zinc-500">Free Trial · 14 days remaining</p>
            </div>
          </div>
          <Button variant="outline" size="sm">Upgrade to Pro</Button>
        </Card>
      </div>
    </div>
  );
}
