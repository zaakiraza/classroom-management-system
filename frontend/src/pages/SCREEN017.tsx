import { useCallback, useEffect, useState } from "react";
import { notifications_list, notifications_mark_read } from "../api";
import type { NotificationsListResponse } from "../generated/types";
import { EmptyState, ErrorMessage, LoadingSpinner } from "../components/Shared";
import { ErrorBanner } from "../components/SCREEN017/ErrorBanner";
import { MarkAllButton } from "../components/SCREEN017/MarkAllButton";
import { NotificationList } from "../components/SCREEN017/NotificationList";
import { UnreadBadge } from "../components/SCREEN017/UnreadBadge";

/** Notifications (/notifications): in-app list with unread badge, mark-read and mark-all. */
export function SCREEN017() {
  const [data, setData] = useState<NotificationsListResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [actionError, setActionError] = useState<Error | null>(null);
  const [markingAll, setMarkingAll] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setData(await notifications_list());
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Unexpected error"));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const refresh = useCallback(async () => {
    try {
      setData(await notifications_list());
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Unexpected error"));
    }
  }, []);

  const markOne = useCallback(
    async (id: string) => {
      setActionError(null);
      setBusyId(id);
      try {
        await notifications_mark_read({ ids: [id] });
        await refresh();
      } catch (err) {
        setActionError(err instanceof Error ? err : new Error("Unexpected error"));
      } finally {
        setBusyId(null);
      }
    },
    [refresh],
  );

  const markAll = useCallback(async () => {
    setActionError(null);
    setMarkingAll(true);
    try {
      await notifications_mark_read({});
      await refresh();
    } catch (err) {
      setActionError(err instanceof Error ? err : new Error("Unexpected error"));
    } finally {
      setMarkingAll(false);
    }
  }, [refresh]);

  const unreadCount = data?.unreadCount ?? 0;
  const items = data?.notifications ?? [];
  const showEmpty = !loading && !error && items.length === 0;

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
      <header className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Notifications</h1>
          <p className="mt-1 text-sm text-slate-500">
            Updates from your rooms: assignments, quizzes, announcements, and results.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <UnreadBadge count={unreadCount} />
          <MarkAllButton unreadCount={unreadCount} busy={markingAll} onMarkAll={markAll} />
        </div>
      </header>

      {error ? <ErrorBanner message={error.message} onRetry={load} className="mb-6" /> : null}
      {actionError ? (
        <ErrorMessage>{actionError.message}</ErrorMessage>
      ) : null}

      {loading ? (
        <div className="mb-4 flex justify-center">
          <LoadingSpinner />
        </div>
      ) : null}

      {items.length > 0 || loading ? (
        <NotificationList items={items} loading={loading} busyId={busyId} onMarkRead={markOne} />
      ) : null}

      {showEmpty ? (
        <div className="card flex flex-col items-center gap-2 py-12 text-center">
          <span className="material-symbols-outlined text-3xl text-slate-400" aria-hidden="true">
            notifications_off
          </span>
          <EmptyState>No notifications yet.</EmptyState>
        </div>
      ) : null}
    </main>
  );
}
