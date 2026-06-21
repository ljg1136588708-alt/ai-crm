import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

import { Card } from '@/components/ui/card';
import { Users } from 'lucide-react';

export default async function ContactsPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  return (
    <div className="p-8 max-w-7xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold">Contacts</h1>
          <p className="text-zinc-500 text-sm mt-1">Automatically extracted from your emails</p>
        </div>
      </div>

      <Card className="p-16 text-center border-dashed">
        <div className="w-16 h-16 rounded-2xl bg-violet-100 flex items-center justify-center mx-auto mb-4">
          <Users className="w-8 h-8 text-violet-600" />
        </div>
        <h2 className="text-lg font-semibold mb-2">No contacts yet</h2>
        <p className="text-zinc-500 text-sm">
          Connect your Gmail and AI will automatically extract contacts from your conversations.
        </p>
      </Card>
    </div>
  );
}
