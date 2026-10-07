/** Loading placeholder shaped like a room card. */
export function RoomCardSkeleton() {
  return (
    <div className="card flex animate-pulse flex-col gap-4" aria-hidden="true">
      <div className="flex items-start justify-between gap-3">
        <div className="h-5 w-2/3 rounded bg-slate-200" />
        <div className="h-5 w-16 shrink-0 rounded-full bg-slate-200" />
      </div>
      <div className="flex flex-wrap gap-2">
        {["w-32", "w-28", "w-24", "w-28", "w-20", "w-24"].map((width, index) => (
          <div key={index} className={"h-8 rounded-md bg-slate-200 " + width} />
        ))}
      </div>
    </div>
  );
}

/** Row of card skeletons shown while the enrollment list loads. */
export function RoomCardSkeletonList({ count = 3 }: { count?: number }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: count }, (_, index) => (
        <RoomCardSkeleton key={index} />
      ))}
    </div>
  );
}
