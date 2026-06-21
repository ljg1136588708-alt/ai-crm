'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ScanLine, Loader2 } from 'lucide-react';

export function ScanEmailsButton() {
  const [scanning, setScanning] = useState(false);
  const router = useRouter();

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
      {scanning ? 'Scanning…' : 'Scan Emails'}
    </Button>
  );
}
