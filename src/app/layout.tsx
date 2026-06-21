import type { Metadata } from 'next';
import { ClerkProvider } from '@clerk/nextjs';
import './globals.css';

export const metadata: Metadata = {
  title: 'AI CRM — The CRM that fills itself',
  description: 'Connect your Gmail, and your pipeline builds automatically.',
  openGraph: {
    title: 'AI CRM — The CRM that fills itself',
    description: 'Connect your Gmail, and your pipeline builds automatically.',
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
      <html lang="en" className="antialiased">
        <body className="min-h-screen bg-white text-zinc-900">
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
