import { SignUp } from '@clerk/nextjs';

export default function SignUpPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-50">
      <SignUp forceRedirectUrl="/dashboard/onboarding" fallbackRedirectUrl="/dashboard/onboarding" />
    </div>
  );
}
