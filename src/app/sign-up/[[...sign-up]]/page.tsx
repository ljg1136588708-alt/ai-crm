'use client';
import { SignUp } from '@clerk/nextjs';
import { useSearchParams } from 'next/navigation';

export default function SignUpPage() {
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get('redirect_url') || '/dashboard';

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-50">
      <SignUp forceRedirectUrl={redirectUrl} fallbackRedirectUrl={redirectUrl} />
    </div>
  );
}
