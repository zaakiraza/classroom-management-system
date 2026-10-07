/** Loading placeholder shaped like a room card. */
export function RoomCardSkeleton() {
  return (
    <div className="card flex flex-col gap-4" aria-hidden="true">
      <div className="flex items-start justify-between gap-3">
        <div className="w-full space-y-2">
          <div className="h-5 w-2/3 animate-pulse rounded bg-slate-200" />
          <div className="h-3 w-1/3 animate-pulse rounded bg-slate-100" />
        </div>
        <div className="h-5 w-16 shrink-0 animate-pulse rounded-full bg-slate-100" />
      </div>
      <div className="flex flex-wrap gap-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-8 w-24 animate-pulse rounded-md bg-slate-100" />
        ))}
      </div>
    </div>
  );
}

/** Skeleton grid matching RoomCardList's layout. */
export function RoomCardSkeletonList({ count = 6 }: { count?: number }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
        <RoomCardSkeleton key={i} />
      ))}
    </div>
  );
}
