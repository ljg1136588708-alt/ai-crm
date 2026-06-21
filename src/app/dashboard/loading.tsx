export default function Loading() {
  return (
    <div className="p-8 max-w-7xl animate-pulse">
      <div className="h-8 w-48 bg-zinc-200 rounded mb-2" />
      <div className="h-4 w-64 bg-zinc-100 rounded mb-8" />
      <div className="grid grid-cols-5 gap-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="space-y-3">
            <div className="h-5 w-20 bg-zinc-100 rounded" />
            {Array.from({ length: Math.random() > 0.5 ? 2 : 1 }).map((_, j) => (
              <div key={j} className="p-3 rounded-lg border border-zinc-100">
                <div className="h-4 w-3/4 bg-zinc-100 rounded mb-2" />
                <div className="h-3 w-1/2 bg-zinc-50 rounded" />
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
