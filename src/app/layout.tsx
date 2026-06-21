import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'AI CRM — The CRM that fills itself',
  description: 'Connect your Gmail, and your pipeline builds automatically.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="antialiased">
      <body className="min-h-screen bg-white text-zinc-900">{children}</body>
    </html>
  );
}
