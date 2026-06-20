export const dynamic = 'force-dynamic';

export default function SignUpPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-50">
      <div className="text-center p-8 max-w-sm">
        <h1 className="text-2xl font-bold mb-4">Sign Up</h1>
        <p className="text-zinc-500 text-sm mb-6">
          Authentication coming soon. Clerk integration is ready — just needs API keys configured.
        </p>
        <a href="/" className="text-violet-600 text-sm hover:underline">← Back to home</a>
      </div>
    </div>
  );
}
