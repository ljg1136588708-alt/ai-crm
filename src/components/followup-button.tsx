'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Sparkles, Loader2 } from 'lucide-react';

export function GenerateFollowupsButton() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/followups/generate', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        router.refresh();
      } else {
        alert(data.error || 'Failed to generate reminders');
      }
    } catch {
      alert('Failed to generate reminders — please try again');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button onClick={handleGenerate} disabled={loading} size="sm">
      {loading ? (
        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
      ) : (
        <Sparkles className="w-4 h-4 mr-2" />
      )}
      {loading ? 'Generating…' : 'Generate Reminders'}
    </Button>
  );
}
