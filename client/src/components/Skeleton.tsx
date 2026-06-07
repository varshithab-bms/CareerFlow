
export function Skeleton({ className = "" }: { className?: string }) {
  return (
    <div className={`bg-slate-200 animate-pulse rounded ${className}`} />
  );
}

export function SkeletonCard() {
  return <Skeleton className="h-32 w-full rounded-2xl" />;
}

export function SkeletonText({ lines = 3 }: { lines?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          className={`h-4 ${
            i === lines - 1 ? "w-2/3" : "w-full"
          }`}
        />
      ))}
    </div>
  );
}
