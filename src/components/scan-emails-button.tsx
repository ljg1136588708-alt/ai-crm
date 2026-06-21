'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { useT } from '@/components/locale-provider';
import { ScanLine, Loader2, Sparkles } from 'lucide-react';

export function ScanEmailsButton() {
  const [scanning, setScanning] = useState(false);
  const router = useRouter();
  const t = useT();

  const handleScan = async () => {
    setScanning(true);
    try {
      const res = await fetch('/api/gmail/scan', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        router.refresh();
      } else {
        alert(data.error || 'Scan failed');
      }
    } catch {
      alert('Scan failed — please try again');
    } finally {
      setScanning(false);
    }
  };

  return (
    <Button onClick={handleScan} disabled={scanning} variant="outline" size="sm">
      {scanning ? (
        <Loader2 className="w-3 h-3 mr-1 animate-spin" />
      ) : (
        <ScanLine className="w-3 h-3 mr-1" />
      )}
      {scanning ? t.dashboard.scanning : t.dashboard.scanEmails}
    </Button>
  );
}

export function SeedDemoButton() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const t = useT();

  const handleSeed = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/seed', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        router.refresh();
      } else {
        alert(data.error || 'Seed failed');
      }
    } catch {
      alert('Seed failed — please try again');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button onClick={handleSeed} disabled={loading} size="default">
      {loading ? (
        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
      ) : (
        <Sparkles className="w-4 h-4 mr-2" />
      )}
      {loading ? t.common.loading : t.dashboard.loadDemo}
    </Button>
  );
}
