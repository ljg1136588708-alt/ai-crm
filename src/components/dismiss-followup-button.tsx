'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

export function DismissFollowupButton({ followupId }: { followupId: string }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleDismiss = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setLoading(true);
    try {
      await fetch('/api/followups/dismiss', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ followupId }),
      });
      router.refresh();
    } catch { /* ignore */ }
    finally { setLoading(false); }
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      className="h-7 w-7 p-0 text-zinc-400 hover:text-zinc-600"
      onClick={handleDismiss}
      disabled={loading}
    >
      <X size={14} />
    </Button>
  );
}
