import { useCallback, useEffect, useState } from "react";
import { rooms_list_enrolled } from "../api";
import { EmptyState, LoadingSpinner } from "../components/Shared";
import { RoomCardList } from "../components/SCREEN018/RoomCardList";
import type { RoomSummary } from "../components/SCREEN018/RoomCard";
import { RoomCardSkeletonList } from "../components/SCREEN018/RoomCardSkeleton";
import { ErrorBanner } from "../components/SCREEN018/ErrorBanner";

/** Student — Rooms Home (/student): enrolled rooms with attendance, coursework, quizzes, grades, results. */
export function SCREEN018() {
  const [rooms, setRooms] = useState<RoomSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setRooms(await rooms_list_enrolled());
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <header className="mb-6">
        <h1 className="text-2xl font-semibold text-slate-900">Your rooms</h1>
        <p className="muted mt-1 text-sm">
          Rooms you are enrolled in — attendance, coursework, quizzes, grades, and term results.
        </p>
      </header>

      {loading ? (
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <LoadingSpinner />
            <span className="muted text-sm">Loading rooms…</span>
          </div>
          <RoomCardSkeletonList />
        </div>
      ) : error ? (
        <ErrorBanner message={error.message} onRetry={() => void load()} />
      ) : rooms.length === 0 ? (
        <EmptyState>You have not been enrolled in any rooms yet.</EmptyState>
      ) : (
        <RoomCardList rooms={rooms} />
      )}
    </main>
  );
}
