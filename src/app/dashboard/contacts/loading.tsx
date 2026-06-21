export default function Loading() {
  return (
    <div className="p-8 max-w-7xl animate-pulse">
      <div className="h-8 w-36 bg-zinc-200 rounded mb-2" />
      <div className="h-4 w-56 bg-zinc-100 rounded mb-8" />
      <div className="h-10 bg-zinc-100 rounded-lg mb-6" />
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="p-4 rounded-xl border border-zinc-100 flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-zinc-100" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-40 bg-zinc-100 rounded" />
              <div className="h-3 w-64 bg-zinc-50 rounded" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
