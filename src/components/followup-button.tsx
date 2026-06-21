'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Sparkles, Loader2, AlertTriangle } from 'lucide-react';

export function GenerateFollowupsButton() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ message?: string; generated?: number; errors?: string[] } | null>(null);
  const router = useRouter();

  const handleGenerate = async () => {
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch('/api/followups/generate', { method: 'POST' });
      const data = await res.json();
      setResult(data);
      router.refresh();
    } catch {
      setResult({ message: 'Network error — please try again' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Button onClick={handleGenerate} disabled={loading} size="sm">
        {loading ? (
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
        ) : (
          <Sparkles className="w-4 h-4 mr-2" />
        )}
        {loading ? 'Generating…' : 'Generate Reminders'}
      </Button>
      {result && (
        <div className="mt-3 p-3 rounded-lg bg-zinc-50 border text-sm">
          <p className="font-medium mb-1">{result.message}</p>
          {result.generated != null && (
            <p className="text-zinc-500">{result.generated} reminder(s) created</p>
          )}
          {result.errors && result.errors.length > 0 && (
            <div className="mt-2 space-y-1">
              <p className="text-amber-700 text-xs font-medium flex items-center gap-1">
                <AlertTriangle size={12} />
                AI draft errors ({result.errors.length}):
              </p>
              {result.errors.map((e, i) => (
                <p key={i} className="text-xs text-red-600 break-all">{e}</p>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
