import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { quizzes_list } from "../api";
import type { QuizzesListResponse } from "../generated/types";
import { useRouteId } from "../route-params";
import { Card, EmptyState, ErrorMessage, LoadingSpinner } from "../components/Shared";

const ghostClasses =
  "inline-flex items-center rounded-md border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700 transition-colors hover:border-emerald-600 hover:bg-emerald-50 hover:text-emerald-800 disabled:cursor-not-allowed disabled:opacity-60";

/** Student — Room Quizzes (/student/rooms/{id}/quizzes): the quizzes posted in a room. */
export function SCREEN020() {
  const roomId = useRouteId();
  const [items, setItems] = useState<QuizzesListResponse>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setItems(await quizzes_list(roomId));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load the quizzes.");
    } finally {
      setLoading(false);
    }
  }, [roomId]);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
      <header className="mb-6">
        <h1 className="text-2xl font-semibold text-slate-900">Room quizzes</h1>
        <p className="mt-1 text-sm text-slate-500">Room {roomId} — everything your teacher has posted.</p>
      </header>

      {loading ? (
        <div className="flex items-center gap-3">
          <LoadingSpinner />
          <span className="text-sm text-slate-500">Loading quizzes…</span>
        </div>
      ) : error ? (
        <Card>
          <ErrorMessage>{error}</ErrorMessage>
          <button type="button" onClick={() => void load()} className={ghostClasses + " mt-3"}>
            Try again
          </button>
        </Card>
      ) : items.length === 0 ? (
        <EmptyState>No quizzes have been posted in this room yet.</EmptyState>
      ) : (
        <ul className="space-y-4">
          {items.map((quiz) => {
            const questionCount = (quiz.questions ?? []).length;
            return (
              <li key={quiz.id}>
                <Card className="flex flex-wrap items-center justify-between gap-3 p-5">
                  <div className="min-w-0">
                    <h2 className="text-base font-semibold text-slate-900">{quiz.title}</h2>
                    <p className="muted mt-1 text-xs">
                      Closes {new Date(quiz.closesAt).toLocaleString()}
                      {questionCount > 0 ? ` · ${questionCount} question${questionCount === 1 ? "" : "s"}` : ""}
                    </p>
                  </div>
                  <Link to={`/student/quizzes/${quiz.id}/attempt`} className={ghostClasses}>
                    {quiz.publishedAt ? "Take quiz" : "Preview"}
                  </Link>
                </Card>
              </li>
            );
          })}
        </ul>
      )}
    </main>
  );
}
