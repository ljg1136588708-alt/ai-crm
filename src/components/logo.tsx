// Brand logo: a violet rounded square (the "photo") with a sparkle ("AI magic").
export function Logo({ showText = true, className = '' }: { showText?: boolean; className?: string }) {
  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      <svg width="28" height="28" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <rect x="2" y="2" width="28" height="28" rx="8" fill="url(#aifoto-logo-grad)" />
        {/* main sparkle */}
        <path
          d="M15 8.5c.3 0 .56.2.65.49l1.06 3.3 3.3 1.06a.68.68 0 0 1 0 1.3l-3.3 1.06-1.06 3.3a.68.68 0 0 1-1.3 0l-1.06-3.3-3.3-1.06a.68.68 0 0 1 0-1.3l3.3-1.06 1.06-3.3A.68.68 0 0 1 15 8.5Z"
          fill="white"
        />
        {/* small sparkle */}
        <circle cx="22.5" cy="21.5" r="1.6" fill="white" fillOpacity="0.95" />
        <defs>
          <linearGradient id="aifoto-logo-grad" x1="2" y1="2" x2="30" y2="30" gradientUnits="userSpaceOnUse">
            <stop stopColor="#8b5cf6" />
            <stop offset="1" stopColor="#6d28d9" />
          </linearGradient>
        </defs>
      </svg>
      {showText && <span className="text-xl font-bold tracking-tight">AI Foto</span>}
    </span>
  );
}
